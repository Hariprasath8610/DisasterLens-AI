import os
import re
import logging
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
import httpx

from app.schemas.payloads import AIChatRequest, AIChatResponse
from app.utils.config import settings

logger = logging.getLogger("disasterlens.ai")

DISASTERLENS_SYSTEM_PROMPT = """You are the DisasterLens AI Risk Synthesis Assistant, an expert AI copilot for natural disaster risk intelligence, flood forecasting, and emergency catastrophe operations.

Core Directives:
1. Grounding in Real Data: Base your assessments firmly on the structured DisasterLens environmental telemetry and context provided with the query.
2. Explain Contributing Factors: Explain how hydrological parameters (rainfall rate, river stage, soil saturation, terrain slope, drainage capacity) drive the risk level.
3. Avoid Fabrications: Never invent arbitrary measurements or claim access to unavailable satellite or sensor feeds. Clearly distinguish known telemetry from operational assumptions. If specific data is missing, clearly state that rather than guessing.
4. Numerical Risk Integrity: Do not invent or recalculate the official DisasterLens risk score; numerical risk computation is handled exclusively by the HydroNet physics and risk engine.
5. Actionable Guidance: Provide concise, professional, and actionable recommendations suitable for municipal response teams, district collectors, and emergency services.
6. Concise Synthesis: Keep responses directly focused, informative, and structured within 2 to 3 paragraphs.
"""

def clean_llm_response(text: str) -> str:
    """Strip any <think>...</think> chain-of-thought blocks if present."""
    if not text:
        return ""
    cleaned = re.sub(r"<think>[\s\S]*?</think>", "", text).strip()
    return cleaned if cleaned else text.strip()


class BaseAIService(ABC):
    """
    Abstract Base Interface for DisasterLens AI Reasoning Engine.
    """

    @abstractmethod
    async def generate_response(self, request: AIChatRequest) -> AIChatResponse:
        pass

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        pass


class OllamaAIService(BaseAIService):
    """
    Local Ollama implementation executing Qwen3 8B.
    Connects to the local Ollama API via HTTP without exposing credentials or internal mechanics.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None,
        num_predict: Optional[int] = None
    ):
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")
        self.model = model or settings.ollama_model
        self.timeout = timeout or settings.ollama_timeout
        self.num_predict = num_predict or settings.ollama_num_predict

    def _build_context_prompt(self, request: AIChatRequest) -> str:
        lines = [
            f"[Current DisasterLens Telemetry & Risk Dossier for {request.location or 'Target Area'}]",
            f"- Primary Hazard Type: {request.disasterType or 'Flood'}",
            f"- Composite Risk Score: {request.riskScore if request.riskScore is not None else 'N/A'}/100 ({request.riskLevel or 'ELEVATED'})",
            f"- 24h Precipitation: {request.rainfall} mm" if request.rainfall is not None else "- 24h Precipitation: N/A",
            f"- River Water Stage: {request.riverLevel} m" if request.riverLevel is not None else "- River Water Stage: N/A",
            f"- Soil Saturation Index: {request.soilSaturation}%" if request.soilSaturation is not None else "- Soil Saturation Index: N/A",
        ]
        if request.historicalRisk:
            lines.append(f"- Historical Analogue: {request.historicalRisk}")
        if request.forecast:
            lines.append(f"- Meteorological Forecast: {request.forecast}")
        return "\n".join(lines)

    async def generate_response(self, request: AIChatRequest) -> AIChatResponse:
        query = request.get_query()
        if not query:
            return AIChatResponse(
                response="Please provide a message or scenario question for DisasterLens AI to analyze.",
                confidence=0.0,
                model=self.model,
                contributingFactors=[],
                recommendations=[]
            )

        context_block = self._build_context_prompt(request)
        user_content = f"{context_block}\n\nUser Question:\n{query}"

        messages = [
            {"role": "system", "content": DISASTERLENS_SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.4,
                "top_p": 0.9,
                "num_predict": self.num_predict,
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)

            if res.status_code != 200:
                logger.error(f"Ollama returned HTTP {res.status_code}: {res.text}")
                return AIChatResponse(
                    response=f"Ollama service error (HTTP {res.status_code}). Please verify that model '{self.model}' is installed.",
                    confidence=0.0,
                    model=self.model,
                    contributingFactors=[],
                    recommendations=["Run `ollama list` in terminal to confirm qwen3:8b is available."]
                )

            data = res.json()
            message_obj = data.get("message", {})
            raw_content = message_obj.get("content", "")
            if not raw_content and message_obj.get("thinking"):
                raw_content = message_obj.get("thinking", "")
            cleaned = clean_llm_response(raw_content)

            # Extract contributing factors and recommendations from context
            factors = [
                f"24h Rainfall: {request.rainfall}mm" if request.rainfall is not None else "Precipitation load",
                f"River Stage: {request.riverLevel}m" if request.riverLevel is not None else "Hydraulic level",
                f"Soil Saturation: {request.soilSaturation}%" if request.soilSaturation is not None else "Antecedent saturation"
            ]
            recommendations = [
                f"Monitor drainage culverts in {request.location}",
                "Cross-reference live HydroNet hydrograph before opening tertiary sluices",
                "Maintain emergency team alert standby for low-elevation sectors"
            ]

            return AIChatResponse(
                response=cleaned or "No textual response generated by model.",
                confidence=95.0,
                model=self.model,
                contributingFactors=factors,
                recommendations=recommendations
            )

        except httpx.ConnectError:
            logger.warning(f"Failed to connect to Ollama at {self.base_url}")
            return AIChatResponse(
                response=(
                    f"Ollama is not running. Please start Ollama locally (`ollama serve`) "
                    f"and verify it is reachable at {self.base_url}."
                ),
                confidence=0.0,
                model=self.model,
                contributingFactors=[],
                recommendations=["Start Ollama in terminal", "Verify `ollama run qwen3:8b`"]
            )
        except httpx.TimeoutException:
            logger.warning(f"Ollama request timed out after {self.timeout}s")
            return AIChatResponse(
                response=f"Ollama request timed out after {int(self.timeout)}s. The local Qwen3 8B model is under heavy load; please retry shortly.",
                confidence=0.0,
                model=self.model,
                contributingFactors=[],
                recommendations=["Retry with a more focused query", "Check GPU / CPU utilization"]
            )
        except Exception as e:
            logger.exception(f"Unexpected error communicating with Ollama: {e}")
            return AIChatResponse(
                response=f"Unable to complete AI synthesis due to an unexpected error: {str(e)}",
                confidence=0.0,
                model=self.model,
                contributingFactors=[],
                recommendations=[]
            )

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
            if res.status_code == 200:
                models_data = res.json().get("models", [])
                model_names = [m.get("name", "") for m in models_data]
                is_model_present = any(self.model in name for name in model_names)
                return {
                    "reachable": True,
                    "model_available": is_model_present,
                    "target_model": self.model,
                    "available_models": model_names,
                    "base_url": self.base_url,
                }
            return {
                "reachable": True,
                "model_available": False,
                "error": f"Ollama HTTP {res.status_code}",
                "base_url": self.base_url
            }
        except Exception as e:
            return {
                "reachable": False,
                "model_available": False,
                "error": str(e),
                "base_url": self.base_url
            }


class DevMockAIService(BaseAIService):
    """
    Development fallback provider providing high-fidelity grounded responses 
    for offline testing or when AI_SERVICE_PROVIDER=mock.
    """

    async def generate_response(self, request: AIChatRequest) -> AIChatResponse:
        q = request.get_query().lower()
        if not q:
            return AIChatResponse(
                response="Please provide a query for DisasterLens AI to analyze.",
                confidence=0.0,
                model="DevMock-XAI",
                contributingFactors=[],
                recommendations=[]
            )
        
        if "rain" in q or "break" in q:
            text = (
                f"HydroNet-v4 recalculation for {request.location}: If a 2-hour rain break occurs, "
                f"catchment runoff velocity decelerates by 22%, shifting composite hazard score "
                f"from {request.riskScore}/100 to 58/100 (Level 2 Moderate)."
            )
            factors = ["Convective rain band dampening", "Soil percolation recovery rate"]
            recommendations = ["Hold tertiary canal sluices", "Maintain standby on backup pump generators"]

        elif "katpadi" in q or "underpass" in q or "substation" in q:
            text = (
                f"Topographic profile analysis for {request.location}: Depression at Katpadi Railway underpass "
                f"will accumulate up to 0.65m standing water within 45 minutes of rain band arrival "
                f"if Ward 12 dewatering pumps are unengaged."
            )
            factors = ["Basin depression slope 1.2°", "Impervious surface runoff acceleration"]
            recommendations = ["Deploy 6 high-capacity dewatering pumps", "Divert transit to SH-122"]

        else:
            text = (
                f"DisasterLens AI synthesis for {request.location}: Current precipitation ({request.rainfall}mm) "
                f"and river stage ({request.riverLevel}m) indicate severe water accumulation potential. "
                f"Antecedent soil saturation is at {request.soilSaturation}%. Upstream regulatory discharge "
                f"throttling is mandated to mitigate flash inundation."
            )
            factors = [
                f"24h Rainfall: {request.rainfall}mm",
                f"River Stage: {request.riverLevel}m",
                f"Soil Saturation: {request.soilSaturation}%"
            ]
            recommendations = [
                "Evacuate low-lying riverbank wards",
                "Trigger automated warning sirens in Zone 4",
                "Alert emergency hospital logistical transport"
            ]

        return AIChatResponse(
            response=text,
            confidence=94.2,
            model="DisasterLens-DevMock-v4",
            contributingFactors=factors,
            recommendations=recommendations
        )

    async def check_health(self) -> Dict[str, Any]:
        return {
            "reachable": True,
            "model_available": True,
            "provider": "mock",
            "target_model": "DevMock-XAI"
        }


# Dynamic factory for the active AI service provider
def get_ai_service() -> BaseAIService:
    """
    Returns the active AI service.
    Defaults to OllamaAIService (local Qwen3 8B).
    Falls back to DevMockAIService if AI_SERVICE_PROVIDER=mock.
    """
    provider = settings.ai_service_provider.lower().strip()
    if provider == "mock":
        return DevMockAIService()
    return OllamaAIService()

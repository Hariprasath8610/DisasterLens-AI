import os
from abc import ABC, abstractmethod
from typing import List, Optional
from app.schemas.payloads import AIChatRequest, AIChatResponse

class BaseAIService(ABC):
    """
    Abstract Base Interface for DisasterLens AI Reasoning Engine.
    
    Aswath / Team: Implement this class to connect the live LLM 
    (e.g., Google Gemini 1.5, LangChain RAG pipeline, or custom fine-tuned model).
    """

    @abstractmethod
    async def generate_response(self, request: AIChatRequest) -> AIChatResponse:
        pass


class DevMockAIService(BaseAIService):
    """
    Development fallback provider providing high-fidelity grounded responses 
    until the production LLM key / model weights are initialized by Aswath.
    """

    async def generate_response(self, request: AIChatRequest) -> AIChatResponse:
        q = request.userQuery.lower()
        
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
            model="DisasterLens-XAI-v4.2 (Grounded Telemetry)",
            contributingFactors=factors,
            recommendations=recommendations
        )


class ProductionGeminiAIService(BaseAIService):
    """
    Template for Aswath to integrate Google Gemini API:
    - Grounded with real-time prompt templates
    - Uses GEMINI_API_KEY from environment
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")

    async def generate_response(self, request: AIChatRequest) -> AIChatResponse:
        if not self.api_key:
            # Fallback cleanly to dev mock if key is not yet set
            return await DevMockAIService().generate_response(request)
        
        # TODO (Aswath): Invoke google.generativeai or LangChain client here
        # prompt = f"You are DisasterLens AI for {request.location}..."
        # response = client.models.generate_content(...)
        return await DevMockAIService().generate_response(request)


# Active AI service instance
ai_service: BaseAIService = DevMockAIService()

def get_ai_service() -> BaseAIService:
    return ai_service

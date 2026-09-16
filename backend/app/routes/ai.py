from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.schemas.payloads import AIChatRequest, AIChatResponse
from app.services.ai_service import BaseAIService, get_ai_service

router = APIRouter(prefix="/ai", tags=["AI"])

@router.get("/health")
async def ai_health(service: BaseAIService = Depends(get_ai_service)) -> Dict[str, Any]:
    """
    Health check endpoint to inspect AI service reachability and model availability.
    """
    return await service.check_health()

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(
    req: AIChatRequest,
    service: BaseAIService = Depends(get_ai_service)
):
    """
    Core AI Chat endpoint for DisasterLens AI Risk Synthesis.
    Integrates with local Ollama running Qwen3 8B.
    """
    if not req.get_query():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty. Please provide a question or scenario."
        )
    return await service.generate_response(req)

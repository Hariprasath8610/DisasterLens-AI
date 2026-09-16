from fastapi import APIRouter, Depends
from app.schemas.payloads import AIChatRequest, AIChatResponse
from app.services.ai_service import BaseAIService, get_ai_service

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(
    req: AIChatRequest,
    service: BaseAIService = Depends(get_ai_service)
):
    return await service.generate_response(req)

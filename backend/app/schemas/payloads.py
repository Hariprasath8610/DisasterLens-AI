from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SimulationRequest(BaseModel):
    rain: float = Field(default=120.0, description="Precipitation intensity in mm / 24h")
    river: float = Field(default=4.2, description="River water level in meters")
    wind: float = Field(default=42.0, description="Wind speed in km/h")
    duration: int = Field(default=8, description="Storm duration in hours")
    soil: float = Field(default=95.0, description="Soil saturation percentage")
    drainageBlocked: bool = Field(default=True, description="Whether urban drainage culverts are blocked")

class SimulationResponse(BaseModel):
    success: bool
    simulationScore: int
    delta: int
    affectedCitizens: int
    submergedRoadsKm: float
    floodedWards: int
    peakSurgeHours: float
    aiProjection: str
    recommendedMitigation: str

class AIChatRequest(BaseModel):
    userQuery: str = Field(..., description="The user query or scenario question")
    location: Optional[str] = "Vellore District"
    disasterType: Optional[str] = "flood"
    rainfall: Optional[float] = 86.0
    riverLevel: Optional[float] = 3.4
    soilSaturation: Optional[float] = 84.0
    riskScore: Optional[int] = 72

class AIChatResponse(BaseModel):
    response: str
    confidence: float = 94.2
    model: str = "DisasterLens-XAI-v4.2"
    contributingFactors: List[str] = []
    recommendations: List[str] = []

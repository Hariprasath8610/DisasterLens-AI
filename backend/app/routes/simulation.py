from fastapi import APIRouter
from app.schemas.payloads import SimulationRequest, SimulationResponse
from app.services.simulation_service import SimulationService

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.post("", response_model=SimulationResponse)
def run_simulation(req: SimulationRequest):
    return SimulationService.run_stress_simulation(req)

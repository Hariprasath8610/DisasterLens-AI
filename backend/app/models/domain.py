from pydantic import BaseModel
from typing import List, Optional

class LocationModel(BaseModel):
    id: str
    name: str
    state: str
    country: str = "India"
    lat: float
    lng: float
    elevation: int
    catchment: str
    zone: str
    population: int
    vulnerable_wards: int
    station: str

class DisasterModel(BaseModel):
    id: str
    type: str
    title: str
    location: str
    severity: str
    score: int
    active: bool
    lat: float
    lng: float

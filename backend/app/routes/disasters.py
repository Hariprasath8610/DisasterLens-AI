from fastapi import APIRouter

router = APIRouter(prefix="/disasters", tags=["Disasters"])

@router.get("")
def list_active_disasters():
    return [
        {"id": "dis-1", "type": "flood", "title": "Palar River Inundation", "location": "Vellore, TN", "severity": "Critical", "score": 72, "active": True, "lat": 12.34, "lng": 79.13},
        {"id": "dis-2", "type": "cyclone", "title": "Bay of Bengal Deep Depression", "location": "Coastal TN & AP", "severity": "High", "score": 65, "active": True, "lat": 13.5, "lng": 80.8},
        {"id": "dis-3", "type": "landslide", "title": "Nilgiris Ghats Slope Surcharge", "location": "Coonoor, TN", "severity": "Moderate", "score": 48, "active": False, "lat": 11.35, "lng": 76.79},
        {"id": "dis-4", "type": "flood", "title": "Adyar River Urban Overflow", "location": "South Chennai, TN", "severity": "High", "score": 68, "active": True, "lat": 13.0, "lng": 80.24},
        {"id": "dis-5", "type": "wildfire", "title": "Western Ghats Thermal Hotspot", "location": "Theni Reserve Forest", "severity": "Low", "score": 22, "active": False, "lat": 9.9, "lng": 77.4}
    ]

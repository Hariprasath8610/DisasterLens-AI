from fastapi import APIRouter, Query

router = APIRouter(prefix="/history", tags=["History"])

@router.get("")
def get_historical_analogues(location: str = Query("Vellore District")):
    return [
        {
            "id": "hist-2021",
            "name": "November 2021 Palar River Flash Flood",
            "date": "18 Nov 2021",
            "location": "Vellore Basin",
            "peakLevel": "4.82m",
            "rainfall24h": "142mm",
            "impactSummary": "Upstream Ponnai Anicut sluice gates inundated 4 wards in Katpadi. 32,000 residents evacuated.",
            "correlationWithCurrent": "88.4%"
        },
        {
            "id": "hist-2015",
            "name": "December 2015 Coromandel Extreme Event",
            "date": "01 Dec 2015",
            "location": "Vellore & Chennai Corridor",
            "peakLevel": "5.10m",
            "rainfall24h": "198mm",
            "impactSummary": "Catastrophic riverbed overflow with widespread transport corridor severance along NH-48.",
            "correlationWithCurrent": "74.2%"
        },
        {
            "id": "hist-2017",
            "name": "October 2017 Monsoon Depressions",
            "date": "28 Oct 2017",
            "location": "North Tamil Nadu",
            "peakLevel": "3.60m",
            "rainfall24h": "94mm",
            "impactSummary": "Moderate localized flooding contained within secondary drainage buffers.",
            "correlationWithCurrent": "61.5%"
        }
    ]

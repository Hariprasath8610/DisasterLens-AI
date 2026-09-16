from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.config import settings

# Import Route Modules
from app.routes.health import router as health_router
from app.routes.weather import router as weather_router
from app.routes.risk import router as risk_router
from app.routes.disasters import router as disasters_router
from app.routes.history import router as history_router
from app.routes.simulation import router as simulation_router
from app.routes.ai import router as ai_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Earth Risk Intelligence and Catastrophe Predictive System Backend"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(health_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(risk_router, prefix="/api")
app.include_router(disasters_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")
app.include_router(ai_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "DisasterLens AI Backend Gateway Active",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)

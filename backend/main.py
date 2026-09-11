from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.products import router as products_router
from app.routes.safety import router as safety_router
from app.routes.maintenance import router as maintenance_router
from app.routes.ai import router as ai_router
from app.routes.product_agent import router as product_agent_router
from app.routes.product_ai_agent import router as product_ai_agent_router
from app.routes.safety_agent import router as safety_agent_router
from app.routes.safety_ai_agent import router as safety_ai_agent_router
from app.routes.maintenance_agent import router as maintenance_agent_router
from app.routes.maintenance_ai_agent import router as maintenance_ai_agent_router
from app.routes.orchestrator import router as orchestrator_router
from app.routes.rag_agent import router as rag_agent_router


app = FastAPI(
    title="COPASTON API",
    description="AI-Powered Product Lifecycle Safety and O&M Platform",
    version="1.0.0"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routes
app.include_router(products_router)
app.include_router(safety_router)
app.include_router(maintenance_router)
app.include_router(ai_router)
app.include_router(product_agent_router)
app.include_router(product_ai_agent_router)
app.include_router(safety_agent_router)
app.include_router(safety_ai_agent_router)
app.include_router(maintenance_agent_router)
app.include_router(maintenance_ai_agent_router)
app.include_router(orchestrator_router)
app.include_router(rag_agent_router)


@app.get("/")
def home():
    return {
        "message": "COPASTON API is running successfully!"
    }
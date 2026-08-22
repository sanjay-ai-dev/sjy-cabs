import os
import asyncpg
import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse

from .webhooks.whatsapp import router as whatsapp_router
from phase3_optimization.driver_layout import router as driver_router

logger = structlog.get_logger()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/sjy_mobility")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("starting_up")
    app.state.db_pool = await asyncpg.create_pool(DATABASE_URL)
    yield
    # Shutdown
    logger.info("shutting_down")
    await app.state.db_pool.close()

app = FastAPI(title="SJY Mobility API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sjy.co.in"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(whatsapp_router, tags=["whatsapp"])
app.include_router(driver_router, tags=["driver"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", error=str(exc), url=str(request.url))
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"},
    )

import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
from app.api import auth, complaints, users

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create all DB tables
Base.metadata.create_all(bind=engine)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="The Civil Dialogue API", version="1.0.0", docs_url="/api/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(users.router, prefix="/api")


@app.exception_handler(Exception)
async def global_error(req: Request, exc: Exception):
    logger.error(f"Unhandled: {exc}", exc_info=exc)
    return JSONResponse(status_code=500, content={"error": {"code": "INTERNAL_ERROR", "message": "Something went wrong"}})


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}

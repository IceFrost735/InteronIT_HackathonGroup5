from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

import models
from database import Base, engine


app = FastAPI(
    title="ANATOME API",
    version="1.0.0",
)


Base.metadata.create_all(bind=engine)


origins = [
    "http://localhost:5173",
    "http://localhost",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "ANATOME API is running",
    }


@app.get("/api/health")
def health_check():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        row = result.fetchone()

    return {
        "status": "healthy",
        "database_connected": row[0] == 1,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
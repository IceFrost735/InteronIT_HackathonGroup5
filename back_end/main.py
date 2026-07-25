from datetime import date, datetime, timezone
from uuid import uuid4

import uvicorn
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Integer,
    JSON,
    String,
    text,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from typing import Any

from ai_report_service import generate_ai_report, OPENAI_REPORT_MODEL
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# SQLAlchemy database model
# ==========================================

class PatientReport(Base):
    __tablename__ = "patient_reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        String(36),
        unique=True,
        nullable=False,
        index=True,
        default=lambda: str(uuid4()),
    )

    patient_name = Column(
        String(150),
        nullable=False,
    )

    patient_age = Column(
        Integer,
        nullable=False,
    )

    report_date = Column(
        Date,
        nullable=False,
    )

    questionnaire = Column(
        JSON,
        nullable=False,
    )

    pain_regions = Column(
        JSON,
        nullable=False,
    )

    ai_report = Column(
        JSON,
        nullable=False,
    )

    ai_model = Column(
        String(100),
        nullable=False,
    )

    ai_generated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


Base.metadata.create_all(bind=engine)


# ==========================================
# Pydantic request models
# ==========================================

class QuestionnaireData(BaseModel):
    onset: str
    trigger: str
    spread: str
    trend: str
    timing: str

    worse: list[str] = Field(default_factory=list)
    better: list[str] = Field(default_factory=list)

    previous: str
    impact: str

    symptoms: list[str] = Field(default_factory=list)


class PainRegionData(BaseModel):
    regionName: str = Field(
        min_length=1,
        max_length=150,
    )

    severity: int = Field(
        ge=1,
        le=10,
    )

    painType: str | None = None
    frequency: str | None = None
    startDate: str | None = None
    notes: str | None = None

    # Keep the original 3D point information in the database.
    clickPosition: Any | None = None
    clickNormal: Any | None = None


class PatientReportData(BaseModel):
    patient_name: str = Field(min_length=1, max_length=150)
    patient_age: int = Field(ge=0, le=130)
    report_date: date

    questionnaire: QuestionnaireData

    # Key is region name, value is pain information.
    pain_regions: dict[str, PainRegionData]


# ==========================================
# Test database
# ==========================================

@app.get("/")
def test_db():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            row = result.fetchone()

        return {
            "connected": bool(row and row[0] == 1)
        }

    except Exception as error:
        print("Database connection error:", error)

        raise HTTPException(
            status_code=500,
            detail="Database connection failed.",
        )


# ==========================================
# Save complete patient report
# ==========================================

@app.post("/reports", status_code=201)
def create_report(
    report: PatientReportData,
    db: Session = Depends(get_db),
):
    questionnaire_data = report.questionnaire.model_dump()

    pain_regions_data = {
        region_id: region_data.model_dump()
        for region_id, region_data in report.pain_regions.items()
    }

    # Generate the AI report before saving.
    # Patient name and database ID are not included.
    try:
        ai_report = generate_ai_report(
            patient_age=report.patient_age,
            report_date=report.report_date.isoformat(),
            questionnaire=questionnaire_data,
            pain_regions=pain_regions_data,
        )

    except Exception as error:
        print("AI report generation error:", type(error).__name__, repr(error))


        raise HTTPException(
            status_code=502,
            detail= f"AI generation failed: {type(error).__name__}: {error}",
        ) from error

    try:
        report_id = str(uuid4())

        new_report = PatientReport(
            patient_id=report_id,
            patient_name=report.patient_name.strip(),
            patient_age=report.patient_age,
            report_date=report.report_date,
            questionnaire=questionnaire_data,
            pain_regions=pain_regions_data,
            ai_report=ai_report,
            ai_model=OPENAI_REPORT_MODEL,
        )

        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        return {
            "message": "Patient report generated and saved successfully.",
            "database_id": new_report.id,
            "patient_id": new_report.patient_id,
            "created_at": new_report.created_at,
            "ai_generated_at": new_report.ai_generated_at,
            "ai_model": new_report.ai_model,
            "ai_report": new_report.ai_report,
        }

    except SQLAlchemyError as error:
        db.rollback()

        print("Database error:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Unable to save the patient report.",
        ) from error


# ==========================================
# Get all reports
# ==========================================

@app.get("/reports")
def get_reports(
    db: Session = Depends(get_db),
):
    return (
        db.query(PatientReport)
        .order_by(PatientReport.created_at.desc())
        .all()
    )


# ==========================================
# Get one report by random patient ID
# ==========================================

@app.get("/reports/{patient_id}")
def get_report(
    patient_id: str,
    db: Session = Depends(get_db),
):
    report = (
        db.query(PatientReport)
        .filter(PatientReport.patient_id == patient_id)
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Patient report not found.",
        )

    return report


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
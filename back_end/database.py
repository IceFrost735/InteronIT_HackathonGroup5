from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

DATABASE_URL = (
    "postgresql+psycopg2://postgres:sdajfsj123123A@"
    "database-1.cx00uaqeg0tv.us-east-2.rds.amazonaws.com:5432/postgres"
    "?sslmode=require"
)

engine = create_engine(
    DATABASE_URL
)


SessionLocal = sessionmaker(
    bind=engine
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
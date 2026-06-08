from typing import List

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from app.db.session import Base, engine, get_db
from app.models.record import Record
from app.schemas.record import RecordCreate, RecordOut

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Operations Knowledge Platform API",
    version="0.1.0",
)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "operations-knowledge-platform-api",
        "version": "0.1.0",
    }


@app.get("/api/records", response_model=List[RecordOut])
def get_records(db: Session = Depends(get_db)):
    return db.query(Record).order_by(Record.id.desc()).all()


@app.post("/api/records", response_model=RecordOut)
def create_record(record: RecordCreate, db: Session = Depends(get_db)):
    db_record = Record(**record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

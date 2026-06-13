from datetime import datetime, timezone
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.db.session import Base, engine, get_db
from app.models.record import Record
from app.schemas.record import RecordCreate, RecordOut
from app.services.classifier import classify_text

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Operations Knowledge Platform API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://192.168.10.17:5173",
        "http://192.168.64.9:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.post("/api/events", response_model=RecordOut)
def ingest_event(payload: dict, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    source = payload.get("source", "zabbix")
    external_id = payload.get("external_id")
    host = payload.get("host", "unknown-host")
    event_name = payload.get("event_name", "Unknown event")
    event_status = payload.get("event_status", "PROBLEM").upper()
    severity = payload.get("severity", "low")
    service = payload.get("service", "Unknown")
    message = payload.get("message", "")

    if not external_id:
        raise HTTPException(status_code=400, detail="external_id is required")

    existing_record = (
        db.query(Record)
        .filter(
            Record.source == source,
            Record.external_id == external_id,
        )
        .first()
    )

    if event_status in ["RESOLVED", "OK"]:
        if not existing_record:
            raise HTTPException(
                status_code=404,
                detail="Original event record not found",
            )

        existing_record.status = "resolved"
        existing_record.last_seen = now
        existing_record.resolved_at = now
        existing_record.event_count = (existing_record.event_count or 1) + 1
        existing_record.description = f"""{existing_record.description}

Recovery:
Host: {host}
Event: {event_name}
Status: {event_status}
Message: {message}
"""
        db.commit()
        db.refresh(existing_record)
        return existing_record

    if existing_record:
        existing_record.last_seen = now
        existing_record.event_count = (existing_record.event_count or 1) + 1

        db.commit()
        db.refresh(existing_record)

        return existing_record

    db_record = Record(
        title=f"Zabbix Event: {event_name} on {host}",
        description=f"""Event source: {source}
Host: {host}
Event: {event_name}
Status: {event_status}
Severity: {severity}
Message: {message}
""",
        type="incident",
        service=service,
        host=host,
        severity=severity.lower(),
        status="open",
        source=source,
        external_id=external_id,
        first_seen=now,
        last_seen=now,
        event_count=1,
        tags=[source, "event", "incident"],
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return db_record


@app.put("/api/records/{record_id}", response_model=RecordOut)
def update_record(
    record_id: int,
    updated_record: RecordCreate,
    db: Session = Depends(get_db),
):
    db_record = db.query(Record).filter(Record.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")
    for key, value in updated_record.model_dump().items():
        setattr(db_record, key, value)
    db.commit()
    db.refresh(db_record)
    return db_record


@app.delete("/api/records/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(Record).filter(Record.id == record_id).first()

    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")

    db.delete(db_record)
    db.commit()

    return {"message": "Record deleted", "id": record_id}


@app.post("/api/classify")
def classify_record(payload: dict):
    text = payload.get("text", "")
    return classify_text(text)

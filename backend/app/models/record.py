from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func

from app.db.session import Base


class Record(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    type = Column(String(50), nullable=False, default="note")
    service = Column(String(100), nullable=True)
    host = Column(String(100), nullable=True)

    severity = Column(String(50), nullable=True, default="low")
    status = Column(String(50), nullable=True, default="open")
    source = Column(String(50), nullable=True, default="manual")
    external_id = Column(String(100), nullable=True, index=True)
    first_seen = Column(DateTime(timezone=True), nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    event_count = Column(Integer, nullable=True, default=1)
    

    root_cause = Column(Text, nullable=True)
    solution = Column(Text, nullable=True)
    commands = Column(Text, nullable=True)

    tags = Column(ARRAY(String), nullable=True, default=[])

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

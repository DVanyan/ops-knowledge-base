from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class RecordCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: str = "note"
    service: Optional[str] = None
    host: Optional[str] = None
    severity: Optional[str] = "low"
    status: Optional[str] = "open"
    source: Optional[str] = "manual"
    external_id: Optional[str] = None
    root_cause: Optional[str] = None
    solution: Optional[str] = None
    commands: Optional[str] = None
    tags: List[str] = []


class RecordOut(RecordCreate):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

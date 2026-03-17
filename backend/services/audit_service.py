from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from backend.models import AuditLog


def audit_log(
    *,
    db: Session,
    company_id: int,
    user_id: Optional[int],
    action: str,
    details: Dict[str, Any],
) -> AuditLog:
    row = AuditLog(
        company_id=company_id,
        user_id=user_id,
        action=action,
        details=str(details),
        created_at=datetime.utcnow(),
    )
    db.add(row)
    db.flush()
    return row


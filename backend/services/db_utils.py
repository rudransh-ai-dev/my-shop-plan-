from __future__ import annotations

import hashlib
import json
from contextlib import contextmanager
from typing import Any, Dict, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.models import IdempotencyKey


def stable_json_dumps(obj: Any) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str)


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def idempotency_key_get(
    *,
    db: Session,
    company_id: int,
    endpoint: str,
    key: str,
) -> Optional[IdempotencyKey]:
    return (
        db.query(IdempotencyKey)
        .filter(
            IdempotencyKey.company_id == company_id,
            IdempotencyKey.endpoint == endpoint,
            IdempotencyKey.key == key,
            IdempotencyKey.is_deleted == False,  # noqa: E712
        )
        .first()
    )


def idempotency_key_create(
    *,
    db: Session,
    company_id: int,
    endpoint: str,
    key: str,
    request_hash: Optional[str],
) -> IdempotencyKey:
    row = IdempotencyKey(company_id=company_id, endpoint=endpoint, key=key, request_hash=request_hash)
    try:
        # Use a savepoint so a duplicate key doesn't abort the outer transaction.
        with db.begin_nested():
            db.add(row)
            db.flush()
        return row
    except IntegrityError:
        existing = idempotency_key_get(db=db, company_id=company_id, endpoint=endpoint, key=key)
        if existing:
            return existing
        raise HTTPException(status_code=409, detail="Duplicate idempotency key")


def idempotency_key_store_response(
    *,
    row: IdempotencyKey,
    status_code: int,
    response_body: Dict[str, Any],
) -> None:
    row.response_status = status_code
    row.response_body = stable_json_dumps(response_body)


def idempotency_key_parse_response(row: IdempotencyKey) -> Dict[str, Any]:
    try:
        return json.loads(row.response_body or "{}")
    except Exception:
        return {}


@contextmanager
def transactional(db: Session):
    """
    Transaction wrapper.

    Rule: do not perform external API calls while inside this context.
    """
    try:
        with db.begin():
            yield
    except HTTPException:
        # db.begin() handles rollback automatically
        raise
    except Exception as e:
        # db.begin() handles rollback automatically
        # Emit traceback to server logs for debugging/ops visibility.
        try:
            import traceback

            traceback.print_exc()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Internal server error") from e


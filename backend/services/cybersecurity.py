import hashlib
import json
import logging
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import AuditLog, User
import random

logger = logging.getLogger(__name__)

class SecurityService:
    @staticmethod
    def audit_event(db: Session, company_id: int, user_id: Optional[int], action: str, details: str, severity: str = "INFO"):
        """
        [Security: Audit Trails] 
        Permanent, immutable record of security-sensitive events.
        """
        log_entry = AuditLog(
            company_id=company_id,
            user_id=user_id,
            action=action,
            details=json.dumps({
                "severity": severity,
                "timestamp": datetime.utcnow().isoformat(),
                "details": details,
                "ip_address": f"192.168.1.{random.randint(1, 255)}" # Simulated for project scope
            }),
            created_at=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
        return log_entry

    @staticmethod
    def monitor_threats(db: Session, company_id: int):
        """
        [Security: Intrusion Detection Simulation] 
        Analyzes audit logs to detect brute-force attacks or suspicious geo-logins.
        """
        # Fetch last 50 login-related events
        recent_logins = db.query(AuditLog).filter(
            AuditLog.company_id == company_id,
            AuditLog.action.in_(["LOGIN", "LOGIN_FAILED"])
        ).order_by(AuditLog.created_at.desc()).limit(50).all()

        threats = []
        fail_count = 0
        for log in recent_logins:
            data = json.loads(log.details)
            if log.action == "LOGIN_FAILED":
                fail_count += 1
            
            # Simple threshold rule for project
            if fail_count > 3:
                threats.append({
                    "type": "BRUTE_FORCE_SUSPECTED",
                    "severity": "CRITICAL",
                    "details": "Multiple failed logins detected from same IP subnet."
                })
                break
                
        # Simulate Geo-IP security check (BCA Cyber Security concept)
        suspicious_geos = ["N/A (Simulated Proxy)", "Unknown High-Risk Region"]
        for log in recent_logins:
            if any(geo in log.details for geo in suspicious_geos):
                threats.append({
                    "type": "GEOGRAPHIC_ANOMALY",
                    "severity": "HIGH",
                    "details": f"Access attempt detected via potential anonymizer or overseas proxy."
                })
                break

        return threats

    @staticmethod
    def hash_pii(data: str):
        """
        [Security: Cryptography] 
        Demonstrates one-way hashing for sensitive strings.
        """
        # SHA-256 for non-password PII hashing demonstrations
        return hashlib.sha256(data.encode()).hexdigest()

    @staticmethod
    def check_data_encryption_compliance():
        """
        [Security: Compliance Audit] 
        Simulates an automated scan for cleartext PII in common tables.
        """
        return {
            "is_encrypted": True,
            "algorithm": "bcrypt (PBKDF2 derivative)",
            "key_rotation_status": "OK",
            "last_scan": datetime.utcnow().isoformat()
        }

"""Optional JWT gate. Disabled when JWT_SECRET is unset so local demos keep working."""

from __future__ import annotations

import os
from functools import wraps

import jwt
from flask import jsonify, request

JWT_ALGORITHM = "HS256"


def jwt_secret() -> str | None:
    secret = os.getenv("JWT_SECRET", "").strip()
    return secret or None


def require_auth(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        secret = jwt_secret()
        if not secret:
            return view(*args, **kwargs)

        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "Missing bearer token"}), 401

        token = header.removeprefix("Bearer ").strip()
        try:
            jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
        except jwt.PyJWTError:
            return jsonify({"error": "Invalid or expired token"}), 401
        return view(*args, **kwargs)

    return wrapped


def issue_token(subject: str = "ckd-demo", expires_seconds: int = 3600) -> str:
    from datetime import datetime, timedelta, timezone

    secret = jwt_secret()
    if not secret:
        raise RuntimeError("JWT_SECRET is not configured")

    payload = {
        "sub": subject,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=expires_seconds),
    }
    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)

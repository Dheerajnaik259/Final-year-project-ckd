"""
Supabase JWT guard.

Verifies the Supabase-issued access token using the project's JWT secret.
When SUPABASE_JWT_SECRET is unset, auth is disabled so local demos keep working.
The verified user UUID is stored in flask.g.user_id for downstream use.
"""

from __future__ import annotations

import os
import logging
from functools import wraps

import jwt
from flask import g, jsonify, request

logger = logging.getLogger(__name__)


def _jwt_secret() -> str | None:
    secret = os.getenv("SUPABASE_JWT_SECRET", "").strip() or os.getenv("JWT_SECRET", "").strip()
    return secret or None


def require_auth(view):
    """Decorator that verifies a Supabase JWT and injects g.user_id."""

    @wraps(view)
    def wrapped(*args, **kwargs):
        secret = _jwt_secret()
        if not secret:
            # Auth disabled — allow unauthenticated access for local dev
            g.user_id = None
            return view(*args, **kwargs)

        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "Missing bearer token"}), 401

        token = header.removeprefix("Bearer ").strip()
        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            g.user_id = payload.get("sub")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired — please sign in again"}), 401
        except jwt.PyJWTError as exc:
            logger.warning("JWT verification failed: %s", exc)
            return jsonify({"error": "Invalid or expired token"}), 401

        return view(*args, **kwargs)

    return wrapped

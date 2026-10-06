import logging

import httpx
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)

TIMEOUT_SECONDS = 60.0


async def _call(path: str, payload: dict) -> dict:
    try:
        async with httpx.AsyncClient(base_url=settings.ZKP_SERVICE_URL, timeout=TIMEOUT_SECONDS) as client:
            response = await client.post(path, json=payload)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError:
        # Never echo the payload: it contains the user's password.
        logger.exception("ZKP service call to %s failed", path)
        raise HTTPException(status_code=503, detail="The verification service is unavailable. Please try again shortly.")


async def get_zkp_fields(secret: str) -> dict:
    return await _call("/get-zkp-fields", {"secret": secret})


async def generate_proof_and_verify(secret: str, salt: str, nullifier: str) -> dict:
    return await _call("/generate-proof-and-verify", {"secret": secret, "salt": salt, "nullifier": nullifier})

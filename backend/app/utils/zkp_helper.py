import httpx
from fastapi import APIRouter, HTTPException

ZKP_SERVICE_URL = "http://localhost:5001/get-zkp-fields"
ZKP_GENERATE_AND_VERIFY_URL = "http://localhost:5001/generate-proof-and-verify"

TIMEOUT_SECONDS = 60.0 

async def get_zkp_fields(secret: str):
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            response = await client.post(ZKP_SERVICE_URL, json={"secret": secret})

        response.raise_for_status()
        return response.json()

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"ZKP service error: {str(e)}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)

async def generate_proof_and_verify(secret: str, salt: str, nullifier: str):
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            response = await client.post(
                ZKP_GENERATE_AND_VERIFY_URL,
                json={"secret": secret, "salt": salt, "nullifier": nullifier}
            )

        response.raise_for_status()
        return response.json()

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"ZKP service error: {str(e)}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)

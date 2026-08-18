import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.lib.automation import process_freefire_topup

app = FastAPI()

class TopupRequest(BaseModel):
    playerUid: str
    diamondAmount: str
    voucherCode: str
    pinCode: str = ""

@app.post("/api/topup")
async def topup(req: TopupRequest):
    try:
        res_str = await process_freefire_topup(
            req.playerUid, 
            req.diamondAmount, 
            req.voucherCode, 
            req.pinCode
        )
        # JSON string কে JSON object এ কনভার্ট করে রিটার্ন করা
        res_json = json.loads(res_str)
        return res_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
"""Self-check for Khalti verify: ownership, status handling and no double-mint. Run from backend/: venv/Scripts/python -m tests.test_khalti"""
import asyncio
from types import SimpleNamespace

from fastapi import BackgroundTasks, HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.endpoints import payments
from app.models.payment import KhaltiPayment

engine = create_engine("sqlite://")
KhaltiPayment.__table__.create(engine)  # only this table; no FK target needed in SQLite
db = sessionmaker(bind=engine)()

lookups = {}
deposits = []


async def fake_khalti(path, payload):
    return lookups[payload["pidx"]]


async def fake_chain(fn, *args):
    deposits.append(args)
    return f"0xhash{len(deposits)}"


async def fake_sync(user, delta):
    return delta


payments._khalti = fake_khalti
payments._run_on_chain = fake_chain
payments._sync_balance = fake_sync
payments._record = lambda *a, **k: None
payments._private_key = lambda user: "key"
payments.send_later = lambda *a, **k: None

alice = SimpleNamespace(id=1, wallet_address="0xa", email="a@x", full_name="A", balance="0")
bob = SimpleNamespace(id=2, wallet_address="0xb", email="b@x", full_name="B", balance="0")
db.add_all([KhaltiPayment(pidx="ok", user_id=1, amount=100), KhaltiPayment(pidx="cancel", user_id=1, amount=50),
            KhaltiPayment(pidx="short", user_id=1, amount=100)])
db.commit()
lookups.update(ok={"status": "Completed", "total_amount": 10000}, cancel={"status": "User canceled", "total_amount": 5000},
               short={"status": "Completed", "total_amount": 100})


def verify(pidx, user):
    return asyncio.run(payments.verify_khalti(payments.VerifyRequest(pidx=pidx), BackgroundTasks(), db, user))


def fails(pidx, user, code):
    try:
        verify(pidx, user)
    except HTTPException as e:
        assert e.status_code == code, (pidx, e.status_code, e.detail)
        return
    raise AssertionError(f"{pidx} should have failed")


fails("ok", bob, 404)                    # someone else's pidx
fails("cancel", alice, 400)              # not paid -> nothing minted
fails("short", alice, 400)               # paid amount doesn't match
assert deposits == []

assert verify("ok", alice).data["tx_hash"] == "0xhash1"
assert verify("ok", alice).message == "Payment already credited"  # retry is idempotent
assert len(deposits) == 1 and deposits[0][1] == 100
assert db.get(KhaltiPayment, "ok").status == "Settled"
print("khalti ok")

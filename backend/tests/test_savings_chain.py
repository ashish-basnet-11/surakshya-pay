"""
Savings goals + contract migration against a real chain. Needs a throwaway node, NOT your Ganache:
    cd blockchain && npx hardhat node --port 8545
    cd backend && venv/Scripts/python -m tests.test_savings_chain
"""
import asyncio
import json
import os
from pathlib import Path
from types import SimpleNamespace

# Hardhat's well-known dev account #0 funds gas; the contract address is set per deployment below.
os.environ.update(
    BLOCKCHAIN_RPC_URL="http://127.0.0.1:8545",
    FUNDER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    CONTRACT_ADDRESS="0x0000000000000000000000000000000000000000",
)

from fastapi import HTTPException  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.api.endpoints import budgets as budget_api  # noqa: E402
from app.models.budget import Budget, BudgetType  # noqa: E402
from app.models.notification import Notification  # noqa: E402
from app.models.transaction import Transaction  # noqa: E402
from app.utils import blockchain as chain  # noqa: E402
from scripts import migrate_contract  # noqa: E402

w3 = chain.w3
funder = w3.eth.account.from_key(os.environ["FUNDER_PRIVATE_KEY"])
ROOT = Path(__file__).resolve().parents[2]


def deploy(artifact_path: Path):
    art = json.loads(artifact_path.read_text())
    factory = w3.eth.contract(abi=art["abi"], bytecode=art["bytecode"])
    tx = factory.constructor().build_transaction({"from": funder.address, "nonce": w3.eth.get_transaction_count(funder.address, "pending"),
                                                 "gas": 6_000_000, "gasPrice": chain.GAS_PRICE})
    receipt = w3.eth.wait_for_transaction_receipt(w3.eth.send_raw_transaction(funder.sign_transaction(tx).raw_transaction))
    return w3.eth.contract(address=receipt.contractAddress, abi=chain._abi)


def use(contract):
    """Point the backend (and the migration script) at this deployment."""
    chain.digital_wallet = migrate_contract.digital_wallet = contract


def failed(fn, *args):
    try:
        fn(*args)
    except chain.ChainError as e:
        return str(e)
    raise AssertionError("expected the chain to reject this")


acct = chain.create_new_wallet()
addr, key = acct["address"], acct["private_key"]
guid = "8a0c6f0e-1d2b-4c3a-9e8f-0123456789ab"

# 1. Today's contract (deployed from its saved artifact, no savings functions) holds the user's money.
old = deploy(ROOT / "blockchain/ignition/deployments/chain-1337/artifacts/DigitalWalletModule#DigitalWallet.json")
use(old)
chain.register_user_onchain(addr, guid, key)
chain.deposit_onchain(addr, 500, key)

# 2. Redeploy + migrate: the balance carries over, and re-running doesn't double it.
new = deploy(ROOT / "backend/app/utils/digital_wallet.json")
use(new)
assert migrate_contract.migrate_user(old, addr, guid, key, [1, 2]) == {"spendable": 500, "goals": {1: 0, 2: 0}}
assert chain.get_user_balance_onchain(addr) == 500
assert migrate_contract.migrate_user(old, addr, guid, key, [1, 2]) is None
assert chain.get_user_balance_onchain(addr) == 500

# 3. Savings goals through the real endpoints (SQLite stands in for Postgres).
engine = create_engine("sqlite://")
for model in (Budget, Transaction, Notification):
    model.__table__.create(engine)
db = sessionmaker(bind=engine)()
import datetime  # noqa: E402

trip = Budget(name="Trip", category="Travel", budget_amount=300, budget_type=BudgetType.SAVINGS, spent_amount=0,
              start_date=datetime.date.today(), user_id=1)
food = Budget(name="Food", category="Food", budget_amount=1000, budget_type=BudgetType.EXPENSE, spent_amount=0,
              start_date=datetime.date.today(), user_id=1)
db.add_all([trip, food])
db.commit()
user = SimpleNamespace(id=1, wallet_address=addr, balance="500", email="t@x", full_name="T")
budget_api._private_key = lambda u: key


def call(endpoint, budget_id, amount):
    return asyncio.run(endpoint(budget_id=budget_id, amount=amount, db=db, current_user=user)).data


goal = call(budget_api.save_to_goal, trip.id, 200)
assert goal["spent_amount"] == 200 and chain.get_user_balance_onchain(addr) == 300 and user.balance == "300"
assert chain.get_goal_balance_onchain(addr, trip.id) == 200

goal = call(budget_api.save_to_goal, trip.id, 100)
assert goal["status"].value == "completed"  # target of 300 reached

assert "Insufficient balance" in failed(chain.withdraw_onchain, addr, 201, key)  # locked money isn't spendable
goal = call(budget_api.release_from_goal, trip.id, 50)
assert goal["spent_amount"] == 250 and chain.get_user_balance_onchain(addr) == 250

for bad in ((budget_api.release_from_goal, trip.id, 251), (budget_api.save_to_goal, trip.id, 251), (budget_api.save_to_goal, food.id, 10)):
    try:
        call(*bad)
        raise AssertionError(f"{bad} accepted")
    except HTTPException as e:
        assert e.status_code == 400, e.detail

kinds = [t.transaction_type for t in db.query(Transaction).order_by(Transaction.id)]
assert kinds == ["SAVE", "SAVE", "RELEASE"], kinds

# 4. A later redeploy carries goal money over too.
newer = deploy(ROOT / "backend/app/utils/digital_wallet.json")
use(newer)
assert migrate_contract.migrate_user(new, addr, guid, key, [trip.id, food.id]) == {"spendable": 250, "goals": {trip.id: 250, food.id: 0}}
assert chain.get_user_balance_onchain(addr) == 250 and chain.get_goal_balance_onchain(addr, trip.id) == 250

# 5. Deleting a goal gives its money back first.
asyncio.run(budget_api.delete_budget(db=db, budget_id=trip.id, current_user=user))
assert chain.get_user_balance_onchain(addr) == 500 and chain.get_goal_balance_onchain(addr, trip.id) == 0
assert db.get(Budget, trip.id) is None
print("savings chain ok")

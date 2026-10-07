"""
Move every user onto a freshly deployed DigitalWallet (the one CONTRACT_ADDRESS in .env points at).

    venv/Scripts/python -m scripts.migrate_contract <OLD_CONTRACT_ADDRESS>

For each user with a wallet: registers them on the new contract, re-credits their old spendable
balance and re-locks whatever their savings goals held. Safe to re-run: users who already have
funds on the new contract are skipped. Stop the backend first so nobody transacts mid-migration.
"""
import sys

from web3 import Web3

from app.core.config import settings
from app.core.security import decrypt_private_key
from app.crud.budget import GOAL_TYPES, compute_status
from app.database.session import SessionLocal
from app.database import base  # noqa: F401  (registers all models)
from app.models.budget import Budget
from app.models.user import User
from app.utils.blockchain import _abi, deposit_onchain, digital_wallet, register_user_onchain, save_to_goal_onchain, w3


def _read(fn, address: str) -> int:
    """Old contracts may lack a function or not know the user; both mean nothing to carry over."""
    try:
        return fn.call({"from": address})
    except Exception:
        return 0


def migrate_user(old, address: str, guid: str, private_key: str, goal_ids: list[int]) -> dict | None:
    """Returns what was carried over, or None if the user was already migrated."""
    new = digital_wallet.functions
    if not new.users(address).call()[2]:  # (userAddress, zkpHash, registered, balance)
        register_user_onchain(address, guid, private_key)
    elif _read(new.getMyBalance(), address) + _read(new.getMySavings(), address) > 0:
        return None

    spendable = _read(old.functions.getMyBalance(), address)
    goals = {gid: _read(old.functions.getGoalBalance(gid), address) for gid in goal_ids}
    total = spendable + sum(goals.values())
    if total:
        deposit_onchain(address, total, private_key)
    for gid, amount in goals.items():
        if amount:
            save_to_goal_onchain(address, gid, amount, private_key)
    return {"spendable": spendable, "goals": goals}


def main(old_address: str) -> None:
    old_address = Web3.to_checksum_address(old_address)
    if old_address.lower() == settings.CONTRACT_ADDRESS.lower():
        sys.exit("The old address is the one .env already uses. Deploy the new contract first (npm run deploy).")
    old = w3.eth.contract(address=old_address, abi=_abi)
    print(f"Migrating users {old_address} -> {settings.CONTRACT_ADDRESS}")

    db = SessionLocal()
    try:
        users = db.query(User).filter(User.wallet_address.isnot(None), User.private_key_encrypted.isnot(None)).all()
        for user in users:
            goal_budgets = db.query(Budget).filter(Budget.user_id == user.id, Budget.budget_type.in_(GOAL_TYPES)).all()
            try:
                key = decrypt_private_key(user.private_key_encrypted, settings.SECRET_KEY)
                result = migrate_user(old, user.wallet_address, user.guid, key, [b.id for b in goal_budgets])
            except Exception as e:
                print(f"  FAILED {user.email}: {e}  (fix and re-run; finished users are skipped)")
                continue
            if result is None:
                print(f"  skip   {user.email}: already on the new contract")
                continue
            user.balance = str(result["spendable"])
            for b in goal_budgets:
                # Goal progress is the on-chain locked amount; old progress from tagged transfers was never locked.
                b.spent_amount = result["goals"].get(b.id, 0)
                b.status = compute_status(b)
            db.commit()
            saved = sum(result["goals"].values())
            print(f"  done   {user.email}: NPR {result['spendable']} spendable, NPR {saved} in {len(goal_budgets)} goal(s)")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])

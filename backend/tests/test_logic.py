"""Self-check for pure backend rules. Run from backend/: venv/Scripts/python -m tests.test_logic"""
import datetime

from fastapi import HTTPException

from app.api.endpoints.transactions import _whole_amount
from app.crud.budget import compute_status
from app.models.budget import Budget, BudgetStatus, BudgetType
from app.utils.blockchain import _revert_reason
from app.utils.file_upload import _sniff_extension

TODAY = datetime.date(2026, 10, 6)


def budget(kind, spent, limit, end=None):
    return Budget(budget_type=kind, spent_amount=spent, budget_amount=limit, start_date=TODAY, end_date=end)


# Budget status: one rule everywhere.
assert compute_status(budget(BudgetType.EXPENSE, 10, 100), TODAY) == BudgetStatus.ACTIVE
assert compute_status(budget(BudgetType.EXPENSE, 90, 100), TODAY) == BudgetStatus.WARNING
assert compute_status(budget(BudgetType.EXPENSE, 150, 100), TODAY) == BudgetStatus.WARNING  # over limit is a warning, not "done"
assert compute_status(budget(BudgetType.EXPENSE, 10, 100, end=TODAY - datetime.timedelta(days=1)), TODAY) == BudgetStatus.COMPLETED
assert compute_status(budget(BudgetType.SAVINGS, 100, 100), TODAY) == BudgetStatus.COMPLETED
assert compute_status(budget(BudgetType.SAVINGS, 95, 100), TODAY) == BudgetStatus.ACTIVE  # no "warning" for savings

# Wallet amounts are whole rupees.
assert _whole_amount(50.0) == 50
for bad in (0, -5, 10.5):
    try:
        _whole_amount(bad)
        raise AssertionError(f"{bad} accepted")
    except HTTPException as e:
        assert e.status_code == 400


# Revert reasons from both web3 error shapes become user-facing messages.
class FakeError(Exception):
    pass


ganache = FakeError()
ganache.message = {"message": "VM Exception while processing transaction: revert Insufficient balance"}
assert _revert_reason(ganache) == "Insufficient balance."
assert _revert_reason(FakeError("execution reverted: Recipient not registered")) == "The recipient's wallet isn't set up yet."

# Uploads are identified by content, not by name.
assert _sniff_extension(b"\xff\xd8\xff\xe0" + b"\0" * 12) == ".jpg"
assert _sniff_extension(b"\x89PNG\r\n\x1a\n" + b"\0" * 8) == ".png"
assert _sniff_extension(b"%PDF-1.7" + b"\0" * 8) == ".pdf"
assert _sniff_extension(b"MZ\x90\x00 executable!") is None

print("backend logic checks passed")

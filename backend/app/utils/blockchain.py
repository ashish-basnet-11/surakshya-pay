"""
Thin wrapper around the DigitalWallet contract.

All functions here are blocking (web3 HTTP). Call them from async endpoints via
starlette.concurrency.run_in_threadpool so they don't stall the event loop.
"""
import json
import logging
from pathlib import Path

from web3 import Web3
from web3.exceptions import ContractLogicError, Web3RPCError

from app.core.config import settings

logger = logging.getLogger(__name__)

w3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_RPC_URL))
_abi = json.loads((Path(__file__).parent / "digital_wallet.json").read_text())["abi"]
digital_wallet = w3.eth.contract(address=settings.CONTRACT_ADDRESS, abi=_abi)

GAS_LIMIT = 2_000_000
# ponytail: fixed gas price suits Ganache; on a public network use w3.eth.gas_price.
GAS_PRICE = w3.to_wei("20", "gwei")
GAS_TOP_UP_ETHER = 1
RECEIPT_TIMEOUT_SECONDS = 120

_FRIENDLY_REVERTS = {
    "Insufficient balance": "Insufficient balance.",
    "Recipient not registered": "The recipient's wallet isn't set up yet.",
    "Not registered": "Your wallet isn't registered on the ledger. Please contact support.",
    "Already registered": "This wallet is already registered.",
    "Deposit must be greater than 0": "Amount must be greater than zero.",
}


class ChainError(Exception):
    """The contract or network rejected a transaction. The message is safe to show users."""


def _revert_reason(error: Exception) -> str:
    raw = getattr(error, "message", None) or error
    if isinstance(raw, dict):  # Ganache: {"message": "VM Exception ...: revert <reason>", ...}
        raw = raw.get("message", "")
    raw = str(raw)
    reason = raw.split("revert", 1)[-1].lstrip(": ").strip().strip("'\"")
    for key, friendly in _FRIENDLY_REVERTS.items():
        if key in reason:
            return friendly
    return reason or "The transaction was rejected."


def _ensure_gas(address: str) -> None:
    """Wallets pay gas in ETH; top them up from the funder account when they run low."""
    if w3.eth.get_balance(address) >= GAS_LIMIT * GAS_PRICE:
        return
    funder = w3.eth.account.from_key(settings.FUNDER_PRIVATE_KEY)
    txn = {
        "from": funder.address,
        "to": address,
        "value": w3.to_wei(GAS_TOP_UP_ETHER, "ether"),
        "nonce": w3.eth.get_transaction_count(funder.address, "pending"),
        "gas": 21000,
        "gasPrice": GAS_PRICE,
    }
    signed = funder.sign_transaction(txn)
    receipt = w3.eth.wait_for_transaction_receipt(w3.eth.send_raw_transaction(signed.raw_transaction), timeout=RECEIPT_TIMEOUT_SECONDS)
    if receipt.status != 1:
        raise ChainError("Couldn't fund network fees for this wallet.")
    logger.info("Topped up gas for %s", address)


def _transact(contract_fn, sender: str, private_key: str) -> str:
    """Simulate, send and confirm a contract call. Returns the tx hash; raises ChainError on rejection."""
    try:
        # A dry run surfaces the contract's revert reason without spending gas.
        contract_fn.call({"from": sender})
    except ContractLogicError as e:
        raise ChainError(_revert_reason(e)) from e
    except Web3RPCError as e:
        # Some nodes (e.g. Ganache) report reverts as plain RPC errors.
        if "revert" not in str(e).lower():
            raise
        raise ChainError(_revert_reason(e)) from e

    _ensure_gas(sender)
    txn = contract_fn.build_transaction(
        {"from": sender, "nonce": w3.eth.get_transaction_count(sender, "pending"), "gas": GAS_LIMIT, "gasPrice": GAS_PRICE}
    )
    signed = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    # Only report success once the transaction is mined and actually succeeded.
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=RECEIPT_TIMEOUT_SECONDS)
    if receipt.status != 1:
        raise ChainError("The transaction was rejected by the network.")
    return tx_hash.hex()


def create_new_wallet() -> dict:
    account = w3.eth.account.create()
    return {"address": account.address, "private_key": account.key.hex()}


def register_user_onchain(user_address: str, zkp_hash: str, private_key: str) -> str:
    zkp_hash_bytes32 = bytes.fromhex(zkp_hash.replace("-", "")).ljust(32, b"\x00")
    return _transact(digital_wallet.functions.registerUser(zkp_hash_bytes32), user_address, private_key)


# The contract stores whole NPR units; callers must pass integers.
def deposit_onchain(user_address: str, amount: int, private_key: str) -> str:
    return _transact(digital_wallet.functions.deposit(amount), user_address, private_key)


def withdraw_onchain(user_address: str, amount: int, private_key: str) -> str:
    return _transact(digital_wallet.functions.withdraw(amount), user_address, private_key)


def transfer_onchain(from_address: str, to_address: str, amount: int, private_key: str) -> str:
    return _transact(digital_wallet.functions.transfer(to_address, amount), from_address, private_key)


def get_user_balance_onchain(user_address: str) -> int:
    """Balance in whole NPR. Raises on RPC failure (never silently reports 0)."""
    return digital_wallet.functions.getMyBalance().call({"from": user_address})

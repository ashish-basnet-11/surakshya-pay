from web3 import Web3
import json
import os
from typing import List, Dict, Any, Optional
from enum import Enum
from app.core.config import settings

w3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_RPC_URL))

contract_address = settings.CONTRACT_ADDRESS
with open('app/utils/digital_wallet.json', 'r') as f:
    contract_json = json.load(f)
    contract_abi = contract_json['abi']

digital_wallet = w3.eth.contract(address=contract_address, abi=contract_abi)

class TransactionType(Enum):
    DEPOSIT = 0
    WITHDRAWAL = 1
    TRANSFER = 2

def check_funder_balance(required_amount_ether: float) -> bool:
    """Check if the funder account has sufficient balance"""
    try:
        accounts = w3.eth.accounts
        if not accounts:
            print("No accounts available in Ganache")
            return False
        
        funder_address = accounts[0]
        funder_balance = w3.eth.get_balance(funder_address)
        required_amount = w3.to_wei(required_amount_ether, 'ether')
        
        print(f"Funder account {funder_address} balance: {w3.from_wei(funder_balance, 'ether')} ETH")
        print(f"Required amount: {required_amount_ether} ETH")
        
        return funder_balance >= required_amount
        
    except Exception as e:
        print(f"Error checking funder balance: {e}")
        return False

def fund_new_wallet(wallet_address: str, amount_ether: float = 0.1):
    """Fund a new wallet with ETH for gas fees"""
    try:
        if not check_funder_balance(amount_ether):
            return False
        
        accounts = w3.eth.accounts
        funder_address = accounts[0]
        
        nonce = w3.eth.get_transaction_count(funder_address)
        required_amount = w3.to_wei(amount_ether, 'ether')
        
        txn = {
            'from': funder_address,
            'to': wallet_address,
            'value': required_amount,
            'nonce': nonce,
            'gas': 21000,
            'gasPrice': w3.to_wei('20', 'gwei')
        }
        
        signed_txn = w3.eth.account.sign_transaction(txn, private_key=settings.FUNDER_PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        print(f"Funded wallet {wallet_address} with {amount_ether} ETH. Transaction: {tx_hash.hex()}")
        
        w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"Funding transaction confirmed for wallet {wallet_address}")
        
        return True
        
    except Exception as e:
        print(f"Error funding wallet: {e}")
        return False

def register_user_onchain(user_address, zkp_hash, private_key):
    zkp_hash_clean = zkp_hash.replace('-', '')
    zkp_hash_bytes = bytes.fromhex(zkp_hash_clean)
    zkp_hash_bytes32 = zkp_hash_bytes.ljust(32, b'\x00')
    
    wallet_balance = w3.eth.get_balance(user_address)
    estimated_gas = 2000000
    gas_price = w3.to_wei('20', 'gwei')
    required_funds = estimated_gas * gas_price
    
    if wallet_balance < required_funds:
        print(f"Insufficient funds in wallet {user_address}. Balance: {w3.from_wei(wallet_balance, 'ether')} ETH")
        print("Attempting to fund wallet...")
        if not fund_new_wallet(user_address, 1):
            raise Exception("Failed to fund wallet for registration")
    
    nonce = w3.eth.get_transaction_count(user_address)
    txn = digital_wallet.functions.registerUser(zkp_hash_bytes32).build_transaction({
        'from': user_address,
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': gas_price
    })
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    return tx_hash.hex()

def create_new_wallet():
    account = w3.eth.account.create()
    return {
        'address': account.address,
        'private_key': account.key.hex()
    }

UNIT_TO_WEI = int(1e14)

def deposit_onchain(user_address, amount, private_key):
    wallet_balance = w3.eth.get_balance(user_address)
    estimated_gas = 2000000
    gas_price = w3.to_wei('20', 'gwei')
    gas_cost = estimated_gas * gas_price
    total_required = gas_cost
    
    if wallet_balance < total_required:
        print(f"Insufficient funds in wallet {user_address}. Balance: {w3.from_wei(wallet_balance, 'ether')} ETH")
        print(f"Required: {w3.from_wei(total_required, 'ether')} ETH (gas: {w3.from_wei(gas_cost, 'ether')} ETH)")
        print("Attempting to fund wallet...")
        funding_amount = 0.1
        if not fund_new_wallet(user_address, funding_amount):
            raise Exception(f"Failed to fund wallet for deposit. Required: {w3.from_wei(total_required, 'ether')} ETH")
    
    nonce = w3.eth.get_transaction_count(user_address)
    txn = digital_wallet.functions.deposit(int(amount)).build_transaction({
        'from': user_address,
        'nonce': nonce,
        'value': 0,
        'gas': estimated_gas,
        'gasPrice': gas_price
    })
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    return tx_hash.hex()

def transfer_onchain(from_address, to_address, amount, private_key):
    wallet_balance = w3.eth.get_balance(from_address)
    estimated_gas = 2000000
    gas_price = w3.to_wei('20', 'gwei')
    gas_cost = estimated_gas * gas_price
    total_required = gas_cost
    
    if wallet_balance < total_required:
        print(f"Insufficient funds in wallet {from_address}. Balance: {w3.from_wei(wallet_balance, 'ether')} ETH")
        print(f"Required: {w3.from_wei(total_required, 'ether')} ETH (gas: {w3.from_wei(gas_cost, 'ether')} ETH)")
        print("Attempting to fund wallet...")
        funding_amount = 0.1
        if not fund_new_wallet(from_address, funding_amount):
            raise Exception(f"Failed to fund wallet for transfer. Required: {w3.from_wei(total_required, 'ether')} ETH")
    
    nonce = w3.eth.get_transaction_count(from_address)
    txn = digital_wallet.functions.transfer(to_address, int(amount)).build_transaction({
        'from': from_address,
        'nonce': nonce,
        'gas': estimated_gas,
        'gasPrice': gas_price
    })
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    return tx_hash.hex()

def withdraw_onchain(user_address, amount, private_key):
    wallet_balance = w3.eth.get_balance(user_address)
    estimated_gas = 2000000
    gas_price = w3.to_wei('20', 'gwei')
    gas_cost = estimated_gas * gas_price
    total_required = gas_cost
    
    if wallet_balance < total_required:
        print(f"Insufficient funds in wallet {user_address}. Balance: {w3.from_wei(wallet_balance, 'ether')} ETH")
        print(f"Required: {w3.from_wei(total_required, 'ether')} ETH (gas: {w3.from_wei(gas_cost, 'ether')} ETH)")
        print("Attempting to fund wallet...")
        funding_amount = 0.1 
        if not fund_new_wallet(user_address, funding_amount):
            raise Exception(f"Failed to fund wallet for withdraw. Required: {w3.from_wei(total_required, 'ether')} ETH")
    
    nonce = w3.eth.get_transaction_count(user_address)
    txn = digital_wallet.functions.withdraw(int(amount)).build_transaction({
        'from': user_address,
        'nonce': nonce,
        'gas': estimated_gas,
        'gasPrice': gas_price
    })
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    return tx_hash.hex()

def get_user_balance_onchain(user_address: str) -> int:
    """Get user's balance from the blockchain (as integer units)"""
    try:
        balance = digital_wallet.functions.getMyBalance().call({'from': user_address})
        return balance  # Return as integer units
    except Exception as e:
        print(f"Error getting balance: {e}")
        return 0

def get_transaction_onchain(transaction_id: int) -> Optional[Dict[str, Any]]:
    """Get a specific transaction from the blockchain (amount as integer units)"""
    try:
        result = digital_wallet.functions.getTransaction(transaction_id).call()
        return {
            'id': result[0],
            'from': result[1],
            'to': result[2],
            'amount': result[3],
            'timestamp': result[4],
            'transaction_type': TransactionType(result[5]).name,
            'is_completed': result[6]
        }
    except Exception as e:
        print(f"Error getting transaction {transaction_id}: {e}")
        return None

def get_user_transactions_onchain(user_address: str) -> List[int]:
    """Get all transaction IDs for a user from the blockchain"""
    try:
        return digital_wallet.functions.getUserTransactions(user_address).call()
    except Exception as e:
        print(f"Error getting user transactions: {e}")
        return []

def get_user_transaction_count_onchain(user_address: str) -> int:
    """Get the total number of transactions for a user from the blockchain"""
    try:
        return digital_wallet.functions.getUserTransactionCount(user_address).call()
    except Exception as e:
        print(f"Error getting transaction count: {e}")
        return 0

def get_user_transactions_paginated_onchain(user_address: str, offset: int, limit: int) -> List[int]:
    """Get paginated transaction IDs for a user from the blockchain"""
    try:
        return digital_wallet.functions.getUserTransactionsPaginated(user_address, offset, limit).call()
    except Exception as e:
        print(f"Error getting paginated user transactions: {e}")
        return []

def get_recent_transactions_onchain(user_address: str, count: int) -> List[int]:
    """Get recent transaction IDs for a user from the blockchain"""
    try:
        return digital_wallet.functions.getRecentTransactions(user_address, count).call()
    except Exception as e:
        print(f"Error getting recent transactions: {e}")
        return []

def get_user_transactions_by_type_onchain(user_address: str, transaction_type: TransactionType) -> List[int]:
    """Get transaction IDs for a user by type from the blockchain"""
    try:
        return digital_wallet.functions.getUserTransactionsByType(user_address, transaction_type.value).call()
    except Exception as e:
        print(f"Error getting user transactions by type: {e}")
        return []

def get_user_transactions_with_details_onchain(user_address: str, offset: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
    """Get detailed transaction information for a user from the blockchain"""
    try:
        transaction_ids = get_user_transactions_paginated_onchain(user_address, offset, limit)
        transactions = []
        for tx_id in transaction_ids:
            tx_details = get_transaction_onchain(tx_id)
            if tx_details:
                transactions.append(tx_details)
        return transactions
    except Exception as e:
        print(f"Error getting user transactions with details: {e}")
        return []

def is_user_registered_onchain(user_address: str) -> bool:
    """Check if a user is registered on the blockchain"""
    try:
        digital_wallet.functions.getUserZKPHash(user_address).call()
        return True
    except Exception:
        return False 
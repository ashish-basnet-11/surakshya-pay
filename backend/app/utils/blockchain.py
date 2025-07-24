from web3 import Web3
import json
import os

w3 = Web3(Web3.HTTPProvider(os.getenv('WEB3_PROVIDER', 'http://127.0.0.1:8545')))

CONTRACT_ADDRESS = os.getenv('DIGITAL_WALLET_CONTRACT_ADDRESS', '0x9010DFd9e35d84d9bB9b5759399CafE553FCdE4d')
ABI_PATH = os.getenv('DIGITAL_WALLET_ABI_PATH', 'app/utils/digital_wallet.json')

with open(ABI_PATH) as f:
    contract_json = json.load(f)
    abi = contract_json['abi']

digital_wallet = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)

def register_user_onchain(user_address, zkp_hash, private_key):
    nonce = w3.eth.get_transaction_count(user_address)
    txn = digital_wallet.functions.registerUser(zkp_hash).build_transaction({
        'from': user_address,
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': w3.to_wei('50', 'gwei')
    })
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    return tx_hash.hex()

def create_new_wallet():
    account = w3.eth.account.create()
    return {
        'address': account.address,
        'private_key': account.key.hex()
    } 
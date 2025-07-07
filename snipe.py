import time
import json
from config import web3, PRIVATE_KEY, WALLET_ADDRESS, PANCAKE_ROUTER, WBNB
import requests

# Load PancakeSwap Router ABI
def get_router():
    url = f"https://api.bscscan.com/api?module=contract&action=getabi&address={PANCAKE_ROUTER}&apikey=Your_BSCSCAN_API"
    abi = json.loads(requests.get(url).json()['result'])
    return web3.eth.contract(address=PANCAKE_ROUTER, abi=abi)

router = get_router()

def buy_token(token_address, amount_bnb):
    token = web3.toChecksumAddress(token_address)
    deadline = int(time.time()) + 60
    bnb_amount = web3.toWei(amount_bnb, 'ether')

    txn = router.functions.swapExactETHForTokensSupportingFeeOnTransferTokens(
        0,
        [WBNB, token],
        WALLET_ADDRESS,
        deadline
    ).build_transaction({
        'from': WALLET_ADDRESS,
        'value': bnb_amount,
        'gas': 300000,
        'gasPrice': web3.toWei('5', 'gwei'),
        'nonce': web3.eth.get_transaction_count(WALLET_ADDRESS)
    })

    signed = web3.eth.account.sign_transaction(txn, PRIVATE_KEY)
    tx_hash = web3.eth.send_raw_transaction(signed.rawTransaction)
    return web3.toHex(tx_hash)

import os
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
WALLET_ADDRESS = os.getenv("WALLET_ADDRESS")

BSC_RPC = "https://bsc-dataseed.binance.org/"
web3 = Web3(Web3.HTTPProvider(BSC_RPC))

PANCAKE_ROUTER = web3.toChecksumAddress("0x10ED43C718714eb63d5aA57B78B54704E256024E")
WBNB = web3.toChecksumAddress("0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c")

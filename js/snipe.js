
const Web3 = require('web3');
const dotenv = require('dotenv');
dotenv.config();

//const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const Web3 = require('web3');
const web3 = new Web3.default('https://bsc-dataseed.binance.org/');

const routerAbi = [ /* insert PancakeSwap Router ABI here */ ];
const routerAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const router = new web3.eth.Contract(routerAbi, routerAddress);

const buyToken = async (tokenAddress, amountBNB) => {
  const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  const to = process.env.WALLET_ADDRESS;

  const deadline = Math.floor(Date.now() / 1000) + 60 * 5;

  const tx = router.methods.swapExactETHForTokens(
    0,
    ['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', tokenAddress],
    to,
    deadline
  );

  const gas = await tx.estimateGas({ from: to, value: web3.utils.toWei(amountBNB.toString(), 'ether') });
  const txData = {
    from: to,
    to: routerAddress,
    data: tx.encodeABI(),
    gas,
    value: web3.utils.toWei(amountBNB.toString(), 'ether')
  };

  const signedTx = await web3.eth.accounts.signTransaction(txData, process.env.PRIVATE_KEY);
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  return receipt.transactionHash;
};

module.exports = { buyToken };

const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const { buyToken } = require('./snipe');

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🆕 /start or /help - Lists all commands
const helpMessage = `
🤖 *Welcome to your Crypto Sniping Bot!*

Here are the available commands:

📌 /snipe <token_address> <bnb_amount>  
Snipes a token instantly on PancakeSwap  
Example: \`/snipe 0x123...abcd 0.01\`

📌 /newtokens  
Lists the latest 5 token pairs added on PancakeSwap

📌 /balance  
Shows your wallet's BNB balance

📌 /status  
Shows your wallet address and bot status

📌 /help  
Displays this command list
`;

bot.start(async (ctx) => {
  await ctx.replyWithMarkdown(helpMessage);
});

bot.command('help', async (ctx) => {
  await ctx.replyWithMarkdown(helpMessage);
});

// ✅ /snipe command
bot.command('snipe', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ').slice(1);
    const tokenAddress = args[0];
    const amount = parseFloat(args[1]);

    const tx = await buyToken(tokenAddress, amount);
    await ctx.reply(`✅ Sniped! TX: https://bscscan.com/tx/${tx}`);
  } catch (err) {
    console.error(err);
    await ctx.reply(`❌ Error: ${err.message || err}`);
  }
});

// ✅ /newtokens command
const GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v2';
const NEW_TOKEN_QUERY = `
{
  pairs(first: 5, orderBy: createdAtTimestamp, orderDirection: desc) {
    id
    token0 { id symbol name }
    token1 { id symbol name }
    createdAtTimestamp
  }
}
`;

bot.command('newtokens', async (ctx) => {
  try {
    const res = await fetch(GRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: NEW_TOKEN_QUERY })
    });

    const json = await res.json();
    const pairs = json.data.pairs;

    let message = `🆕 *Latest New Tokens on PancakeSwap:*\n\n`;

    pairs.forEach((pair, i) => {
      const token = pair.token1;
      message += `*${i + 1}. ${token.name}* (${token.symbol})\n`;
      message += `📦 Address: \`${token.id}\`\n`;
      message += `[📊 View on BscScan](https://bscscan.com/token/${token.id})\n\n`;
    });

    await ctx.replyWithMarkdown(message);
  } catch (e) {
    console.error(e);
    await ctx.reply("❌ Failed to fetch tokens.");
  }
});

// ✅ /balance command
//const Web3 = require('web3');
//const web3 = new Web3(process.env.RPC_URL);
//const Web3 = require('web3');
//const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));
/*
const Web3 = require('web3');
const web3 = new Web3(process.env.RPC_URL);
*/


//const { createWeb3 } = require('web3');

//const web3 = createWeb3(process.env.RPC_URL);
const Web3 = require('web3');
const web3 = new Web3.default('https://bsc-dataseed.binance.org/');



bot.command('balance', async (ctx) => {
  try {
    const balance = await web3.eth.getBalance(process.env.WALLET_ADDRESS);
    const bnb = web3.utils.fromWei(balance, 'ether');
    await ctx.reply(`💰 Wallet Balance: ${bnb} BNB`);
  } catch (err) {
    await ctx.reply("❌ Could not fetch balance.");
  }
});

// ✅ /status command
bot.command('status', async (ctx) => {
  await ctx.reply(`✅ Bot is online.\n🔐 Wallet: \`${process.env.WALLET_ADDRESS}\``, {
    parse_mode: 'Markdown'
  });
});

// 🚀 Launch the bot after all handlers
bot.launch();
console.log('🤖 Bot is running...');

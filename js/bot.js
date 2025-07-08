const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
//const fetch = require('node-fetch');
//const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

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
const GRAPH_URL = 'https://api.geckoterminal.com/api/v2/networks/bsc/pools/trending';
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

// Required at the top of your file
//const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
//const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const BITQUERY_URL = "https://graphql.bitquery.io";

const NEW_TOKENS_QUERY = `
{
  ethereum(network: bsc) {
    dexTrades(
      options: {limit: 5, desc: "block.height"}
      exchangeName: "Pancake"
      quoteCurrency: {is: "BNB"}
    ) {
      block {
        height
        timestamp {
          time(format: "%Y-%m-%d %H:%M:%S")
        }
      }
      baseCurrency {
        symbol
        address
        name
      }
      quoteCurrency {
        symbol
      }
      transaction {
        hash
      }
    }
  }
}
`;

bot.command('newtokens', async (ctx) => {
  try {
    const res = await fetch(BITQUERY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.BITQUERY_API_KEY,
      },
      body: JSON.stringify({ query: NEW_TOKENS_QUERY }),
    });

    const json = await res.json();
    const trades = json.data?.ethereum?.dexTrades || [];

    if (trades.length === 0) {
      await ctx.reply("⚠️ No new tokens found.");
      return;
    }

    let message = `🆕 *Latest PancakeSwap Tokens*\n\n`;

    trades.forEach((trade, index) => {
      const token = trade.baseCurrency;
      const time = trade.block.timestamp.time;
      message += `*${index + 1}. ${token.name}* (${token.symbol})\n`;
      message += `📦 Address: \`${token.address}\`\n`;
      message += `🕒 Time: ${time}\n`;
      message += `[🔍 View on BscScan](https://bscscan.com/token/${token.address})\n\n`;
    });

    await ctx.replyWithMarkdown(message);
  } catch (e) {
    console.error("❌ Bitquery fetch failed:", e);
    await ctx.reply("❌ Could not fetch new tokens from PancakeSwap.");
  }
});

/*
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

bot.command('newtokens', async (ctx) => {
  try {
    const res = await fetch('https://api.geckoterminal.com/api/v2/networks/bsc/pools/trending');
    const json = await res.json();

    const pools = json.data.slice(0, 5); // Top 5 trending pairs

    if (!pools.length) {
      await ctx.reply("⚠️ No trending tokens found at the moment.");
      return;
    }

    let message = `🔥 *Trending New Tokens on BSC (via GeckoTerminal)*\n\n`;

    pools.forEach((pool, i) => {
      const attr = pool.attributes;
      const base = attr?.base_token;
      const poolId = pool.id?.split("/")[1];

      if (!base || !base.name || !base.symbol || !base.address) return;

      message += `*${i + 1}. ${base.name}* (${base.symbol})\n`;
      message += `📦 Address: \`${base.address}\`\n`;
      message += `[📈 Chart](https://www.geckoterminal.com/bsc/pools/${poolId}) | [🔍 BscScan](https://bscscan.com/token/${base.address})\n\n`;
    });

    await ctx.replyWithMarkdown(message);
  } catch (e) {
    console.error("❌ GeckoTerminal trending fetch failed:", e);
    await ctx.reply("❌ Could not fetch trending token data.");
  }
});



bot.command('newtokens', async (ctx) => {
  try {
    const res = await fetch('https://api.geckoterminal.com/api/v2/networks/bsc/new_pools');
    const json = await res.json();
    const pools = json.data.slice(0, 5); // Get top 5 new tokens

    if (!pools || pools.length === 0) {
      await ctx.reply("⚠️ No new tokens found.");
      return;
    }

    let message = `🆕 *New Token Pairs on BSC (GeckoTerminal)*\n\n`;

    pools.forEach((pool, i) => {
      const attr = pool.attributes;
      const baseToken = attr?.base_token;
      const poolId = pool.id?.split("/")[1];

      if (!baseToken || !baseToken.name || !baseToken.symbol || !baseToken.address) return;

      message += `*${i + 1}. ${baseToken.name}* (${baseToken.symbol})\n`;
      message += `📦 Address: \`${baseToken.address}\`\n`;
      message += `[📈 View Chart](https://www.geckoterminal.com/bsc/pools/${poolId})\n\n`;
    });

    await ctx.replyWithMarkdown(message);
  } catch (e) {
    console.error("❌ GeckoTerminal fetch failed:", e);
    await ctx.reply("❌ Could not fetch token data.");
  }
});

//const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

bot.command('newtokens', async (ctx) => {
  try {
    const res = await fetch('https://api.geckoterminal.com/api/v2/networks/bsc/new_pools');
    const json = await res.json();
    const pools = json.data.slice(0, 5); // Get top 5 new tokens

    let message = `🆕 *New Token Pairs on BSC (GeckoTerminal)*\n\n`;

    pools.forEach((pool, i) => {
      const attr = pool.attributes;
      message += `*${i + 1}. ${attr.base_token.name}* (${attr.base_token.symbol})\n`;
      message += `📦 Address: \`${attr.base_token.address}\`\n`;
      message += `[📈 View Chart](https://www.geckoterminal.com/bsc/pools/${pool.id.split('/')[1]})\n\n`;
    });

    await ctx.replyWithMarkdown(message);
  } catch (e) {
    console.error("❌ GeckoTerminal fetch failed:", e);
    await ctx.reply("❌ Could not fetch token data.");
  }
});



// New /newtokens command using DexScreener API
bot.command('newtokens', async (ctx) => {
  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/bsc');
    const data = await response.json();

    const pairs = data.pairs.slice(0, 5); // Get top 5 new pairs
    let message = `🆕 *Latest New Tokens on BSC (DexScreener)*\n\n`;

    pairs.forEach((pair, index) => {
      message += `*${index + 1}. ${pair.baseToken.name}* (${pair.baseToken.symbol})\n`;
      message += `📦 Address: \`${pair.baseToken.address}\`\n`;
      message += `[📊 Chart](${pair.url}) | [🔍 BscScan](https://bscscan.com/token/${pair.baseToken.address})\n\n`;
    });

    await ctx.replyWithMarkdown(message);
  } catch (err) {
    console.error("❌ DexScreener fetch failed:", err);
    await ctx.reply("❌ Failed to fetch new tokens.");
  }
});




bot.command('newtokens', async (ctx) => {
  try {
    const res = await fetch(GRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: NEW_TOKEN_QUERY }),
    });

    const json = await res.json();
    console.log("📦 Raw response from Graph:", JSON.stringify(json, null, 2)); // Add this

    if (!json.data || !json.data.pairs) {
      await ctx.reply("⚠️ No data found. Graph API may be down or rate-limiting.");
      return;
    }

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
    console.error("❌ Fetch failed:", e);
    await ctx.reply("❌ Failed to fetch tokens.");
  }
});




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
});*/

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

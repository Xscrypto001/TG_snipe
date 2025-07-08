const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
const { buyToken } = require('./snipe'); // You'll write this like the Python buy_token

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// /snipe command
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

bot.launch();
console.log('🤖 Bot is running...');

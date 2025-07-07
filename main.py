from telegram.ext import CommandHandler
from snipe import buy_token

async def snipe(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        token_address = context.args[0]
        amount = float(context.args[1])
        tx = buy_token(token_address, amount)
        await update.message.reply_text(f"✅ Sniped! TX: https://bscscan.com/tx/{tx}")
    except Exception as e:
        await update.message.reply_text(f"❌ Error: {e}")

app.add_handler(CommandHandler("snipe", snipe))

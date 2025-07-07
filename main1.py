
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
BOT_TOKEN="8118827795:AAEfuLy2000N0063iCxIsn8QUAqcjbcLhbE"

# Start command handler
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("👋 Welcome to your multi-bot system!\nUse /help to see options.")

# Help command handler
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("""
🤖 Bot Capabilities:
/snipe <token> <bnb> — Buy a new coin
/trade — Coming soon
/support — Talk to support
""")

# Init app and register handlers
app = ApplicationBuilder().token(BOT_TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("help", help_command))

# Run the bot
print("🤖 Bot running...")
app.run_polling()

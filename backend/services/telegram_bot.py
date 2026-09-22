import os
import logging
import httpx
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackQueryHandler, ContextTypes

logger = logging.getLogger(__name__)

API_BASE = os.getenv("RAKSHAOS_API_URL", "http://localhost:8000/api")
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")

# ─── Risk Card Formatter ────────────────────────────────────
def format_risk_card(result: dict) -> str:
    verdict = result.get("verdict", "UNKNOWN")
    score = result.get("risk_score", 0)
    explanation = result.get("explanation", "")
    action = result.get("recommended_action", "")
    signals = result.get("signals", [])
    
    # Emoji mapping
    verdict_emoji = {
        "SAFE": "✅", "WARNING": "⚠️", "HIGH_RISK": "🔴", "EMERGENCY": "🚨"
    }.get(verdict, "❓")
    
    score_bar = "█" * (score // 10) + "░" * (10 - score // 10)
    
    detected = [s for s in signals if s.get("detected")]
    signal_lines = "\n".join([f"  • <b>{s['label']}</b>: {s['detail']}" for s in detected[:5]])
    
    card = (
        f"{verdict_emoji} <b>RakshaOS Verdict: {verdict.replace('_', ' ')}</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"<b>Risk Score:</b> {score}/100\n"
        f"[{score_bar}]\n\n"
    )
    
    if signal_lines:
        card += f"<b>🔍 Detected Signals:</b>\n{signal_lines}\n\n"
    
    card += (
        f"<b>💡 Why?</b>\n{explanation}\n\n"
        f"<b>🛡️ What to do:</b>\n{action}\n\n"
        f"<i>— Protected by RakshaOS</i>"
    )
    
    return card

# ─── Handlers ────────────────────────────────────────────────
async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome = (
        "🛡️ <b>Welcome to RakshaOS</b>\n\n"
        "I'm your AI safety layer. Forward me any suspicious message — "
        "SMS, WhatsApp chat, email text — and I'll instantly tell you if it's safe.\n\n"
        "<b>How to use:</b>\n"
        "1️⃣ Forward any suspicious message here\n"
        "2️⃣ Send a screenshot of a scam\n"
        "3️⃣ Send a QR code image\n"
        "4️⃣ Type /recovery if you already paid\n\n"
        "<i>Your data is analyzed securely and never stored.</i>"
    )
    await update.message.reply_text(welcome, parse_mode="HTML")

async def text_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Analyze any text message sent to the bot."""
    text = update.message.text
    if not text or text.startswith("/"):
        return
    
    await update.message.reply_text("🔍 Analyzing with Scam Genome engine...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{API_BASE}/analyze", json={
                "input_type": "text",
                "content": text,
                "channel": "telegram"
            })
            result = resp.json()
        
        card = format_risk_card(result)
        
        keyboard = []
        verdict = result.get("verdict", "")
        if verdict in ("HIGH_RISK", "EMERGENCY"):
            keyboard.append([
                InlineKeyboardButton("👨‍👩‍👧 Alert Family", callback_data="alert_family"),
                InlineKeyboardButton("💰 I Already Paid", callback_data="recovery"),
            ])
        keyboard.append([
            InlineKeyboardButton("🔊 Read Aloud", callback_data="read_aloud"),
        ])
        
        reply_markup = InlineKeyboardMarkup(keyboard) if keyboard else None
        await update.message.reply_text(card, parse_mode="HTML", reply_markup=reply_markup)
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        await update.message.reply_text("❌ Analysis failed. Please try again.")

async def photo_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle screenshots and QR code images."""
    await update.message.reply_text("🔍 Processing image through OCR + Scam Genome...")
    
    try:
        photo = update.message.photo[-1]  # Highest resolution
        file = await photo.get_file()
        image_bytes = await file.download_as_bytearray()
        
        import base64
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        
        # Try QR first, fallback to screenshot OCR
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{API_BASE}/analyze", json={
                "input_type": "screenshot",
                "content": b64,
                "channel": "telegram"
            })
            result = resp.json()
        
        card = format_risk_card(result)
        await update.message.reply_text(card, parse_mode="HTML")
        
    except Exception as e:
        logger.error(f"Photo analysis failed: {e}")
        await update.message.reply_text("❌ Could not process image. Please try sending the text instead.")

async def recovery_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /recovery command."""
    recovery_msg = (
        "🆘 <b>Recovery Mode</b>\n\n"
        "If you've already sent money to a scammer, time is critical.\n\n"
        "<b>Do these NOW:</b>\n"
        "1️⃣ Call <b>1930</b> (Cyber Crime Helpline) — available 24/7\n"
        "2️⃣ File complaint at <b>cybercrime.gov.in</b>\n"
        "3️⃣ Call your bank's fraud helpline immediately\n"
        "4️⃣ Do NOT delete any messages — they are evidence\n\n"
        "📋 <b>Useful contacts:</b>\n"
        "• National Cyber Crime: 1930\n"
        "• RBI Helpline: 14448\n"
        "• Online: cybercrime.gov.in\n\n"
        "💡 Visit the RakshaOS dashboard for a full complaint draft generator."
    )
    await update.message.reply_text(recovery_msg, parse_mode="HTML")

async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle inline keyboard button presses."""
    query = update.callback_query
    await query.answer()
    
    if query.data == "alert_family":
        await query.edit_message_text(
            query.message.text + "\n\n📤 <i>Share this message with a trusted family member to warn them.</i>",
            parse_mode="HTML"
        )
    elif query.data == "recovery":
        await query.message.reply_text(
            "🆘 Call <b>1930</b> immediately. Visit cybercrime.gov.in to file a complaint.",
            parse_mode="HTML"
        )
    elif query.data == "read_aloud":
        await query.answer("Use the RakshaOS app dashboard for voice output.", show_alert=True)

# ─── Main ────────────────────────────────────────────────────
def run_telegram_bot():
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set. Telegram bot will not start.")
        return
    
    app = Application.builder().token(BOT_TOKEN).build()
    
    app.add_handler(CommandHandler("start", start_handler))
    app.add_handler(CommandHandler("help", start_handler))
    app.add_handler(CommandHandler("recovery", recovery_handler))
    app.add_handler(MessageHandler(filters.PHOTO, photo_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_handler))
    app.add_handler(CallbackQueryHandler(callback_handler))
    
    logger.info("🤖 Telegram bot starting...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_telegram_bot()

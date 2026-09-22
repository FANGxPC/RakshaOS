#!/bin/bash
# RakshaOS - One-Button Launcher
set -e

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║  🛡️  RakshaOS — AI Digital Safety Layer  ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# 0. Register the shutdown trap FIRST
trap 'echo -e "\n🛑 Shutting down RakshaOS..."; kill 0' SIGINT SIGTERM

# 1. Check for .env
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating one..."
    echo "GEMINI_API_KEY=" > .env
    echo "TELEGRAM_BOT_TOKEN=" >> .env
    echo "TELEGRAM_CHAT_ID=" >> .env
fi

# Export all vars from .env so child processes inherit them
set -a
source .env
set +a

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ ERROR: GEMINI_API_KEY is missing in your .env file."
    echo "   Add your Gemini API key to .env and try again."
    exit 1
fi

echo "✅ API keys loaded."

# 2. Start Backend (Telegram bot auto-starts inside if token is set)
echo "🚀 Starting AI Backend..."
source venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
sleep 3

# 3. Start Frontend
echo "🚀 Starting Command Center..."
(cd frontend && npm run dev -- -p 3000) &
sleep 2

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║  ✅  RakshaOS is LIVE!                               ║"
echo "  ║                                                      ║"
echo "  ║  💻 Command Center:  http://localhost:3000            ║"
echo "  ║  📱 AVD Companion:   http://10.0.2.2:3000/android    ║"
echo "  ║  🤖 Telegram Bot:    Auto-started (if token set)     ║"
echo "  ║                                                      ║"
echo "  ║  Press Ctrl+C to shut down all systems.              ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# Wait for all background processes
wait

#!/bin/bash
# RakshaOS - One-Button Launcher
set -e

echo "==============================================="
echo "🛡️  RakshaOS - Live Command Center Setup"
echo "==============================================="

# 0. Register the shutdown trap FIRST before starting any children
trap 'echo -e "\n🛑 Shutting down RakshaOS... (Cleaning up ports 3000 and 8000)"; kill 0' SIGINT SIGTERM

# 1. Check for API Keys
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
    echo "RakshaOS requires a real Gemini API Key for its Scam Genome Engine."
    echo "Please add it to the .env file and run this script again."
    exit 1
fi

if [ -z "$TELEGRAM_CHAT_ID" ] || [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "⚠️  WARNING: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing."
    echo "The Family Shield will not send real Telegram alerts."
    echo "Add them to .env if you want the Family Shield to work live!"
fi

echo "✅ Environment configured."

# 2. Start Backend
echo "🚀 Starting Python AI Backend (FastAPI)..."
source venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
sleep 3

# 3. Start Frontend
echo "🚀 Starting Next.js Live Command Center..."
(cd frontend && npm run dev -- -p 3000) &
sleep 2

# 4. Optional: Start WhatsApp Sidecar
echo ""
read -p "📱 Start WhatsApp Auto-Monitor for live demo? (y/n): " start_wa
if [[ "$start_wa" == "y" || "$start_wa" == "Y" ]]; then
    echo "🚀 Starting WhatsApp Sidecar..."
    (cd whatsapp-monitor && npm start) &
fi

echo ""
echo "==============================================="
echo "✅ RakshaOS is LIVE!"
echo "🌐 Command Center Dashboard: http://localhost:3000"
echo "==============================================="
echo "Press Ctrl+C to shut down all systems."

# Wait for all background processes
wait

#!/bin/bash
# RakshaOS - Auto-Interceptor Launcher
set -e

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║  🛡️  RakshaOS — AI Digital Safety Layer  ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# 0. Register the shutdown trap FIRST
trap 'trap - SIGINT SIGTERM EXIT; echo -e "\n🛑 Shutting down RakshaOS... (Closing all background interceptors)"; kill 0' SIGINT SIGTERM EXIT

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

echo "✅ Environment configured."

# 1.5. Ensure dependencies are installed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment and installing backend dependencies..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r backend/requirements.txt
else
    source venv/bin/activate
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    (cd frontend && npm install)
fi

if [ ! -d "whatsapp-monitor/node_modules" ]; then
    echo "📦 Installing WhatsApp monitor dependencies..."
    (cd whatsapp-monitor && npm install)
fi

# 2. Start Backend (Telegram bot auto-starts inside)
echo "🚀 Starting AI Backend & Telegram Bot..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
sleep 3

# 3. Start Frontend
echo "🚀 Starting Command Center (Frontend)..."
(cd frontend && npm run dev -- -p 3000 > ../frontend.log 2>&1) &
sleep 2

# 4. Start ADB Auto-Monitor (Intercepts AVD SMS silently)
echo "🚀 Starting ADB Auto-Monitor for Emulator..."
python3 android-monitor/adb_monitor.py > adb.log 2>&1 &



echo ""
echo "=========================================================================="
echo " ✅ All interception layers are LIVE!"
echo " 💻 Open Command Center: http://localhost:3000"
echo " 📱 Send a fake SMS using your AVD control panel -> it will auto-intercept"
echo "=========================================================================="
echo " Press Ctrl+C to stop all monitoring."
echo ""

# Wait for all background processes
wait

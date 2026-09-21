#!/bin/bash
# RakshaOS Android Monitor Setup for Termux
echo "🛡️  RakshaOS Android Monitor Setup"
echo "=================================="

# Update packages
pkg update -y && pkg upgrade -y

# Install required packages
pkg install -y python termux-api

# Install Python dependencies
pip install requests

# Grant permissions reminder
echo ""
echo "⚠️  IMPORTANT: Make sure to:"
echo "   1. Install Termux:API app from F-Droid"
echo "   2. Go to Settings > Apps > Termux:API > Permissions"
echo "   3. Enable: Notifications, SMS, Clipboard"
echo ""
echo "Run: termux-wake-lock && python monitor.py"

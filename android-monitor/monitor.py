#!/usr/bin/env python3
"""
RakshaOS Android Monitor — Termux-based SMS, Notification & Clipboard Scanner
Requires: Termux + Termux:API app installed on Android
Install: pkg install termux-api python
Run: python monitor.py
"""

import subprocess
import json
import time
import hashlib
import os
import sys

try:
    import requests
except ImportError:
    os.system("pip install requests")
    import requests

API_BASE = os.getenv("RAKSHAOS_API_URL", "http://localhost:8000/api")
TELEGRAM_ALERT_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
POLL_INTERVAL = 3  # seconds

seen_sms = set()
seen_notifications = set()
last_clipboard = ""

def get_hash(text):
    return hashlib.md5(text.encode()).hexdigest()

# ─── SMS Monitor ─────────────────────────────────────────────
def check_sms():
    global seen_sms
    try:
        result = subprocess.run(
            ['termux-sms-list', '-l', '5', '-t', 'inbox'],
            capture_output=True, text=True, timeout=10
        )
        messages = json.loads(result.stdout) if result.stdout else []
        
        for msg in messages:
            msg_hash = get_hash(msg.get('body', '') + msg.get('number', ''))
            if msg_hash not in seen_sms:
                seen_sms.add(msg_hash)
                body = msg.get('body', '')
                sender = msg.get('number', 'Unknown')
                print(f"📨 New SMS from {sender}: {body[:60]}...")
                analyze_content(body, 'sms', f"SMS from {sender}")
    except Exception as e:
        pass  # termux-api may not be available

# ─── Notification Monitor ────────────────────────────────────
def check_notifications():
    global seen_notifications
    try:
        result = subprocess.run(
            ['termux-notification-list'],
            capture_output=True, text=True, timeout=10
        )
        notifications = json.loads(result.stdout) if result.stdout else []
        
        for notif in notifications:
            title = notif.get('title', '')
            content = notif.get('content', '')
            pkg = notif.get('packageName', '')
            
            # Skip system/RakshaOS notifications
            if 'com.termux' in pkg or not content:
                continue
            
            notif_hash = get_hash(title + content)
            if notif_hash not in seen_notifications:
                seen_notifications.add(notif_hash)
                full_text = f"{title}: {content}" if title else content
                print(f"🔔 Notification [{pkg}]: {full_text[:60]}...")
                analyze_content(full_text, 'notification', f"Notification from {pkg}")
    except Exception as e:
        pass

# ─── Clipboard Monitor ──────────────────────────────────────
def check_clipboard():
    global last_clipboard
    try:
        result = subprocess.run(
            ['termux-clipboard-get'],
            capture_output=True, text=True, timeout=5
        )
        clip = result.stdout.strip() if result.stdout else ""
        
        if clip and clip != last_clipboard and len(clip) > 10:
            last_clipboard = clip
            # Check if it looks like a URL or suspicious text
            if any(x in clip.lower() for x in ['http', 'upi://', '.com', '.in', 'pay', 'send', 'otp']):
                print(f"📋 Clipboard: {clip[:60]}...")
                analyze_content(clip, 'clipboard', "Clipboard content")
    except Exception as e:
        pass

# ─── Analyze & Alert ─────────────────────────────────────────
def analyze_content(text, channel, source):
    try:
        resp = requests.post(f"{API_BASE}/analyze", json={
            "input_type": "text",
            "content": text,
            "channel": channel,
            "language_hint": "auto"
        }, timeout=30)
        
        result = resp.json()
        verdict = result.get('verdict', 'UNKNOWN')
        score = result.get('risk_score', 0)
        
        print(f"   → Verdict: {verdict} ({score}/100)")
        
        if verdict in ('HIGH_RISK', 'EMERGENCY'):
            # Show Termux notification
            alert_text = f"🚨 {verdict}: {result.get('explanation', '')[:100]}"
            try:
                subprocess.run([
                    'termux-notification',
                    '--title', f'RakshaOS Alert — {verdict}',
                    '--content', alert_text,
                    '--priority', 'high',
                    '--vibrate', '500,200,500',
                    '--led-color', 'ff0000',
                    '--sound'
                ], timeout=5)
            except Exception:
                pass
            
            print(f"   ⚠️  ALERT sent! ({source})")
            
    except Exception as e:
        print(f"   ❌ Analysis failed: {e}")

# ─── Main Loop ───────────────────────────────────────────────
def main():
    print("🛡️  RakshaOS Android Monitor v1.0")
    print("   Monitoring SMS, Notifications, and Clipboard")
    print(f"   Backend: {API_BASE}")
    print(f"   Poll interval: {POLL_INTERVAL}s")
    print("   Press Ctrl+C to stop.\n")
    
    # Notify backend
    try:
        requests.post(f"{API_BASE}/channel-status", json={"channel": "sms", "status": True}, timeout=5)
        requests.post(f"{API_BASE}/channel-status", json={"channel": "clipboard", "status": True}, timeout=5)
    except Exception:
        pass
    
    try:
        while True:
            check_sms()
            check_notifications()
            check_clipboard()
            time.sleep(POLL_INTERVAL)
    except KeyboardInterrupt:
        print("\n\nShutting down Android monitor...")
        try:
            requests.post(f"{API_BASE}/channel-status", json={"channel": "sms", "status": False}, timeout=5)
            requests.post(f"{API_BASE}/channel-status", json={"channel": "clipboard", "status": False}, timeout=5)
        except Exception:
            pass

if __name__ == "__main__":
    main()

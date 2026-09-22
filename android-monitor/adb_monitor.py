#!/usr/bin/env python3
"""
RakshaOS ADB Auto-Monitor
Runs on the laptop to silently intercept SMS from an attached Android Emulator (AVD).
No installation required on the emulator itself.
"""

import subprocess
import requests
import time
import re
import os
import threading
import json

API_BASE = "http://localhost:8000/api"
POLL_INTERVAL = 3  # seconds
seen_sms_ids = set()
quarantine_list = set()

def get_adb_path():
    # Try standard adb first
    try:
        subprocess.run(["adb", "version"], capture_output=True, check=True)
        return "adb"
    except Exception:
        pass
    
    # Try Android Studio default path
    home = os.path.expanduser("~")
    sdk_adb = os.path.join(home, "Android/Sdk/platform-tools/adb")
    if os.path.exists(sdk_adb):
        return sdk_adb
    
    return None

def fetch_sms(adb_path):
    try:
        # Query the SMS inbox provider
        result = subprocess.run(
            [adb_path, "shell", "content", "query", "--uri", "content://sms/inbox"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode != 0:
            return []
            
        output = result.stdout
        messages = []
        
        # Example output row:
        # Row: 0 _id=14, thread_id=2, address=+1234567890, person=NULL, date=1700000000000, date_sent=1700000000000, protocol=0, read=0, status=-1, type=1, reply_path_present=0, subject=NULL, body=Scam message text here, service_center=NULL, locked=0, error_code=0, seen=0
        
        # Split by Row:
        rows = output.split("Row: ")
        for row in rows:
            if not row.strip():
                continue
                
            # Extract ID
            id_match = re.search(r'_id=(\d+)', row)
            if not id_match:
                continue
            sms_id = id_match.group(1)
            
            # Extract Address
            addr_match = re.search(r'address=(.*?),', row)
            address = addr_match.group(1) if addr_match else "Unknown"
            
            # Extract Body (body=..., service_center=)
            body_match = re.search(r'body=(.*?)(?:, service_center=|, locked=)', row)
            body = body_match.group(1) if body_match else ""
            
            if body:
                messages.append({
                    "id": sms_id,
                    "address": address,
                    "body": body
                })
                
        return messages
    except Exception as e:
        print(f"ADB Error: {e}")
        return []

def analyze_sms(body, sender):
    print(f"\n📨 [AVD Intercept] SMS from {sender}: {body[:60]}...")
    try:
        resp = requests.post(f"{API_BASE}/analyze", json={
            "input_type": "text",
            "content": f"SMS from {sender}: {body}",
            "channel": "sms",
            "language_hint": "auto"
        }, timeout=30)
        
        result = resp.json()
        verdict = result.get('verdict', 'UNKNOWN')
        score = result.get('risk_score', 0)
        print(f"   → Verdict: {verdict} ({score}/100)")
        
    except Exception as e:
        print(f"   ❌ Analysis failed: {e}")

def update_quarantine_list():
    global quarantine_list
    while True:
        try:
            resp = requests.get(f"{API_BASE}/quarantine", timeout=5)
            urls = resp.json().get("quarantined_urls", [])
            quarantine_list = set(urls)
        except:
            pass
        time.sleep(5)

def monitor_logcat(adb_path):
    print("   🛡️  Starting Deep-Link Intent Monitor (Sinkhole)...")
    try:
        # Clear logcat first to avoid old logs
        subprocess.run([adb_path, "logcat", "-c"])
        
        # Monitor logcat continuously for VIEW intents
        process = subprocess.Popen(
            [adb_path, "logcat", "ActivityManager:I", "*:S"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        for line in process.stdout:
            if "act=android.intent.action.VIEW" in line:
                # Extract URL, e.g., dat=http://malicious.com
                match = re.search(r'dat=(http[^\s]+|upi://[^\s]+)', line)
                if match:
                    url = match.group(1)
                    # Check if URL is in quarantine list
                    # To be flexible, check if quarantined URL is a substring
                    is_quarantined = any(q_url in url for q_url in quarantine_list)
                    
                    if is_quarantined:
                        print(f"\n🚨 [SINKHOLE] Intercepted Malicious Link: {url}")
                        print(f"   → Force closing browser and showing warning!")
                        # Kill Chrome
                        subprocess.run([adb_path, "shell", "am", "force-stop", "com.android.chrome"])
                        # Launch blocked page
                        # Using the companion app route or a generic warning
                        blocked_url = "http://10.0.2.2:3000/android?blocked=true"
                        subprocess.run([adb_path, "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", blocked_url])
                        
    except Exception as e:
        print(f"Logcat Monitor Error: {e}")

def main():
    print("🛡️  RakshaOS ADB Auto-Monitor")
    print("   Searching for Android emulator...")
    
    adb_path = get_adb_path()
    if not adb_path:
        print("   ❌ Error: 'adb' not found. Ensure Android Studio is installed.")
        return
        
    # Wait for device
    print("   Waiting for device/emulator to be online...")
    subprocess.run([adb_path, "wait-for-device"])
    print("   ✅ Connected to Emulator!")
    
    # Start Quarantine updater and Logcat monitor threads
    threading.Thread(target=update_quarantine_list, daemon=True).start()
    threading.Thread(target=monitor_logcat, args=(adb_path,), daemon=True).start()
    
    # Notify backend that SMS channel is active
    try:
        requests.post(f"{API_BASE}/channel-status", json={"channel": "sms", "status": True}, timeout=5)
    except:
        pass

    # Initial poll to populate seen_sms_ids (so we don't analyze old messages)
    initial_messages = fetch_sms(adb_path)
    for msg in initial_messages:
        seen_sms_ids.add(msg["id"])
        
    print(f"   Watching for new SMS messages (Polling every {POLL_INTERVAL}s)...\n")
    
    try:
        while True:
            # Check if device is connected before polling
            dev_check = subprocess.run([adb_path, "get-state"], capture_output=True, text=True)
            if "device" not in dev_check.stdout:
                print("   ⚠️  Device lost! Waiting for reconnection...")
                subprocess.run([adb_path, "wait-for-device"])
                print("   ✅ Device reconnected!")
                
            messages = fetch_sms(adb_path)
            for msg in messages:
                if msg["id"] not in seen_sms_ids:
                    seen_sms_ids.add(msg["id"])
                    analyze_sms(msg["body"], msg["address"])
                    
            time.sleep(POLL_INTERVAL)
            
    except KeyboardInterrupt:
        print("\nShutting down ADB Monitor...")
        try:
            requests.post(f"{API_BASE}/channel-status", json={"channel": "sms", "status": False}, timeout=5)
        except:
            pass

if __name__ == "__main__":
    main()

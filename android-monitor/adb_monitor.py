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
seen_whatsapp_msgs = set()
seen_clipboard_texts = set()
safe_links = set()

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
            
            # Privacy: Hide phone numbers
            if sum(c.isdigit() for c in address) >= 8:
                address = "Hidden Number"
            
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

def monitor_notifications(adb_path):
    print("   🛡️  Starting WhatsApp Notification Monitor...")
    try:
        requests.post(f"{API_BASE}/channel-status", json={"channel": "whatsapp", "status": True}, timeout=5)
    except:
        pass

    while True:
        try:
            dev_check = subprocess.run([adb_path, "get-state"], capture_output=True, text=True)
            if "device" not in dev_check.stdout:
                time.sleep(5)
                continue

            result = subprocess.run(
                [adb_path, "shell", "dumpsys", "notification", "--noredact"],
                capture_output=True, text=True, timeout=10
            )
            
            if result.returncode == 0:
                output = result.stdout
                records = output.split("NotificationRecord(")
                
                for record in records:
                    if "pkg=com.whatsapp" in record:
                        title_match = re.search(r'android\.title=String \((.*?)\)', record)
                        text_match = re.search(r'android\.text=String \((.*?)\)', record)
                        
                        if title_match and text_match:
                            sender = title_match.group(1)
                            msg = text_match.group(1)
                            
                            # Privacy: Hide phone numbers
                            if sum(c.isdigit() for c in sender) >= 8:
                                sender = "Hidden Contact"
                            
                            # Simple hash to avoid duplicate processing
                            msg_hash = hash(f"{sender}:{msg}")
                            
                            if msg_hash not in seen_whatsapp_msgs:
                                seen_whatsapp_msgs.add(msg_hash)
                                
                                # Ignore standard WhatsApp system messages
                                if sender != "WhatsApp" and "messages" not in msg.lower():
                                    print(f"\n📱 [AVD WhatsApp] Notification from {sender}: {msg[:60]}...")
                                    try:
                                        resp = requests.post(f"{API_BASE}/analyze", json={
                                            "input_type": "text",
                                            "content": f"WhatsApp from {sender}: {msg}",
                                            "channel": "whatsapp",
                                            "language_hint": "auto"
                                        }, timeout=30)
                                        
                                        res_json = resp.json()
                                        verdict = res_json.get('verdict', 'UNKNOWN')
                                        score = res_json.get('risk_score', 0)
                                        print(f"   → Verdict: {verdict} ({score}/100)")
                                    except Exception as e:
                                        print(f"   ❌ Analysis failed: {e}")
                                        
        except Exception as e:
            pass
            
        time.sleep(POLL_INTERVAL)

def monitor_clipboard(adb_path):
    print("   🛡️  Starting Clipboard Monitor...")
    try:
        requests.post(f"{API_BASE}/channel-status", json={"channel": "clipboard", "status": True}, timeout=5)
    except:
        pass

    while True:
        try:
            dev_check = subprocess.run([adb_path, "get-state"], capture_output=True, text=True)
            if "device" not in dev_check.stdout:
                time.sleep(5)
                continue

            result = subprocess.run(
                [adb_path, "shell", "dumpsys", "clipboard"],
                capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0:
                output = result.stdout
                
                # Extract clipboard text using regex
                match = re.search(r'ClipData\s*\{.*?text:\s*"(.*?)"', output, re.IGNORECASE | re.DOTALL)
                if not match:
                    match = re.search(r'T:"(.*?)"', output)
                
                if match:
                    clip_text = match.group(1).strip()
                    if clip_text and clip_text not in seen_clipboard_texts:
                        seen_clipboard_texts.add(clip_text)
                        
                        if 5 < len(clip_text) < 1000:
                            print(f"\n📋 [AVD Clipboard] New copied text: {clip_text[:60]}...")
                            try:
                                resp = requests.post(f"{API_BASE}/analyze", json={
                                    "input_type": "text",
                                    "content": clip_text,
                                    "channel": "clipboard",
                                    "language_hint": "auto"
                                }, timeout=30)
                                
                                res_json = resp.json()
                                verdict = res_json.get('verdict', 'UNKNOWN')
                                score = res_json.get('risk_score', 0)
                                print(f"   → Verdict: {verdict} ({score}/100)")
                            except Exception as e:
                                print(f"   ❌ Analysis failed: {e}")
        except Exception as e:
            pass
        time.sleep(POLL_INTERVAL)

def monitor_logcat(adb_path):
    print("   🛡️  Starting Deep-Link Intent Monitor (Chrome Filter)...")
    try:
        # Clear logcat first to avoid old logs
        subprocess.run([adb_path, "logcat", "-c"])
        
        # Monitor logcat continuously for VIEW intents
        process = subprocess.Popen(
            [adb_path, "logcat", "ActivityManager:I", "ActivityTaskManager:I", "*:S"],
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
                    
                    # Ignore internal RakshaOS dashboard URLs
                    if "10.0.2.2:3000" in url or "localhost:3000" in url:
                        continue
                        
                    # If we already proved it's safe, let it open normally
                    if url in safe_links:
                        continue
                        
                    print(f"\n🌐 [AVD Chrome] Intent to open: {url}")
                    
                    is_quarantined = any(q_url in url for q_url in quarantine_list)
                    
                    if is_quarantined:
                        print(f"   🚨 [SINKHOLE] Pre-quarantined link! Force closing browser!")
                        subprocess.run([adb_path, "shell", "am", "force-stop", "com.android.chrome"])
                        blocked_url = "http://10.0.2.2:3000/android?blocked=true"
                        subprocess.run([adb_path, "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", blocked_url])
                    else:
                        # 1. Instantly kill Chrome BEFORE scanning
                        subprocess.run([adb_path, "shell", "am", "force-stop", "com.android.chrome"])
                        
                        # 2. Show a "Scanning..." page on the emulator
                        scanning_url = "http://10.0.2.2:3000/android?scanning=true"
                        subprocess.run([adb_path, "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", scanning_url])
                        
                        # 3. Perform Real-time AI check
                        print("   🔍 Real-time scanning link...")
                        try:
                            resp = requests.post(f"{API_BASE}/analyze", json={
                                "input_type": "text",
                                "content": f"User opened URL: {url}",
                                "channel": "chrome",
                                "language_hint": "auto"
                            }, timeout=5)
                            res = resp.json()
                            if res.get("verdict") in ["WARNING", "HIGH_RISK", "EMERGENCY"]:
                                print(f"   🚨 [SINKHOLE] AI Flagged Link! Force closing browser!")
                                subprocess.run([adb_path, "shell", "am", "force-stop", "com.android.chrome"])
                                blocked_url = "http://10.0.2.2:3000/android?blocked=true"
                                subprocess.run([adb_path, "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", blocked_url])
                            else:
                                print(f"   ✅ [SAFE] Link verified. Re-launching Chrome...")
                                safe_links.add(url)
                                subprocess.run([adb_path, "shell", "am", "force-stop", "com.android.chrome"])
                                subprocess.run([adb_path, "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", url])
                        except Exception as e:
                            pass
                        
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
    threading.Thread(target=monitor_notifications, args=(adb_path,), daemon=True).start()
    threading.Thread(target=monitor_clipboard, args=(adb_path,), daemon=True).start()
    
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

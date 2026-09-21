"""
RakshaOS Email Monitor — IMAP IDLE real-time email scanner
Connects to Gmail/email via IMAP and auto-scans incoming emails.
"""

import os
import re
import time
import email
import logging
import imaplib
from email.header import decode_header
from html.parser import HTMLParser

try:
    import requests
except ImportError:
    os.system("pip install requests")
    import requests

logger = logging.getLogger(__name__)

API_BASE = os.getenv("RAKSHAOS_API_URL", "http://localhost:8000/api")
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")  # App Password for Gmail
IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.gmail.com")
IMAP_PORT = int(os.getenv("IMAP_PORT", "993"))

class HTMLTextExtractor(HTMLParser):
    """Strip HTML tags and extract text."""
    def __init__(self):
        super().__init__()
        self.result = []
    def handle_data(self, data):
        self.result.append(data)
    def get_text(self):
        return ' '.join(self.result)

def html_to_text(html):
    extractor = HTMLTextExtractor()
    extractor.feed(html)
    return extractor.get_text()

def extract_urls(text):
    return re.findall(r'https?://[^\s<>"]+', text)

def decode_subject(subject):
    decoded = decode_header(subject)
    parts = []
    for part, charset in decoded:
        if isinstance(part, bytes):
            parts.append(part.decode(charset or 'utf-8', errors='replace'))
        else:
            parts.append(part)
    return ' '.join(parts)

def get_email_body(msg):
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            ct = part.get_content_type()
            if ct == "text/plain":
                payload = part.get_payload(decode=True)
                if payload:
                    body = payload.decode(errors='replace')
                    break
            elif ct == "text/html":
                payload = part.get_payload(decode=True)
                if payload:
                    body = html_to_text(payload.decode(errors='replace'))
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            ct = msg.get_content_type()
            decoded = payload.decode(errors='replace')
            body = html_to_text(decoded) if ct == "text/html" else decoded
    return body.strip()

def analyze_email(subject, body, sender):
    """Send email content to RakshaOS for analysis."""
    content = f"From: {sender}\nSubject: {subject}\n\n{body[:500]}"
    urls = extract_urls(body)
    if urls:
        content += f"\n\nEmbedded URLs: {', '.join(urls[:5])}"
    
    try:
        resp = requests.post(f"{API_BASE}/analyze", json={
            "input_type": "text",
            "content": content,
            "channel": "email",
            "language_hint": "auto"
        }, timeout=30)
        
        result = resp.json()
        verdict = result.get('verdict', 'UNKNOWN')
        score = result.get('risk_score', 0)
        
        print(f"   → Verdict: {verdict} ({score}/100)")
        
        if verdict in ('HIGH_RISK', 'EMERGENCY'):
            print(f"   ⚠️  DANGEROUS EMAIL from {sender}: {subject}")
            
    except Exception as e:
        print(f"   ❌ Analysis failed: {e}")

def monitor_inbox():
    print("🛡️  RakshaOS Email Monitor v1.0")
    print(f"   IMAP Server: {IMAP_SERVER}")
    print(f"   Email: {EMAIL_ADDRESS}")
    print("   Monitoring inbox for new emails...\n")
    
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("❌ EMAIL_ADDRESS and EMAIL_PASSWORD must be set in .env")
        return
    
    # Notify backend
    try:
        requests.post(f"{API_BASE}/channel-status", json={"channel": "email", "status": True}, timeout=5)
    except Exception:
        pass
    
    seen_uids = set()
    
    while True:
        try:
            # Connect
            mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
            mail.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            mail.select("INBOX")
            
            # Get recent unseen emails
            status, messages = mail.search(None, 'UNSEEN')
            if status == 'OK' and messages[0]:
                uid_list = messages[0].split()
                
                for uid in uid_list[-5:]:  # Process last 5 unseen
                    uid_str = uid.decode()
                    if uid_str in seen_uids:
                        continue
                    seen_uids.add(uid_str)
                    
                    status, msg_data = mail.fetch(uid, '(RFC822)')
                    if status == 'OK':
                        raw = msg_data[0][1]
                        msg = email.message_from_bytes(raw)
                        
                        subject = decode_subject(msg.get('Subject', ''))
                        sender = msg.get('From', 'Unknown')
                        body = get_email_body(msg)
                        
                        print(f"📧 New email from {sender}: {subject[:60]}...")
                        analyze_email(subject, body, sender)
            
            mail.logout()
            
        except Exception as e:
            logger.error(f"IMAP error: {e}")
        
        # Wait before next check (IDLE simulation)
        time.sleep(10)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    monitor_inbox()

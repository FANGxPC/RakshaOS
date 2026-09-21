import re
from urllib.parse import urlparse, parse_qs
from typing import List, Dict, Any

class UPIAnalyzer:
    """Analyzes UPI deep links (upi://pay?...) for fraud indicators."""
    
    KNOWN_SCAM_VPAS = [
        "paytm-12345@ybl",
        "scammer@upi",
    ]
    
    SUSPICIOUS_VPA_PATTERNS = [
        r'^[a-z0-9]{15,}@',         # Very long random string before @
        r'\d{10,}@',                  # Just a phone number as VPA
    ]
    
    SOCIAL_ENGINEERING_KEYWORDS = [
        "refund", "cashback", "prize", "reward", "lottery", "won",
        "receive", "credit", "bonus", "offer", "free",
    ]

    def analyze(self, upi_links: List[str]) -> Dict[str, Any]:
        results = []
        for link in upi_links:
            try:
                parsed = urlparse(link)
                params = parse_qs(parsed.query)
                
                payee_vpa = params.get("pa", [None])[0]
                amount = params.get("am", [None])[0]
                note = params.get("tn", [""])[0]
                payee_name = params.get("pn", [""])[0]
                
                risks = []
                
                # Check: Link says "receive" but it's a PAY intent
                if note and any(kw in note.lower() for kw in self.SOCIAL_ENGINEERING_KEYWORDS):
                    risks.append({
                        "type": "social_engineering_note",
                        "detail": f"Transaction note contains suspicious keyword in: '{note}'. You NEVER need to enter UPI PIN to RECEIVE money."
                    })
                
                # Check: Known scam VPA
                if payee_vpa and payee_vpa.lower() in self.KNOWN_SCAM_VPAS:
                    risks.append({
                        "type": "known_scam_vpa",
                        "detail": f"Payee VPA '{payee_vpa}' is in our known-scam database."
                    })
                
                # Check: Suspicious VPA pattern
                if payee_vpa:
                    for pattern in self.SUSPICIOUS_VPA_PATTERNS:
                        if re.match(pattern, payee_vpa.lower()):
                            risks.append({
                                "type": "suspicious_vpa_pattern",
                                "detail": f"Payee VPA '{payee_vpa}' looks auto-generated or suspicious."
                            })
                            break
                
                # Check: Large amount
                if amount:
                    try:
                        amt = float(amount)
                        if amt > 10000:
                            risks.append({
                                "type": "large_amount",
                                "detail": f"Transaction amount ₹{amt:,.0f} is unusually large."
                            })
                    except ValueError:
                        pass
                
                results.append({
                    "link": link,
                    "payee_vpa": payee_vpa,
                    "payee_name": payee_name,
                    "amount": amount,
                    "note": note,
                    "risks": risks,
                    "risk_level": "HIGH" if risks else "LOW"
                })
            except Exception:
                pass
        
        return {
            "upi_links_analyzed": results,
            "overall_upi_risk": "HIGH" if any(r["risk_level"] == "HIGH" for r in results) else "LOW"
        }

import json
import os
from typing import List, Dict, Any
from urllib.parse import urlparse

class URLHeuristics:
    def __init__(self):
        self.known_domains = []
        self.suspicious_tlds = []
        self._load_data()

    def _load_data(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, "../../data/known_scam_domains.json")
        try:
            with open(data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.known_domains = data.get("domains", [])
                self.suspicious_tlds = data.get("tlds", [])
        except Exception as e:
            print(f"Failed to load known scam domains: {str(e)}")

    def analyze(self, urls: List[str]) -> Dict[str, Any]:
        results = []
        for url in urls:
            try:
                parsed = urlparse(url if "://" in url else f"http://{url}")
                domain = parsed.netloc.lower()
                
                is_known_scam = domain in self.known_domains
                has_suspicious_tld = any(domain.endswith(tld) for tld in self.suspicious_tlds)
                is_ip_address = domain.replace(".", "").isdigit()
                
                risk_level = "HIGH" if (is_known_scam or has_suspicious_tld or is_ip_address) else "LOW"
                
                results.append({
                    "url": url,
                    "domain": domain,
                    "is_known_scam": is_known_scam,
                    "has_suspicious_tld": has_suspicious_tld,
                    "is_ip_address": is_ip_address,
                    "risk_level": risk_level
                })
            except Exception:
                pass
                
        return {
            "analyzed_urls": results,
            "overall_risk": "HIGH" if any(r["risk_level"] == "HIGH" for r in results) else "LOW"
        }

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from ..services.reasoning.complaint_generator import ComplaintGenerator

router = APIRouter()

class ContactInfo(BaseModel):
    name: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""

class RecoveryRequest(BaseModel):
    amount_paid: float
    payment_method: str
    scam_description: str
    evidence_files: Optional[List[str]] = []
    contact_info: Optional[ContactInfo] = ContactInfo()

@router.post("/recovery")
async def handle_recovery(request: RecoveryRequest):
    # Generate dynamic AI draft
    gen = ComplaintGenerator()
    draft = await gen.generate(request.model_dump())
    
    # Static checklist and steps
    checklist = [
        {"item": "Screenshot of scam message/website", "status": "provided" if request.evidence_files else "needed"},
        {"item": "Transaction reference/UTR number", "status": "needed"},
        {"item": "Bank statement showing debit", "status": "needed"}
    ]
    
    steps = [
        "Call 1930 (National Cyber Crime Helpline) within 1 hour to request a transaction hold.",
        "File an official online complaint at cybercrime.gov.in.",
        "Contact your bank's fraud helpline immediately to report the transaction.",
        "Do NOT delete the original scam messages or clear your browser history — they are evidence."
    ]
    
    contacts = {
        "cyber_helpline": "1930",
        "online_portal": "https://cybercrime.gov.in",
        "rbi_helpline": "14448"
    }
    
    return {
        "complaint_draft": draft,
        "evidence_checklist": checklist,
        "immediate_steps": steps,
        "helpful_contacts": contacts
    }

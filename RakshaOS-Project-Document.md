# RakshaOS
### AI-Powered Digital Safety Layer for Ordinary People

**Hackathon:** Global Innovation Hackathon 2026 – Build for a Better Future (Bharat Academix)
**Team size:** 1–6 members
**Domain:** Cybersecurity / Social Impact / Accessibility

---

## 1. One-Line Pitch

> RakshaOS is an AI-powered digital safety layer that understands what a user is being *asked to do* — not just what they're receiving — and detects scams, fraud, manipulation, and risky digital actions before they cause financial or personal harm.

**Bigger vision (closing slide):** *"We want to build the trust layer of the internet for ordinary people."*

---

## 2. Problem Statement

Digital fraud in India has moved from a niche risk to a daily, national-scale crisis:

- "Digital arrest" scam losses grew roughly **21x in two years** — from ₹91 crore (2022) to ₹1,935 crore (2024) — with reported cases nearly tripling to over 1.2 lakh in 2024.
- India recorded **12.71 lakh cyber fraud complaints in just the first six months of 2026**, with losses exceeding **₹10,178 crore** — and only ~29% of that money is ever placed on hold or recovered.
- The Supreme Court has flagged that cumulative digital scam losses for Indians now exceed **₹52,000 crore** — larger than the annual budget of several states.
- Victims are disproportionately ordinary people with no cybersecurity background: elderly citizens, first-time smartphone/UPI users, and people under psychological pressure (fake police calls, fake courier/customs fees, fake KYC deadlines).
- Existing tools (Truecaller, spam blockers, antivirus apps) only filter *known bad numbers or known bad links*. None of them evaluate the **content, psychological pattern, or requested action** of a message, call, QR code, or document in real time.

**The gap:** nobody helps an ordinary person answer the question *"is what I'm being asked to do right now actually safe?"* — in the moment, in plain language.

---

## 3. Proposed Solution

RakshaOS is a **safety layer**, not a chatbot and not a traditional antivirus. A user forwards a suspicious input (message text, screenshot, QR code, or document), and RakshaOS returns a risk verdict with a clear explanation and a recommended next action.

### Core reasoning chain
```
Message / Screenshot / QR / Document
        ↓
   Who sent it?
        ↓
   What is it asking for?
        ↓
   Is there artificial urgency?
        ↓
   Is the sender impersonating an authority?
        ↓
   Where does the link/QR actually go?
        ↓
   Is money or credentials being requested?
        ↓
   Does the requested action make sense?
        ↓
   Match against known scam patterns
        ↓
   RISK SCORE + WHY + RECOMMENDED ACTION
```

### Example
**Input:** *"Your electricity bill is overdue. Connection will be disconnected in 30 minutes. Pay ₹1,842 immediately via this link."*

**Output:**
```
🔴 HIGH RISK (91%)

Why?
✓ Artificial urgency
✓ Payment request
✓ Sender authenticity uncertain
✓ Link/domain mismatch
✓ Matches known utility-payment scam pattern

Recommended action: DON'T PAY. Verify through the official
electricity provider's app or helpline.
```

---

## 4. Innovation / Uniqueness

| Typical scam detector | RakshaOS |
|---|---|
| "Is this message a scam?" | "What is the user being asked to do, how risky is that action, why, and what's the safest next step?" |
| Binary scam / not-scam label | **Scam Genome** — represents each scam as a behavioral signature (urgency + authority impersonation + payment request + external link), so it recognizes *new variants*, not just previously-seen messages |
| Black-box flag | **"Why?" engine** — always shows itemized, plain-language reasons behind the risk score |
| Stops at detection | **Full lifecycle**: Prevent → Detect → Explain → Respond → Recover, including a "Recovery Mode" for users who already paid (evidence preservation, complaint drafting, next steps) |
| Cybersecurity-only framing | Extends into **consumer protection** (fake discounts, manipulative urgency in shopping) and **accessibility** (simplified explanations for elderly/low-literacy users) |

---

## 5. Target Users

- General smartphone/UPI users receiving SMS, WhatsApp, email, or call-based scam attempts
- Elderly and less digitally-literate individuals — the most frequently targeted and highest-loss group
- First-time digital-payment users in semi-urban/rural areas
- Families who want a way to protect older relatives without requiring them to become cybersecurity-literate

---

## 6. Expected Impact

- Reduces financial loss by catching scams *before* payment, not after
- Gives users an actionable "Recovery Mode" path even after money is already sent, improving the currently low (~29%) fund-recovery rate
- Builds general scam literacy over time through repeated, explainable exposure to the "Why?" reasoning
- Scales naturally into consumer protection (fake discounts/manipulative selling) and public-service safety (fake government/scholarship notices), not just financial fraud

---

## 7. Proposed Technology

- **Reasoning core:** a single well-prompted LLM call returning structured JSON (risk score + detected signals + plain-language explanation) — this *is* the practical implementation of the "Scam Genome," rather than multiple bespoke ML models
- **OCR:** Tesseract (or similar) to convert screenshots/documents into text for the same reasoning pipeline
- **QR handling:** standard QR decoding libraries to extract destination URLs, plus basic domain/keyword heuristics
- **Knowledge grounding:** a curated set of real scam patterns sourced from public advisories (I4C, 1930 cyber-fraud helpline, cybercrime.gov.in, news reports), used as few-shot context to ground the LLM's classifications
- **Frontend:** a risk-score dashboard UI showing the verdict, itemized reasons, and recommended action

---

## 8. Feasibility (Hackathon MVP Scope)

The full long-term vision (live call monitoring, computer vision, telecom/bank-level integration, real-time multi-channel protection) is **not** attempted for the hackathon. The MVP deliberately narrows to what's demonstrable and honest:

**In scope for MVP:**
- Text/WhatsApp-message input → risk analysis → risk card with reasons + recommended action
- Screenshot input → OCR → same pipeline
- QR code → decoded URL → heuristic check → same pipeline
- "I already paid" flow → generates a pre-filled complaint draft (template only, not a real submission) + an evidence checklist

**Explicitly out of scope for MVP (shown only as roadmap):**
- Live voice-call monitoring (requires telephony-level integration)
- Real-time integration with banks/telecom/government reporting systems (no public API exists)
- Custom-trained NLP/computer-vision models (replaced by one LLM call for hackathon feasibility)

---

## 9. Scalability

Post-hackathon, RakshaOS is designed to expand into a **cross-channel trust layer**:

```
WhatsApp ─┐
SMS ──────┤
Email ────┤
Browser ──┤
Payments ─┤──→ RAKSHAOS → SAFE / WARN / PROTECT
QR ───────┤
Calls ────┤
Shopping ─┘
```

Longer-term additions: live call analysis (with deepfake-voice detection, given scammers increasingly use AI-generated voices/videos for impersonation), bank/telecom-level integration for real-time transaction holds, and a "Family Shield" mode that notifies a trusted relative when an elderly user receives a high-risk interaction.

---

## 10. Implementation Approach (Architecture)

```
                 RAKSHAOS
                     │
        ┌────────────┴────────────┐
        │   USER DIGITAL INPUT    │
        │ (text / screenshot / QR)│
        └────────────┬────────────┘
                     ↓
        ┌─────────────────────────┐
        │ 1. PERCEPTION LAYER     │
        │  OCR + QR decode        │
        └────────────┬────────────┘
                     ↓
        ┌─────────────────────────┐
        │ 2. REASONING LAYER      │
        │  LLM risk classifier +  │
        │  few-shot scam examples │
        └────────────┬────────────┘
                     ↓
        ┌─────────────────────────┐
        │ 3. DECISION ENGINE      │
        │  SAFE / WARNING /       │
        │  HIGH RISK / EMERGENCY  │
        └────────────┬────────────┘
                     ↓
        ┌─────────────────────────┐
        │ 4. RESPONSE LAYER       │
        │  Warn · Verify · Guide  │
        │  Report draft · Save    │
        │  evidence               │
        └─────────────────────────┘
```

---

## 11. 10-Day Build Plan

> Note: the hackathon's official "Project Submission" window is only 20–24 Sep (≈4–5 days). Treat the period from today through 24 Sep as the real build window and start immediately — don't wait for formal selection to begin coding.

| Days | Milestone |
|---|---|
| 1–2 | Collect 30–50 real scam examples from public advisories (I4C, 1930 helpline, cybercrime.gov.in, news). Design the structured LLM prompt (risk score + signals + explanation as JSON). |
| 3–4 | Build the core text pipeline end-to-end: input → risk engine → risk card with reasons → recommended action. This is the non-negotiable core demo path. |
| 5–6 | Add screenshot input (OCR) and QR input (decode + URL heuristics), feeding into the same pipeline. |
| 7 | Add the "I already paid" Recovery Mode: complaint-draft generator + evidence checklist. |
| 8–9 | Polish the risk-score dashboard UI. Script and rehearse 5–8 realistic demo scenarios (digital arrest, fake KYC, fake discount, fake courier, QR payment trick). |
| 10 | Finalize the pitch deck: problem slide with real fraud statistics, live MVP demo, then a clearly-labeled "future vision" slide showing the full architecture. |

---

## 12. Evaluation Criteria Mapping

| Criterion (weight) | How RakshaOS addresses it |
|---|---|
| Innovation & Originality (25%) | "What are you being asked to do" framing, Scam Genome, and full Prevent→Recover lifecycle — not just another scam classifier |
| Technical Implementation (25%) | Working end-to-end pipeline: OCR + QR decode + LLM reasoning + structured risk output |
| Real-World Impact (20%) | Grounded in current, large-scale, verifiable fraud statistics affecting ordinary people |
| Feasibility & Scalability (15%) | MVP is honestly scoped to what's buildable in the window; scalability shown via a separate, clearly-labeled roadmap |
| UX & Design (10%) | Plain-language "Why?" explanations designed for non-technical and elderly users |
| Presentation & Demo (5%) | Scripted, rehearsed scenarios rather than live improvisation |

---

## 13. Team & Next Steps

- [ ] Finalize idea submission text (due 17 Sep 26)
- [ ] Start MVP build immediately (don't wait for selection)
- [ ] Assemble/confirm team (1–6 members)
- [ ] Source scam-pattern examples from public advisories
- [ ] Build and rehearse demo scenarios

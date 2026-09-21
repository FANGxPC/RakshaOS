# RakshaOS

## AI-Powered Digital Safety Layer for Ordinary People

Idea Submission - Global Innovation Hackathon 2026

Domain: Cybersecurity

RakshaOS looks at what a person is actually being asked to do in a message, call, QR code or document, and warns them before they lose money or hand over personal information. It isn't a chatbot and it isn't another antivirus - it's meant to sit in the moment right before someone taps 'pay' or shares an OTP, and ask the one

question nobody else is asking: is this safe?

## 1. Problem Statement

Digital fraud in India isn't a niche risk anymore - it's a daily, national-scale problem, and it's landing hardest

on people who are least equipped to spot it.

- \- 'Digital arrest' scam losses grew roughly 21x in two years, from 91 crore in 2022 to 1,935 crore in ₹ ₹ 2024, with reported cases nearly tripling to over 1.2 lakh in 2024.

- \- India recorded 12.71 lakh cyber-fraud complaints in just the first six months of 2026, with losses exceeding 10,178 crore - and only around 29% of that money is ever placed on hold or recovered. ₹

- \- The Supreme Court has noted that cumulative digital scam losses for Indians now exceed ₹ 52,000 crore, larger than the annual budget of several states.

- \- Victims are disproportionately elderly citizens, first-time UPI users, and people put under sudden psychological pressure - fake police calls, fake courier or customs fees, fake KYC deadlines.

- \- Tools like Truecaller, spam blockers and antivirus apps only filter known bad numbers or known bad links. None of them actually look at what a message is asking someone to do.

That's the real gap - nobody helps an ordinary person answer the question that matters in the moment: 'is what

I'm being asked to do right now actually safe?' - in plain language, before it's too late.

## 2. Proposed Solution

A user forwards a suspicious input - a message, a screenshot, a QR code, or a document - and RakshaOS returns a risk verdict along with plain-language reasons and a recommended next step. The reasoning behind

that verdict follows a simple chain:

- \- Who sent it, and can that identity be trusted? - What is the message actually asking the person to do? - Is there artificial urgency or fear built into it? - Is the sender impersonating an authority - police, bank, government, courier? - Where does the embedded link or QR code actually lead? - Is money, an OTP, or login credentials being asked for? - Does the requested action even make logical sense? - How closely does it match patterns seen in known scams?

These signals come together as a single risk score, a short list of reasons behind that score, and a recommended action - for example, 'Don't pay. Verify through the official provider's app or helpline.' For families with elderly relatives, a flagged high-risk message can also be shared with one tap to a trusted contact, so the person facing the scam isn't the only line of defence.


## 3. Innovation / Uniqueness

Most scam detectors stop at a yes/no label. RakshaOS is built around a different question and a different

depth of explanation:

| Typical scam detector Is this message a scam? | RakshaOS What is the user being asked to do, how risky is that action, why, and what's the safest next step? Represents each scam as a behavioural signature - urgency, authority impersonation, payment request, external link - so new variants get caught, not just previously-seen ones Always shows an itemised, plain-language explanation behind the risk score Covers the full lifecycle - prevent, detect, explain, respond, and recover, including help for users who've already paid Also covers consumer protection (fake discounts, manipulative urgency) and accessibility, with explanations that can be read aloud in the user's own language Works across every channel a scam actually arrives |
| --- | --- |
| Binary scam / not-scam label |   |
| Black-box flag |   |
| Stops at detection |   |
| Cybersecurity-only framing |   |
| On-device AI scam-call screening now exists (Google's Gemini Nano, launched in India Nov through - SMS, WhatsApp, QR, screenshots, documents - |   |
| 2025) - but it's calls-only, English-first, and restricted to Pixel 9+ devices, under 1% of the roadmap Indian Android base | on any phone, with multilingual voice output on the |

## 4. Target Users

- \- General smartphone and UPI users who receive SMS, WhatsApp, email or call-based scam attempts.

- \- Elderly and less digitally-literate individuals - the group most frequently targeted and hit hardest.

- \- First-time digital-payment users in semi-urban and rural areas.

- \- Families who want a way to protect older relatives without expecting them to become cybersecurity experts.

## 5. Expected Impact

- \- Catches scams before payment is made, rather than helping only after the money is gone.

- \- Gives users a concrete path forward even if they've already paid, which should help against the currently low (around 29%) fund-recovery rate.

- \- Builds real scam literacy over time, since every interaction comes with a reason, not just a warning.

- \- Extends naturally beyond financial fraud into consumer protection (fake discounts, manipulative selling) and public-service safety (fake government or scholarship notices).

- \- As more people use it, patterns of new or fast-spreading scams can be surfaced early, so a warning can go out before a scam peaks in a region.

- \- Progress can be tracked concretely - classifier precision/recall, time-to-verdict, and the share of high-risk flags where users report they didn't proceed with the risky action.


## 6. Proposed Technology

- \- Reasoning core: a single, carefully-prompted call to Gemma 4 E2B/E4B - Google DeepMind's small, multimodal, open-weight models (released April 2026) - returning a structured output (risk score, detected signals, plain-language explanation) rather than several separate bespoke ML models. Small enough to run on-device, keeping sensitive screenshots and messages off a server by default.

- \- OCR (Tesseract or similar) to convert screenshots and documents into text for the same reasoning pipeline.

- \- Standard QR-decoding libraries to extract destination URLs, combined with basic domain and keyword heuristics.

- \- A curated set of real scam patterns, drawn from public advisories such as I4C, the 1930 cyber-fraud helpline, cybercrime.gov.in, and verified news reports, used as grounding context for the model.

- \- A simple risk-score dashboard showing the verdict, the reasons behind it, and the recommended action, with an option to have that explanation read aloud in the user's own language.

## 7. Feasibility

The long-term vision - live call monitoring, computer vision, telecom or bank-level integration - isn't something we're attempting for the hackathon. The plan is to build something honest and demonstrable within

the time available.

## What's in scope for the MVP

- \- Text or WhatsApp message input, run through risk analysis, producing a risk card with reasons and a recommended action.

- \- Screenshot input, processed through OCR into the same pipeline.

- \- QR code input, decoded and checked against heuristics through the same pipeline.

- \- An 'I already paid' flow that generates a pre-filled complaint draft and an evidence checklist.

- \- A one-tap option to share a high-risk result with a trusted contact, and basic voice output in two or three languages.

## What's out of scope for now, and kept only as a roadmap item

- \- Live voice-call monitoring, which needs telephony-level integration.

- \- Real-time integration with banks, telecom providers or government reporting systems - no public API exists for this today.

- \- Custom-trained NLP or computer-vision models, which a single LLM call replaces for the hackathon timeline.

## 8. Scalability

Beyond the hackathon, the same core engine can sit behind every channel a person actually uses - WhatsApp, SMS, email, browser activity, payments, QR codes, calls and shopping - all resolving to one simple verdict:

- safe, warn, or protect. - Live call analysis, including detection of AI-generated (deepfake) voices, since scammers are

- increasingly using synthetic voices and videos to impersonate people. - Bank or telecom-level integration that could place a real-time hold on a high-risk transaction. - A family-shield mode that runs by default for elderly users who opt in, rather than as a one-off action. - A public early-warning feed built from aggregated, anonymised signals, shareable with local cyber-cells and consumer-protection bodies.

- \- Voice support expanding across more regional languages over time.


- \- A freemium path to sustainability - free core detection, with a paid family-shield tier for multi-relative monitoring, plus an embedded-protection SDK/API for banks, UPI apps and telecom operators, who have a direct financial incentive to cut fraud losses on their own books.

- 9. Brief Implementation Approach

The system is organised into four layers, kept simple enough to demo live and honest enough to grow later.

- \- Perception layer - OCR and QR decoding turn any input (text, screenshot, QR) into plain text.

- \- Reasoning layer - an LLM risk classifier, grounded with real scam examples, produces the structured verdict.

- \- Decision engine - maps that verdict to one of four states: safe, warning, high risk, or emergency.

- \- Response layer - warns the user, suggests verification steps, guides them, drafts a complaint if needed, saves evidence, and can alert a trusted contact or read the explanation aloud.

The build starts with collecting real scam examples and designing the core prompt, then getting the text pipeline working end to end as the main demo path, before layering in screenshots, QR codes, the recovery flow, and the family-alert and voice features. The last stretch is spent polishing the interface and rehearsing a handful of realistic scenarios - digital arrest, fake KYC, a fake discount, a fake courier fee, and a QR payment

trick.

## 10. Risks & Safeguards

- \- False positives are handled as confidence-scored guidance rather than hard blocks - 'high risk, verify first' - so a genuine urgent action is never silently stopped.

- \- False negatives from novel scam wording are mitigated by the behavioural-signature approach, which generalises better than keyword lists, with grounding refreshed from I4C and 1930-helpline advisories as new patterns emerge.

- \- Hallucination in the explanation is constrained by a structured output schema and cross-checked against deterministic signals - known scam-URL lists, domain age, QR destination - rather than trusting the model's reasoning alone.

- \- Sensitive data in transit is limited by preferring on-device inference by default, with no permanent storage of screenshots or financial details beyond the session unless the user opts in to save evidence for a complaint.

- \- Trusted-contact sharing is always a one-tap user action, never automatic.

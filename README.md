<div align="center">

# 🛡️ RakshaOS
**AI-Powered Digital Safety Layer for Ordinary People**

[![Hackathon](https://img.shields.io/badge/Hackathon-Global_Innovation_2026-blue)](https://bharatacademix.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-React-black.svg)](https://nextjs.org/)

</div>

**[🎥 Watch the RakshaOS Demo on YouTube](https://youtu.be/uT6rZPi5amk)**

> RakshaOS is an AI-powered digital safety layer that understands what a user is being *asked to do* — not just what they're receiving — and detects scams, fraud, manipulation, and risky digital actions before they cause financial or personal harm.

---

## 🚨 The Problem

Digital fraud is a national-scale crisis affecting the most vulnerable:
- Cyber fraud losses exceed **₹10,178 crore** in early 2026 alone, with less than 29% recovery.
- Scams like "Digital Arrest" have grown by 21x in just two years.
- Current tools (Truecaller, spam blockers) only filter known bad numbers/links. They don't evaluate the *psychological pattern* or the *requested action*.

**RakshaOS** helps ordinary people answer one critical question: *"Is what I'm being asked to do right now actually safe?"*

## 💡 Our Solution

RakshaOS intercepts suspicious digital inputs (messages, screenshots, QR codes) and passes them through an AI reasoning pipeline to determine risk.

Instead of a black-box "spam" or "not spam" label, RakshaOS provides:
1. **Risk Score** (Safe, Warning, High Risk, Emergency)
2. **"Why?"** (Plain-language reasons behind the verdict)
3. **Actionable Next Steps** (e.g., "Don't pay. Verify via the official helpline")

### 🧬 The "Scam Genome" Approach
By analyzing *behavioral signatures* (urgency + authority impersonation + payment request), RakshaOS identifies **new** and **mutated** scam variants rather than relying on stale blocklists.

---

## ✨ Features (MVP Scope)

- 💬 **Text/WhatsApp Analysis**: Paste messages to get an instant risk assessment.
- 🖼️ **Screenshot Scanning**: OCR-powered analysis of suspicious emails, fake payment receipts, or KYC warnings.
- 🔗 **QR Code Decoder**: safely extracts and checks URLs behind QR codes against heuristics.
- 🚑 **Recovery Mode**: An "I already paid" flow that generates a pre-filled complaint draft and evidence checklist to boost recovery rates.
- 🗣️ **Multilingual Support**: Simplified explanations designed for elderly and low-literacy users.

---

## 📸 Screenshots

Here are some screenshots of RakshaOS in action:

| RakshaOS Command Center | Live Threat Detection & Analysis |
|:---:|:---:|
| <img src="./screenshots/Screenshot%20from%202026-09-24%2016-13-34.png" width="100%" alt="RakshaOS Command Center" /> | <img src="./screenshots/Screenshot%20from%202026-09-24%2016-13-44.png" width="100%" alt="Live Threat Detection & Analysis" /> |
| **Family Shield Alert Notification** | **Detailed Risk Analysis & Signals** |
| <img src="./screenshots/Screenshot%20from%202026-09-24%2016-13-49.png" width="100%" alt="Family Shield Alert Notification" /> | <img src="./screenshots/Screenshot%20from%202026-09-24%2016-14-04.png" width="100%" alt="Detailed Risk Analysis & Signals" /> |
| **Safety Scan Progress** | **Recovery Mode & Complaint Draft** |
| <img src="./screenshots/Screenshot%20from%202026-09-24%2016-14-09.png" width="100%" alt="Safety Scan Progress" /> | <img src="./screenshots/Screenshot%20from%202026-09-24%2016-14-21.png" width="100%" alt="Recovery Mode & Complaint Draft" /> |

---

## 🏗️ Architecture

```mermaid
graph TD
    A[User Digital Input <br/> Text / Screenshot / QR] --> B(1. Perception Layer <br/> OCR + QR Decode)
    B --> C(2. Reasoning Layer <br/> LLM Risk Classifier)
    C --> D(3. Decision Engine <br/> Risk Scoring)
    D --> E(4. Response Layer <br/> Warn / Verify / Guide / Report)
```

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Python, FastAPI / Flask 
- **AI / Reasoning**: Google Gemma 4 E2B/E4B (Structured JSON Output via Few-Shot Prompting)
- **Perception**: Tesseract OCR (Image to Text), standard QR decoding
- **Integrations**: Telegram Bot API (for easy user interaction)

---

## 📂 Project Structure

- `frontend/` - Next.js based web dashboard and user interface.
- `backend/` - Python API for handling OCR, QR decoding, and LLM reasoning.
- `android-app/` & `android-monitor/` - Android specific implementations for on-device safety.
- `whatsapp-monitor/` - WhatsApp integration layer.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- **Android Studio & AVD (Android Virtual Device)**: Required to test the live SMS interception. Ensure an emulator is running.
- **Telegram Account**: To create and test the Telegram bot sync.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/RakshaOS.git
cd RakshaOS
```

### 2. Setup Environment Variables & Telegram Bot
Before running the platform, you need to create a Telegram bot and get your API keys:
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`, follow the prompts, and copy the **Bot Token**.
3. (Optional) Get your Telegram Chat ID if you want direct push alerts.

Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
```

### 3. Start the Platform
RakshaOS includes an automated startup script that handles dependency installation (frontend, backend & monitors) and service launching. 

Make sure your **Android Emulator (AVD) is actively running**, then execute the launcher:

```bash
chmod +x start_rakshaos.sh
./start_rakshaos.sh
```

**What the script does automatically:**
1. Installs Python backend dependencies and boots the FastAPI & Telegram bot.
2. Installs Node.js dependencies for the Next.js frontend and boots the Command Center.
3. Installs dependencies for the WhatsApp monitor.
4. Starts the ADB monitor in the background.

### 4. Test the Interceptors
- **Command Center:** Access the dashboard at `http://localhost:3000`.
- **Live SMS Interception:** Open the Extended Controls (three dots) in your Android Emulator, navigate to **Phone**, and send a mock SMS to the emulator. It will automatically intercept.
- **WhatsApp Sync:** Check the terminal output where you ran the start script. A QR code will appear. Scan it with your WhatsApp (Linked Devices) to start live message monitoring.
- **Telegram Bot:** Send a suspicious message (e.g., "Your bank account is blocked, click here to update KYC") directly to your newly created Telegram Bot. It will instantly reply with a risk analysis!

To stop all services, simply press `Ctrl+C` in the terminal.

---

## 🔮 Future Roadmap (Beyond Hackathon)
- Live voice-call monitoring with deepfake detection.
- Bank and Telecom API integration for real-time transaction holds.
- **"Family Shield"**: Automatic notifications to a trusted relative when an elderly user faces a high-risk interaction.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/your-username/RakshaOS/issues).

## 📝 License
This project is [MIT](https://opensource.org/licenses/MIT) licensed.

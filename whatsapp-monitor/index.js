const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const API_BASE = process.env.RAKSHAOS_API_URL || 'http://localhost:8000/api';
const ENABLE_AUTO_REPLY = process.env.AUTO_REPLY !== 'false'; // default: true

// ─── Initialize WhatsApp Client ─────────────────────────────
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Track analyzed messages to avoid duplicates
const analyzedMessages = new Set();

// ─── QR Code for Auth ───────────────────────────────────────
client.on('qr', (qr) => {
    console.log('\n🔐 Scan this QR code with WhatsApp to connect RakshaOS:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n');
    
    // Notify backend that WhatsApp is awaiting auth
    notifyChannel('whatsapp', false);
});

client.on('ready', () => {
    console.log('✅ WhatsApp connected! RakshaOS is now monitoring all incoming messages.\n');
    notifyChannel('whatsapp', true);
});

client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp disconnected:', reason);
    notifyChannel('whatsapp', false);
});

// ─── Message Handler — THE CORE ─────────────────────────────
client.on('message', async (msg) => {
    // Skip status updates, own messages, and already-analyzed messages
    if (msg.isStatus || msg.fromMe || analyzedMessages.has(msg.id._serialized)) return;
    analyzedMessages.add(msg.id._serialized);
    
    // Keep set from growing too large
    if (analyzedMessages.size > 1000) {
        const entries = [...analyzedMessages];
        entries.splice(0, 500).forEach(id => analyzedMessages.delete(id));
    }
    
    let inputType = 'text';
    let content = msg.body;
    
    // Handle image messages (screenshots / QR codes)
    if (msg.hasMedia) {
        try {
            const media = await msg.downloadMedia();
            if (media && media.mimetype.startsWith('image/')) {
                inputType = 'screenshot';
                content = media.data; // base64
            }
        } catch (err) {
            console.log('Could not download media:', err.message);
            return;
        }
    }
    
    // Skip empty messages
    if (!content || content.trim().length < 5) return;
    
    try {
        console.log(`📨 Analyzing message from ${msg.from}: "${content.substring(0, 80)}..."`);
        
        const response = await axios.post(`${API_BASE}/analyze`, {
            input_type: inputType,
            content: content,
            channel: 'whatsapp',
            language_hint: 'auto'
        }, { timeout: 30000 });
        
        const result = response.data;
        const verdict = result.verdict;
        const score = result.risk_score;
        
        console.log(`   → Verdict: ${verdict} (${score}/100)`);
        
        // Auto-reply with warning if HIGH_RISK or EMERGENCY
        if (ENABLE_AUTO_REPLY && (verdict === 'HIGH_RISK' || verdict === 'EMERGENCY')) {
            const emoji = verdict === 'EMERGENCY' ? '🚨' : '🔴';
            const warning = [
                `${emoji} *RakshaOS Safety Alert*`,
                ``,
                `*Risk Score:* ${score}/100 — ${verdict.replace('_', ' ')}`,
                ``,
                `*Why?*`,
                result.explanation,
                ``,
                `*What to do:*`,
                result.recommended_action,
                ``,
                `_Protected by RakshaOS — your AI safety layer_`
            ].join('\n');
            
            // Small delay to appear human-like
            await new Promise(resolve => setTimeout(resolve, 1500));
            await msg.reply(warning);
            
            console.log(`   ⚠️  Auto-replied with warning`);
        }
        
    } catch (err) {
        console.error('   ❌ Analysis failed:', err.message);
    }
});

// ─── Helpers ────────────────────────────────────────────────
async function notifyChannel(channel, status) {
    try {
        await axios.post(`${API_BASE}/channel-status`, { channel, status });
    } catch (err) {
        // Backend may not be running yet, that's okay
    }
}

// ─── Start ──────────────────────────────────────────────────
console.log('🛡️  RakshaOS WhatsApp Monitor v1.0');
console.log('   Connecting to WhatsApp Web...\n');
client.initialize();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down WhatsApp monitor...');
    await notifyChannel('whatsapp', false);
    await client.destroy();
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

'use client';
import { useState, useRef } from 'react';

const CHANNELS = [
  { id: 'sms', icon: '💬', label: 'SMS', placeholder: 'Type or paste SMS message here...' },
  { id: 'whatsapp', icon: '📱', label: 'WhatsApp', placeholder: 'Paste forwarded WhatsApp message...' },
  { id: 'clipboard', icon: '📋', label: 'Clipboard', placeholder: 'Paste copied URL or text...' },
  { id: 'upi', icon: '💳', label: 'UPI', placeholder: 'Paste UPI link (upi://pay?...)' },
  { id: 'email', icon: '📧', label: 'Email', placeholder: 'Paste email content...' },
];

export default function AndroidCompanion() {
  const [activeChannel, setActiveChannel] = useState('sms');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shieldActive, setShieldActive] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const textareaRef = useRef(null);

  const channel = CHANNELS.find(c => c.id === activeChannel);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setSent(false);

    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      await fetch(`http://${host}:8000/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_type: 'text',
          content: text,
          channel: activeChannel,
          language_hint: 'auto',
        }),
      });
      setScanCount(prev => prev + 1);
      setSent(true);
      setText('');

      // Vibrate on Android if supported
      if (navigator.vibrate) navigator.vibrate(100);

      // Reset the sent indicator after 2s
      setTimeout(() => setSent(false), 2000);
    } catch (e) {
      console.error('Failed to send:', e);
    }
    setSending(false);
  };

  // Notify backend that channel is active
  const activateChannel = async (ch) => {
    setActiveChannel(ch);
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      await fetch(`http://${host}:8000/api/channel-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: ch, status: true }),
      });
    } catch (e) { /* backend may not be ready */ }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col" style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>

      {/* ─── Android-style Status Bar ─── */}
      <div className="bg-[#111118] px-4 py-2 flex items-center justify-between text-[11px] text-gray-500 border-b border-white/5">
        <span>RakshaOS</span>
        <div className="flex items-center gap-2">
          <span>{scanCount} scanned</span>
          <div className={`w-2 h-2 rounded-full ${shieldActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        </div>
      </div>

      {/* ─── Header ─── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">RakshaOS Shield</h1>
            <p className="text-[11px] text-gray-500">AI Safety Layer • Always On</p>
          </div>
        </div>
      </div>

      {/* ─── Shield Status Card ─── */}
      <div className="mx-4 mb-4 rounded-2xl overflow-hidden" style={{
        background: shieldActive
          ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(59,130,246,0.1))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
        border: `1px solid ${shieldActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${shieldActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="text-sm font-semibold">{shieldActive ? 'Protection Active' : 'Protection Off'}</p>
              <p className="text-[11px] text-gray-400">Monitoring all channels for threats</p>
            </div>
          </div>
          <button
            onClick={() => setShieldActive(!shieldActive)}
            className={`w-11 h-6 rounded-full relative transition-colors ${shieldActive ? 'bg-green-500' : 'bg-gray-600'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow ${shieldActive ? 'left-5.5' : 'left-0.5'}`}
              style={{ left: shieldActive ? '22px' : '2px' }}
            ></div>
          </button>
        </div>
      </div>

      {/* ─── Channel Tabs ─── */}
      <div className="px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => activateChannel(ch.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeChannel === ch.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              <span>{ch.icon}</span>
              <span>{ch.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Input Area ─── */}
      <div className="flex-1 px-4 flex flex-col">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={channel?.placeholder}
            className="w-full h-full min-h-[160px] bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500/50 focus:bg-white/[0.07] outline-none resize-none transition-all"
          />
          {sent && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 rounded-2xl border border-green-500/30 animate-in fade-in zoom-in duration-200">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-400 text-sm font-semibold">Sent to RakshaOS</span>
                <span className="text-green-400/60 text-xs">Check Command Center for results</span>
              </div>
            </div>
          )}
        </div>

        {/* ─── Action Button ─── */}
        <div className="py-4">
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              text.trim() && !sending
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 active:scale-[0.98]'
                : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Scanning...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Scan with RakshaOS
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Bottom Nav (Android style) ─── */}
      <div className="bg-[#111118] border-t border-white/5 px-6 py-3 flex items-center justify-around">
        <div className="flex flex-col items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-[10px] text-blue-400 font-medium">Shield</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-medium">History</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] font-medium">Settings</span>
        </div>
      </div>
    </div>
  );
}

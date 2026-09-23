'use client';
import { useState, useRef, useEffect } from 'react';

const CHANNELS = [
  { id: 'sms', icon: '💬', label: 'SMS', placeholder: 'Type or paste SMS message here...' },
  { id: 'call', icon: '🎙️', label: 'Live Call', placeholder: 'Speak to simulate call...' },
  { id: 'whatsapp', icon: '📱', label: 'WhatsApp', placeholder: 'Paste forwarded WhatsApp message...' },
  { id: 'clipboard', icon: '📋', label: 'Clipboard', placeholder: 'Paste copied URL or text...' },
  { id: 'upi', icon: '💳', label: 'UPI', placeholder: 'Paste UPI link (upi://pay?...)' },
  { id: 'email', icon: '📧', label: 'Email', placeholder: 'Paste email content...' },
];

export default function AndroidCompanion() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeChannel, setActiveChannel] = useState('sms');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shieldActive, setShieldActive] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const channel = CHANNELS.find(c => c.id === activeChannel);

  // Initialize SpeechRecognition and parse URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      // eslint-disable-next-line
      setIsBlocked(params.get('blocked') === 'true');
      // eslint-disable-next-line
      setIsScanning(params.get('scanning') === 'true');

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setText(prev => {
            // Avoid duplicate appends by only taking final results or just updating the latest
            // For simplicity, we just use the final result of this event chunk
            return currentTranscript.trim();
          });
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      // Auto-send after a brief pause
      if (text.trim()) {
         setTimeout(handleSend, 1000);
      }
    } else {
      setText('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

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

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-6 text-center text-[#1E2433]">
        <article className="border border-[#B23A2E]/35 bg-white shadow-sm max-w-lg w-full text-left">
          <div className="border-b border-[#B23A2E]/25 bg-[#B23A2E]/[0.07] p-6 sm:p-9">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#B23A2E] text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-[#B23A2E] uppercase tracking-wide">Connection Blocked</p>
                <h1 className="mt-1 text-3xl tracking-[-0.02em] text-[#1E2433] sm:text-4xl">This site is very likely a scam.</h1>
              </div>
            </div>
            <p className="mt-6 text-lg text-[#515A6B]">RakshaOS intercepted a malicious payload. Please don't enter any details or send money.</p>
          </div>
          <div className="p-6 sm:p-9">
             <div className="border-l-4 border-[#4C7A5E] bg-[#4C7A5E]/[0.09] p-5">
               <p className="text-sm font-semibold text-[#4C7A5E]">What to do now</p>
               <p className="mt-2 text-lg font-medium text-[#1E2433]">Close this tab immediately. Do not click any further links.</p>
             </div>
             <div className="mt-6">
                <button className="flex items-center justify-center gap-2 bg-[#1E2433] text-base font-semibold text-white px-6 py-4 w-full" onClick={() => window.close()}>
                  Close Tab
                </button>
             </div>
          </div>
        </article>
      </div>
    );
  }

  if (isScanning) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-6 text-center text-[#1E2433]">
        <div className="mb-6 flex items-center gap-2 text-sm font-medium text-[#4C7A5E]">
           <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
           Checking connection...
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">RakshaOS is scanning this link</h1>
        <p className="mt-3 text-lg text-[#687080]">Please wait a moment while we ensure this destination is safe.</p>
      </div>
    );
  }

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
        {activeChannel === 'call' ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-6 text-center transition-all">
             <div className="mb-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500/20 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-gray-800'}`}>
                   <button onClick={toggleListening} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         {isListening ? (
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> 
                         ) : (
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                         )}
                      </svg>
                   </button>
                </div>
             </div>
             <h3 className="text-lg font-semibold text-white mb-2">{isListening ? 'Listening to Call...' : 'Simulate Scam Call'}</h3>
             <p className="text-sm text-gray-400 mb-4">{isListening ? 'Speak into your microphone.' : 'Tap the mic and roleplay a scammer.'}</p>
             
             {text && (
                <div className="w-full bg-black/40 rounded-xl p-4 text-left border border-white/10 max-h-[120px] overflow-y-auto">
                   <p className="text-sm text-gray-200 italic">&quot;{text}&quot;</p>
                </div>
             )}
             
             {sent && (
               <div className="mt-4 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 Audio analyzed and sent to Command Center
               </div>
             )}
          </div>
        ) : (
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
        )}

        {/* ─── Action Button ─── */}
        {activeChannel !== 'call' && (
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
        )}
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

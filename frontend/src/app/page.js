'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import RiskGauge from '../components/RiskGauge';

const CHANNEL_ICONS = {
  whatsapp: '💬', telegram: '🤖', chrome: '🌐', email: '📧',
  sms: '📱', clipboard: '📋', upi: '💳', web: '🖥️',
  notification: '🔔',
};

const CHANNEL_NAMES = {
  whatsapp: 'WhatsApp', telegram: 'Telegram', chrome: 'Chrome', email: 'Email',
  sms: 'SMS', clipboard: 'Clipboard', upi: 'UPI', web: 'Web',
  notification: 'Notification',
};

const VERDICT_STYLES = {
  SAFE: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400' },
  WARNING: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400' },
  HIGH_RISK: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
  EMERGENCY: { bg: 'bg-red-600/20', border: 'border-red-600', text: 'text-red-400', badge: 'bg-red-600 text-white animate-pulse' },
};

export default function Home() {
  const [events, setEvents] = useState([]);
  const [channels, setChannels] = useState({});
  const [stats, setStats] = useState({ total_scanned: 0, threats_detected: 0, safe_count: 0 });
  const [connected, setConnected] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [familyShield, setFamilyShield] = useState(false);
  const wsRef = useRef(null);
  const feedRef = useRef(null);
  const audioCtxRef = useRef(null);

  // ─── Sound Alerts ────────────────────────────────────────
  const playAlertSound = useCallback((isEmergency) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = isEmergency ? 880 : 660;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + (isEmergency ? 0.8 : 0.4));
    } catch (e) { /* Audio context may not be available */ }
  }, []);

  // ─── WebSocket Connection ────────────────────────────────
  useEffect(() => {
    function connect() {
      const host = window.location.hostname || 'localhost';
      const ws = new WebSocket(`ws://${host}:8000/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('✅ Connected to RakshaOS Command Center');
      };

      ws.onmessage = (event) => {
        if (event.data === 'pong') return;
        
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'init') {
            setChannels(msg.channels || {});
            setStats(msg.stats || {});
            setEvents(msg.recent_events || []);
          }

          if (msg.type === 'new_analysis') {
            setEvents(prev => [msg.data, ...prev].slice(0, 50));
            setStats(msg.stats || {});

            // Play sound for dangerous verdicts
            if (msg.data.verdict === 'HIGH_RISK' || msg.data.verdict === 'EMERGENCY') {
              playAlertSound(msg.data.verdict === 'EMERGENCY');
              
              // Text-to-Speech Alert
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(
                  `Warning. ${msg.data.verdict.replace('_', ' ')} detected on ${msg.data.channel || 'unknown channel'}.`
                );
                utterance.rate = 1.1;
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
              }
            }
          }

          if (msg.type === 'channel_update') {
            setChannels(msg.channels || {});
          }
        } catch (e) {
          console.error("WebSocket parsing error:", e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();
    return () => wsRef.current?.close();
  }, [playAlertSound]);

  // ─── Manual Analysis ─────────────────────────────────────
  const handleManualAnalyze = async () => {
    if (!manualText.trim()) return;
    setAnalyzing(true);
    try {
      const host = window.location.hostname || 'localhost';
      await fetch(`http://${host}:8000/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_type: 'text', content: manualText, channel: 'web' })
      });
      setManualText('');
      setShowManualInput(false);
    } catch (e) { console.error(e); }
    setAnalyzing(false);
  };

  // ─── Family Shield Toggle ────────────────────────────────
  const toggleFamilyShield = async () => {
    const newState = !familyShield;
    setFamilyShield(newState);
    try {
      const host = window.location.hostname || 'localhost';
      await fetch(`http://${host}:8000/api/family-shield`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState })
      });
    } catch (e) { console.error('Failed to toggle Family Shield', e); }
  };

  // ─── Threat Category Counter ─────────────────────────────
  const threatCategories = {};
  events.forEach(e => {
    if (e.verdict === 'HIGH_RISK' || e.verdict === 'EMERGENCY') {
      const cat = e.scam_type || 'unknown';
      threatCategories[cat] = (threatCategories[cat] || 0) + 1;
    }
  });
  const sortedCategories = Object.entries(threatCategories).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const activeChannelCount = Object.values(channels).filter(Boolean).length;
  const totalChannels = Object.keys(channels).length || 7;

  // ─── Keepalive Ping & Time Updater ───────────────────────
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const wsInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 25000);
    
    const timerInterval = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    
    return () => {
      clearInterval(wsInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const timeAgo = (ts) => {
    if (!ts) return '';
    const diff = Math.floor((now - new Date(ts).getTime()) / 1000);
    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    return `${Math.floor(diff/3600)}h ago`;
  };

  return (
    <main className="flex-grow flex flex-col min-h-screen">
      <Header />

      <div className="pt-20 px-4 md:px-6 max-w-[1600px] mx-auto w-full">
        {/* ─── Top Bar ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <h1 className="text-xl md:text-2xl font-display font-bold">
              🛡️ Command Center
            </h1>
            <span className="text-sm text-gray-500 hidden md:inline">
              {activeChannelCount}/{totalChannels} Channels Active
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowManualInput(!showManualInput)} className="text-xs px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10">
              {showManualInput ? 'Hide' : '+ Manual Check'}
            </button>
            <Link href="/recovery" className="text-xs px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20">
              🆘 Recovery Mode
            </Link>
          </div>
        </div>

        {/* ─── Manual Input (Collapsible) ───────────────────── */}
        {showManualInput && (
          <div className="mb-6 glass-card p-4 flex gap-3">
            <textarea value={manualText} onChange={e => setManualText(e.target.value)} placeholder="Paste suspicious message here..." className="flex-1 bg-black/30 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-blue-500 outline-none resize-none h-20" />
            <button onClick={handleManualAnalyze} disabled={analyzing} className="btn-primary h-20 px-6">
              {analyzing ? '...' : 'Analyze'}
            </button>
          </div>
        )}

        {/* ─── Main Grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">

          {/* ── Left Sidebar: Stats & Channels ────────────── */}
          <div className="lg:col-span-1 space-y-6">

            {/* Live Stats */}
            <div className="border border-[#D9D5CC] bg-white/55 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1E2433] mb-5">System Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#E5E1D8]">
                  <span className="text-[#687080] text-sm">Total Scanned</span>
                  <span className="text-[#1E2433] font-bold text-lg">{stats.total_scanned}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-[#E5E1D8]">
                  <span className="text-[#687080] text-sm">Threats Detected</span>
                  <span className="text-[#B23A2E] font-bold text-lg">{stats.threats_detected}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#687080] text-sm">Safe</span>
                  <span className="text-[#4C7A5E] font-bold text-lg">{stats.safe_count}</span>
                </div>
              </div>
            </div>

            {/* Channel Status */}
            <div className="border border-[#D9D5CC] bg-white/55 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1E2433] mb-5">Active Channels</h3>
              <div className="space-y-4">
                {Object.entries(channels).map(([ch, active]) => (
                  <div key={ch} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CHANNEL_ICONS[ch] || '📡'}</span>
                      <span className="text-sm font-medium text-[#515A6B]">{CHANNEL_NAMES[ch] || ch}</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${active ? 'bg-[#4C7A5E] animate-pulse shadow-[0_0_8px_rgba(76,122,94,0.8)]' : 'bg-[#E5E1D8]'}`}></div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Main Feed: Live Threat Feed ───────────────── */}
          <div className="lg:col-span-3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1E2433] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B23A2E] animate-pulse shadow-[0_0_8px_rgba(178,58,46,0.8)]"></span>
                Live Event Feed
              </h2>
              <span className="text-sm text-[#687080]">{events.length} events logged</span>
            </div>

            <div ref={feedRef} className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 pb-10">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#687080]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                  <p className="text-base font-medium">Waiting for events...</p>
                  <p className="text-sm mt-2">Start sending messages to the emulator to see interceptions.</p>
                </div>
              ) : (
                events.map((ev, idx) => {
                  const isHighRisk = ev.verdict === 'HIGH_RISK' || ev.verdict === 'EMERGENCY';
                  const isWarning = ev.verdict === 'WARNING';
                  const isSafe = ev.verdict === 'SAFE';
                  
                  let articleClass = 'border border-[#E5E1D8] bg-white';
                  let headerClass = 'border-b border-[#E5E1D8] bg-[#F7F4EE] p-3 sm:p-4';
                  let titleColor = 'text-[#1E2433]';
                  let verdictColor = 'text-[#687080]';
                  let verdictBg = 'bg-[#E5E1D8]';

                  if (isHighRisk) {
                    articleClass = 'border border-[#B23A2E]/35 bg-white/60';
                    headerClass = 'border-b border-[#B23A2E]/25 bg-[#B23A2E]/[0.07] p-3 sm:p-4';
                    titleColor = 'text-[#1E2433]';
                    verdictColor = 'text-[#B23A2E]';
                    verdictBg = 'bg-[#B23A2E] text-white';
                  } else if (isWarning) {
                    articleClass = 'border border-[#D98E2B]/35 bg-white/60';
                    headerClass = 'border-b border-[#D98E2B]/25 bg-[#D98E2B]/[0.07] p-3 sm:p-4';
                    titleColor = 'text-[#1E2433]';
                    verdictColor = 'text-[#D98E2B]';
                    verdictBg = 'bg-[#D98E2B] text-white';
                  } else if (isSafe) {
                    articleClass = 'border border-[#4C7A5E]/35 bg-white/60';
                    headerClass = 'border-b border-[#4C7A5E]/25 bg-[#4C7A5E]/[0.07] p-3 sm:p-4';
                    titleColor = 'text-[#1E2433]';
                    verdictColor = 'text-[#4C7A5E]';
                    verdictBg = 'bg-[#4C7A5E] text-white';
                  }

                  return (
                    <article key={idx} className={`${articleClass} transition-opacity ${idx === 0 ? 'animate-in fade-in duration-500' : ''}`}>
                      <div className={headerClass}>
                        <div className="flex items-start gap-3">
                          <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${verdictBg}`}>
                            {isHighRisk ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                            ) : isWarning ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                            )}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <p className={`text-xs font-bold uppercase tracking-wider ${verdictColor}`}>{ev.verdict?.replace('_', ' ')}</p>
                              <span className="text-xs font-medium text-[#687080]">{timeAgo(ev.timestamp)} • {CHANNEL_NAMES[ev.channel] || ev.channel}</span>
                            </div>
                            <h1 className={`mt-1 text-lg sm:text-xl font-semibold tracking-tight ${titleColor}`}>
                              {ev.verdict === 'SAFE' ? 'This message appears safe.' : 
                               ev.verdict === 'WARNING' ? 'Proceed with caution.' : 
                               'This is very likely a scam.'}
                            </h1>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 sm:p-5 bg-white">
                        <div className="flex items-center justify-between mb-2">
                           <h2 className="text-sm font-semibold text-[#1E2433]">Intercepted Payload</h2>
                           <p className="text-xs font-medium text-[#515A6B]">Risk Score: <span className={`font-bold ${verdictColor}`}>{ev.risk_score}/100</span></p>
                        </div>
                        <div className="border border-[#E5E1D8] bg-[#F7F4EE] p-3 text-[#515A6B] text-sm break-words whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {ev.input_preview || ev.explanation}
                        </div>
                        
                        {ev.explanation && (
                          <div className="mt-4">
                            <h2 className="text-sm font-semibold text-[#1E2433]">Why we&apos;re saying this</h2>
                            <p className="mt-1.5 text-[#515A6B] text-sm leading-relaxed">
                              {ev.explanation}
                            </p>
                          </div>
                        )}
                        
                        {isHighRisk && (
                          <div className="mt-4 border-l-4 border-[#4C7A5E] bg-[#4C7A5E]/[0.09] p-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#4C7A5E]">What to do now</p>
                            <p className="mt-1 text-sm font-medium text-[#1E2433]">Stop replying. Block the sender. Do not click any links or share personal details.</p>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

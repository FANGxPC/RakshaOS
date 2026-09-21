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
  }, []);

  // ─── Keepalive Ping ──────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 25000);
    return () => clearInterval(interval);
  }, []);

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

  const timeAgo = (ts) => {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">

          {/* ── Left Sidebar: Stats & Channels ────────────── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Live Stats */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Live Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Total Scanned</span>
                    <span className="text-white font-bold text-lg">{stats.total_scanned}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Threats Detected</span>
                    <span className="text-red-400 font-bold text-lg">{stats.threats_detected}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Safe</span>
                    <span className="text-green-400 font-bold text-lg">{stats.safe_count}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Status */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Channels</h3>
              <div className="space-y-3">
                {Object.entries(channels).map(([ch, active]) => (
                  <div key={ch} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{CHANNEL_ICONS[ch] || '📡'}</span>
                      <span className="text-sm text-gray-300">{CHANNEL_NAMES[ch] || ch}</span>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Threat Categories */}
            {sortedCategories.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Threat Types</h3>
                <div className="space-y-2">
                  {sortedCategories.map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min(100, count * 20)}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-400 w-24 truncate">{cat.replace(/_/g, ' ')}</span>
                      <span className="text-xs font-bold text-red-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Family Shield */}
            <div className={`glass-card p-5 border ${familyShield ? 'border-blue-500/50 bg-blue-500/10' : 'border-gray-800'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <span>👨‍👩‍👧</span> Family Shield
                </h3>
                <button 
                  onClick={toggleFamilyShield}
                  className={`w-10 h-5 rounded-full relative transition-colors ${familyShield ? 'bg-blue-500' : 'bg-gray-600'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${familyShield ? 'left-5' : 'left-1'}`}></div>
                </button>
              </div>
              <p className="text-xs text-gray-400">
                {familyShield 
                  ? 'Active: Emergency alerts will be forwarded to your trusted contact via Telegram.' 
                  : 'Inactive: Turn on to auto-alert family members during emergencies.'}
              </p>
            </div>
          </div>

          {/* ── Main Feed: Live Threat Feed ───────────────── */}
          <div className="lg:col-span-3">
            <div className="glass-card p-5 min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Live Threat Feed
                </h3>
                <span className="text-xs text-gray-600">{events.length} events</span>
              </div>

              <div ref={feedRef} className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                {events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-sm font-medium">Waiting for events...</p>
                    <p className="text-xs mt-1">Start WhatsApp monitor, Telegram bot, or Chrome extension to see live interceptions.</p>
                  </div>
                ) : (
                  events.map((ev, idx) => {
                    const styles = VERDICT_STYLES[ev.verdict] || VERDICT_STYLES.WARNING;
                    return (
                      <div key={idx} className={`p-4 rounded-xl border ${styles.bg} ${styles.border} transition-all hover:scale-[1.01] ${idx === 0 ? 'animate-in slide-in-from-right duration-300' : ''}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-2xl flex-shrink-0">{CHANNEL_ICONS[ev.channel] || '📡'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${styles.badge}`}>
                                  {ev.verdict?.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {CHANNEL_NAMES[ev.channel] || ev.channel}
                                </span>
                                <span className="text-xs text-gray-600">{timeAgo(ev.timestamp)}</span>
                              </div>
                              <p className="text-sm text-gray-300 truncate">{ev.input_preview || ev.explanation}</p>
                              {ev.explanation && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.explanation}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className={`text-2xl font-bold font-display ${styles.text}`}>{ev.risk_score}</div>
                            <div className="text-[10px] text-gray-500">/100</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

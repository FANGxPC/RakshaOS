import Link from 'next/link';

export default function Hero() {
  return (
    <div className="flex flex-col items-center text-center mt-24 mb-16 px-4 max-w-5xl mx-auto relative">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Cyber Security Scanner Graphic */}
      <div className="relative w-32 h-32 mb-8 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-blue-500/30"></div>
        <div className="absolute inset-2 rounded-full border border-blue-400/20 border-t-blue-400 animate-spin" style={{ animationDuration: '3s' }}></div>
        <div className="absolute inset-6 rounded-full border border-purple-500/20 border-b-purple-500 animate-[spin_4s_reverse_infinite]"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-500/10 to-transparent"></div>
        
        {/* Scanner Line */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="w-full h-[2px] bg-blue-400 shadow-[0_0_15px_#60a5fa] animate-[scan-line_3s_linear_infinite]"></div>
        </div>

        <svg className="w-10 h-10 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>

      <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff] text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(0,240,255,0.2)]">
        SYSTEM ONLINE • ALL CHANNELS SECURE
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
        Omnipresent AI Security for the <br className="hidden md:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#0055ff] drop-shadow-sm">
          Digital World
        </span>
      </h1>
      
      <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-light tracking-wide">
        RakshaOS intercepts scams, fraud, manipulation, and risky digital actions natively at the OS layer—before they cause financial harm.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
        <Link href="/analyze" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
          Scan Payload
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        <Link href="/recovery" className="glass-panel text-lg px-8 py-4 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
          <span className="text-red-400 font-bold">SOS</span> Recovery Mode
        </Link>
      </div>
      
      {/* High-Tech Stats Ticker */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left relative z-10">
        <div className="glass-card p-6 border-l-[3px] border-l-[#ff003c] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
          </div>
          <div className="text-3xl font-bold text-white mb-1 tracking-tight font-display">₹52,000 Cr+</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Cumulative digital scam losses</div>
        </div>
        <div className="glass-card p-6 border-l-[3px] border-l-[#ffbb00] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="text-3xl font-bold text-white mb-1 tracking-tight font-display">12.71 Lakh</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Cyber fraud complaints (H1 2026)</div>
        </div>
        <div className="glass-card p-6 border-l-[3px] border-l-[#00f0ff] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="text-3xl font-bold text-white mb-1 tracking-tight font-display">29%</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Average fund recovery rate</div>
        </div>
      </div>
    </div>
  );
}

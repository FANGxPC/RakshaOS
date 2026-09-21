import Link from 'next/link';

export default function Hero() {
  return (
    <div className="flex flex-col items-center text-center mt-32 mb-16 px-4 max-w-4xl mx-auto">
      <div className="inline-block mb-4 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold tracking-wider uppercase">
        Global Innovation Hackathon 2026
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
        Your AI Safety Layer for the <br className="hidden md:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Digital World
        </span>
      </h1>
      
      <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
        RakshaOS detects scams, fraud, manipulation, and risky digital actions before they cause financial or personal harm.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/analyze" className="btn-primary text-lg px-8 py-4">
          Check if it&apos;s safe
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <Link href="/recovery" className="glass-panel text-lg px-8 py-4 text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
          I already paid
        </Link>
      </div>
      
      {/* Stats Ticker */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <div className="glass-panel p-6 border-l-4 border-l-red-500">
          <div className="text-3xl font-bold text-white mb-1">₹52,000 Cr+</div>
          <div className="text-sm text-gray-400">Cumulative digital scam losses in India</div>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-orange-500">
          <div className="text-3xl font-bold text-white mb-1">12.71 Lakh</div>
          <div className="text-sm text-gray-400">Cyber fraud complaints in H1 2026</div>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-blue-500">
          <div className="text-3xl font-bold text-white mb-1">29%</div>
          <div className="text-sm text-gray-400">Average fund recovery rate</div>
        </div>
      </div>
    </div>
  );
}

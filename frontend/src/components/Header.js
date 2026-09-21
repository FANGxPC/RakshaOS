import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 border-x-0 rounded-none bg-black/40 px-6 py-4 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <span className="font-display font-bold text-xl tracking-wide text-white">Raksha<span className="text-blue-400">OS</span></span>
      </Link>
      
      <nav className="hidden md:flex gap-6 items-center">
        <Link href="/analyze" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Analyze</Link>
        <Link href="/recovery" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Recovery Mode</Link>
        <Link href="/analyze" className="btn-primary text-sm px-4 py-2">
          Try Demo
        </Link>
      </nav>
    </header>
  );
}

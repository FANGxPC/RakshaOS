'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import RiskCard from '../../components/RiskCard';
import VoiceButton from '../../components/VoiceButton';
import FamilyAlert from '../../components/FamilyAlert';
import Link from 'next/link';

export default function ResultPage() {
  const [result, setResult] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // In a real app we'd pass this via state manager or URL ID,
    // but for MVP sessionStorage works great
    const savedResult = sessionStorage.getItem('rakshaResult');
    if (savedResult) {
      // eslint-disable-next-line
      setResult(JSON.parse(savedResult));
    } else {
      router.push('/analyze');
    }
  }, [router]);

  if (!result) return <div className="min-h-screen bg-black"></div>;

  return (
    <main className="flex-grow flex flex-col pt-24 min-h-screen pb-20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <RiskCard result={result} />
        
        {/* Action Row */}
        <div className="max-w-3xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <VoiceButton text={result.explanation} />
          
          <FamilyAlert 
            verdict={result.verdict} 
            score={result.risk_score} 
            explanation={result.explanation} 
          />
          
          <Link href="/analyze" className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs font-semibold">Check Another</span>
          </Link>
          
          <Link href="/recovery" className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xs font-semibold whitespace-nowrap">I Already Paid</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

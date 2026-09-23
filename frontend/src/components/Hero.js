import Link from 'next/link';

export default function Hero() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16 mt-16">
      <section className="mx-auto max-w-3xl">
        <div className="mb-10 max-w-xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-[#4C7A5E]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> 
            Here to help you pause and check
          </div>
          <h1 className="text-4xl tracking-[-0.03em] text-[#1E2433] sm:text-5xl">Not sure about a message?</h1>
          <p className="mt-5 text-lg text-[#687080] sm:text-xl">
            RakshaOS intercepts scams natively at the OS layer. Or, you can manually paste a message below, and we&apos;ll explain what it means and what you can do next.
          </p>
        </div>

        <div className="border border-[#D9D5CC] bg-white/55 p-5 sm:p-7 shadow-sm">
          <label htmlFor="message" className="mb-3 block text-base font-semibold text-[#1E2433]">Paste the message here</label>
          <textarea
            id="message"
            placeholder="Paste a WhatsApp message, SMS, email, or anything that feels unusual..."
            className="min-h-44 w-full resize-y border border-[#D9D5CC] bg-[#FDFCF9] p-4 text-base text-[#1E2433] placeholder:text-[#8A909B] focus:border-[#1E2433] focus:outline-none"
          />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 border border-[#D9D5CC] bg-transparent text-sm font-medium text-[#515A6B] hover:bg-[#F7F4EE]">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
                Paste
              </button>
            </div>
            <Link href="/analyze" className="flex items-center justify-center gap-2 bg-[#1E2433] px-5 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90">
              Check this message 
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link href="/recovery" className="flex items-center gap-3 border border-[#E5E1D8] bg-white/35 p-4 text-left text-sm font-medium text-[#515A6B] hover:border-[#B7B2A8]">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>I already paid</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
        
        <p className="mt-8 flex items-center gap-2 text-sm text-[#687080]">
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" className="text-[#4C7A5E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 4.81 17 6 19 6a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
          Your messages are checked privately on-device and never shared without your say-so.
        </p>
      </section>
    </div>
  );
}

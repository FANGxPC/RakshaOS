import Header from '../../components/Header';
import InputPanel from '../../components/InputPanel';

export default function AnalyzePage() {
  return (
    <main className="flex-grow flex flex-col pt-24 min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display">
            Scan for Safety
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Paste a suspicious message, upload a screenshot, or scan a QR code. RakshaOS will analyze the intent and tell you if it&apos;s safe.
          </p>
        </div>

        <InputPanel />
        
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your data is analyzed securely and not stored permanently.
          </p>
        </div>
      </div>
    </main>
  );
}

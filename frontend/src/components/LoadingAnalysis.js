export default function LoadingAnalysis({ progressStep }) {
  const steps = [
    "Initializing...",
    "Extracting details from input...",
    "Detecting malicious intent...",
    "Cross-checking Scam Genome...",
    "Generating final verdict..."
  ];

  return (
    <div className="flex flex-col items-center justify-center p-12 glass-card w-full max-w-xl mx-auto">
      {/* Animated Shield */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-l-2 border-r-2 border-purple-500 animate-spin animation-delay-200"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="w-full space-y-3">
        {steps.map((text, idx) => (
          <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${progressStep >= idx ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${progressStep > idx ? 'border-green-500 bg-green-500/20' : progressStep === idx ? 'border-blue-500 bg-blue-500/20 animate-pulse' : 'border-gray-600'}`}>
              {progressStep > idx && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {progressStep === idx && (
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
              )}
            </div>
            <span className={`text-sm ${progressStep === idx ? 'text-white font-medium' : 'text-gray-400'}`}>
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

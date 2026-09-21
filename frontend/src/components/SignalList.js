export default function SignalList({ signals }) {
  if (!signals || signals.length === 0) return null;

  return (
    <div className="mt-8 space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Detection Signals</h3>
      
      {signals.map((signal, idx) => (
        <div 
          key={idx} 
          className={`p-4 rounded-lg border ${signal.detected ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/5 border-green-500/10'} flex items-start gap-4 transition-all hover:bg-opacity-80`}
        >
          <div className="mt-1 flex-shrink-0">
            {signal.detected ? (
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <div>
            <h4 className={`font-semibold ${signal.detected ? 'text-red-100' : 'text-green-100'}`}>
              {signal.label}
            </h4>
            <p className={`text-sm mt-1 leading-relaxed ${signal.detected ? 'text-red-300' : 'text-green-300/70'}`}>
              {signal.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ActionCard({ action, verdict }) {
  const isDanger = verdict === "HIGH_RISK" || verdict === "EMERGENCY";
  const isWarning = verdict === "WARNING";
  
  let bgClass = "bg-green-500/10 border-green-500/30";
  let textClass = "text-green-400";
  let icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  if (isDanger) {
    bgClass = "bg-red-500/20 border-red-500/50";
    textClass = "text-red-400";
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  } else if (isWarning) {
    bgClass = "bg-yellow-500/10 border-yellow-500/30";
    textClass = "text-yellow-400";
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  return (
    <div className={`mt-8 p-6 rounded-xl border ${bgClass} flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left shadow-lg`}>
      <div className={`p-3 rounded-full bg-black/20 ${textClass}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommended Action</h3>
        <p className={`text-xl font-medium leading-relaxed ${textClass}`}>
          {action}
        </p>
      </div>
    </div>
  );
}

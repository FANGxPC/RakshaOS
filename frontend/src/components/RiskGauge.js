'use client';
import { useEffect, useState } from 'react';

export default function RiskGauge({ score, verdict }) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    // Animate score from 0 to target
    const duration = 1500;
    const steps = 60;
    const stepTime = Math.abs(Math.floor(duration / steps));
    let timer;

    if (currentScore < score) {
      timer = setInterval(() => {
        setCurrentScore(prev => {
          const next = prev + Math.ceil(score / steps);
          return next > score ? score : next;
        });
      }, stepTime);
    }

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  // Determine colors based on verdict
  let strokeColor = "stroke-green-500";
  let pulseClass = "";
  
  if (verdict === "WARNING") strokeColor = "stroke-yellow-500";
  if (verdict === "HIGH_RISK") strokeColor = "stroke-red-500";
  if (verdict === "EMERGENCY") {
    strokeColor = "stroke-red-600";
    pulseClass = "pulse-emergency";
  }

  // SVG Arc calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center w-64 h-64 mx-auto rounded-full ${pulseClass}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        {/* Background Circle */}
        <circle
          className="text-gray-800 stroke-current"
          strokeWidth="12"
          cx="100"
          cy="100"
          r="90"
          fill="transparent"
        ></circle>
        
        {/* Progress Circle */}
        <circle
          className={`${strokeColor} transition-all duration-300 ease-out`}
          strokeWidth="12"
          strokeLinecap="round"
          cx="100"
          cy="100"
          r="90"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        ></circle>
      </svg>
      
      {/* Inner Text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-display font-bold text-white tracking-tighter">
          {currentScore}
        </span>
        <span className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">
          Risk Score
        </span>
      </div>
    </div>
  );
}

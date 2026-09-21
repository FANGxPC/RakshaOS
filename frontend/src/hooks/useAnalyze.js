import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeInput } from '../utils/api';

export function useAnalyze() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [progressStep, setProgressStep] = useState(0);
  const router = useRouter();

  const analyze = async (inputType, content) => {
    setIsAnalyzing(true);
    setError(null);
    setProgressStep(1); // "Reading input..."

    try {
      // Simulate steps for UI polish if API is too fast
      setTimeout(() => setProgressStep(2), 800);  // "Detecting intent..."
      setTimeout(() => setProgressStep(3), 1600); // "Matching patterns..."
      
      const result = await analyzeInput(inputType, content);
      
      setProgressStep(4); // "Generating verdict..."
      
      // Store result in sessionStorage (since it's a prototype, this avoids complex state management)
      sessionStorage.setItem('rakshaResult', JSON.stringify(result));
      
      // Add slight delay before routing for smooth transition
      setTimeout(() => {
        router.push('/result');
      }, 500);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while analyzing the message.');
      setIsAnalyzing(false);
    }
  };

  return { analyze, isAnalyzing, error, progressStep, setError };
}

'use client';
import { useState } from 'react';
import { useAnalyze } from '../hooks/useAnalyze';
import LoadingAnalysis from './LoadingAnalysis';

export default function InputPanel() {
  const [activeTab, setActiveTab] = useState('text'); // text, screenshot, qr
  const [textContent, setTextContent] = useState('');
  const [fileContent, setFileContent] = useState(null); // base64
  const { analyze, isAnalyzing, error, progressStep, setError } = useAnalyze();

  const handleTextChange = (e) => {
    setTextContent(e.target.value);
    setError(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileContent(reader.result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (activeTab === 'text' && !textContent.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    if ((activeTab === 'screenshot' || activeTab === 'qr') && !fileContent) {
      setError('Please upload an image.');
      return;
    }

    const payload = activeTab === 'text' ? textContent : fileContent;
    analyze(activeTab, payload);
  };

  const loadExample = () => {
    setActiveTab('text');
    setTextContent("Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from the electricity office because your previous month bill was not updated. Please contact our electricity officer on 9123456789.");
  };

  if (isAnalyzing) {
    return <LoadingAnalysis progressStep={progressStep} />;
  }

  return (
    <div className="bg-white border border-[#E5E1D8] w-full max-w-2xl mx-auto overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#E5E1D8] bg-[#F7F4EE]">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'text' ? 'text-[#1E2433] border-b-2 border-[#1E2433] bg-white' : 'text-[#8A909B] hover:text-[#515A6B] hover:bg-white/50'}`}
        >
          Paste Text
        </button>
        <button
          onClick={() => setActiveTab('screenshot')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'screenshot' ? 'text-[#1E2433] border-b-2 border-[#1E2433] bg-white' : 'text-[#8A909B] hover:text-[#515A6B] hover:bg-white/50'}`}
        >
          Screenshot
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'qr' ? 'text-[#1E2433] border-b-2 border-[#1E2433] bg-white' : 'text-[#8A909B] hover:text-[#515A6B] hover:bg-white/50'}`}
        >
          QR Code
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Text Input */}
        {activeTab === 'text' && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-[#515A6B] uppercase tracking-wider">Paste suspicious message or URL</label>
              <button onClick={loadExample} className="text-xs font-semibold text-[#8A909B] hover:text-[#1E2433] hover:underline transition-colors">Load Example</button>
            </div>
            <textarea
              className="w-full h-40 bg-[#FDFCF9] border border-[#D9D5CC] p-4 text-[#1E2433] placeholder:text-[#8A909B] focus:outline-none focus:border-[#1E2433] resize-y transition-all"
              placeholder="e.g. Your SBI account is blocked. Click here to update KYC..."
              value={textContent}
              onChange={handleTextChange}
            ></textarea>
          </div>
        )}

        {/* File Input (Screenshot/QR) */}
        {(activeTab === 'screenshot' || activeTab === 'qr') && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-[#515A6B] uppercase tracking-wider">
              {activeTab === 'screenshot' ? 'Upload a screenshot of the chat or SMS' : 'Upload the QR code image'}
            </label>
            <div className="w-full h-40 border-2 border-dashed border-[#D9D5CC] bg-[#FDFCF9] hover:bg-white hover:border-[#8A909B] transition-colors relative flex flex-col items-center justify-center">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {fileContent ? (
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#4C7A5E] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-[#4C7A5E]">Image uploaded successfully</span>
                  <span className="text-xs font-medium text-[#8A909B] mt-1">Click to change</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-[#8A909B]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm font-medium">Click or drag image to upload</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSubmit} 
            className="btn-primary w-full sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Analyze Now
          </button>
        </div>
      </div>
    </div>
  );
}

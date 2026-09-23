'use client';
import { useState } from 'react';
import { generateRecoveryDraft } from '../utils/api';

export default function RecoveryFlow() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    amount_paid: '',
    payment_method: 'UPI',
    scam_description: '',
    contact_info: {
      name: '',
      phone: '',
      email: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.contact_info) {
      setFormData(prev => ({
        ...prev,
        contact_info: { ...prev.contact_info, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = {
        ...formData,
        amount_paid: parseFloat(formData.amount_paid) || 0
      };
      const response = await generateRecoveryDraft(data);
      setResult(response);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to generate recovery plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyDraft = () => {
    if (result?.complaint_draft) {
      navigator.clipboard.writeText(result.complaint_draft);
      alert("Draft copied to clipboard!");
    }
  };

  return (
    <div className="bg-transparent max-w-3xl mx-auto w-full p-6 md:p-10">
      {/* Stepper Header */}
      <div className="flex items-center mb-10">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step === 1 ? 'bg-[#3b34cc] text-white' : 'bg-[#1E2433] text-white'}`}>1</div>
        <div className={`flex-1 h-1 mx-2 ${step > 1 ? 'bg-[#1E2433]' : 'bg-[#E5E1D8]'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step === 2 ? 'bg-[#3b34cc] text-white' : 'bg-[#E5E1D8] text-[#515A6B]'}`}>2</div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2 tracking-[-0.02em] text-[#1E2433]">What happened?</h2>
            <p className="text-[#687080] text-base">Provide details so we can generate an official complaint draft and guide you on next steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#8A909B] uppercase tracking-wider mb-2">Amount Paid (₹)</label>
              <input type="number" name="amount_paid" value={formData.amount_paid} onChange={handleChange} className="w-full bg-[#FDFCF9] border border-[#D9D5CC] rounded p-3 text-[#1E2433] placeholder:text-[#8A909B] focus:border-[#1E2433] focus:outline-none" placeholder="e.g. 5000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8A909B] uppercase tracking-wider mb-2">Payment Method</label>
              <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="w-full bg-[#FDFCF9] border border-[#D9D5CC] rounded p-3 text-[#1E2433] focus:border-[#1E2433] focus:outline-none">
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8A909B] uppercase tracking-wider mb-2">Brief Description of the Scam</label>
            <textarea name="scam_description" value={formData.scam_description} onChange={handleChange} className="w-full bg-[#FDFCF9] border border-[#D9D5CC] rounded p-3 text-[#1E2433] placeholder:text-[#8A909B] focus:border-[#1E2433] focus:outline-none h-24 resize-y" placeholder="How did they convince you to pay?"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#8A909B] uppercase tracking-wider mb-2">Your Name</label>
              <input type="text" name="name" value={formData.contact_info.name} onChange={handleChange} className="w-full bg-[#FDFCF9] border border-[#D9D5CC] rounded p-3 text-[#1E2433] placeholder:text-[#8A909B] focus:border-[#1E2433] focus:outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8A909B] uppercase tracking-wider mb-2">Phone</label>
              <input type="tel" name="phone" value={formData.contact_info.phone} onChange={handleChange} className="w-full bg-[#FDFCF9] border border-[#D9D5CC] rounded p-3 text-[#1E2433] placeholder:text-[#8A909B] focus:border-[#1E2433] focus:outline-none" placeholder="9876543210" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8A909B] uppercase tracking-wider mb-2">Email</label>
              <input type="email" name="email" value={formData.contact_info.email} onChange={handleChange} className="w-full bg-[#FDFCF9] border border-[#D9D5CC] rounded p-3 text-[#1E2433] placeholder:text-[#8A909B] focus:border-[#1E2433] focus:outline-none" placeholder="john@example.com" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSubmit} 
              disabled={isGenerating}
              className={`btn-primary ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? 'Generating...' : 'Generate Action Plan'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && result && (
        <div className="space-y-8 animate-in fade-in duration-300 bg-white border border-[#E5E1D8] p-6 sm:p-8">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-[#B23A2E] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Immediate Actions Required
            </h2>
            <ul className="mt-4 space-y-4">
              {result.immediate_steps.map((stepItem, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#B23A2E]/10 text-[#B23A2E] flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                  <span className="text-[#1E2433] leading-relaxed pt-0.5">{stepItem}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#4C7A5E]/[0.09] border-l-4 border-[#4C7A5E] p-5">
              <h3 className="font-semibold text-[#4C7A5E] mb-4">Evidence Checklist</h3>
              <ul className="space-y-3">
                {result.evidence_checklist.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    {item.status === 'provided' ? (
                      <svg className="w-5 h-5 text-[#4C7A5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-5 h-5 text-[#8A909B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    <span className={item.status === 'provided' ? 'text-[#1E2433]' : 'text-[#687080]'}>{item.item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#F7F4EE] border border-[#E5E1D8] p-5">
              <h3 className="font-semibold text-[#1E2433] mb-4">Helpful Contacts</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#E5E1D8] pb-3">
                  <span className="text-sm font-medium text-[#515A6B]">Cyber Helpline</span>
                  <a href="tel:1930" className="text-[#1E2433] font-bold hover:underline">{result.helpful_contacts.cyber_helpline}</a>
                </div>
                <div className="flex justify-between items-center border-b border-[#E5E1D8] pb-3">
                  <span className="text-sm font-medium text-[#515A6B]">Online Portal</span>
                  <a href={result.helpful_contacts.online_portal} target="_blank" className="text-[#1E2433] font-bold hover:underline">cybercrime.gov.in</a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#515A6B]">RBI Helpline</span>
                  <a href="tel:14448" className="text-[#1E2433] font-bold hover:underline">{result.helpful_contacts.rbi_helpline}</a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-[#8A909B] uppercase tracking-wider">Generated Complaint Draft</h3>
              <button onClick={copyDraft} className="text-sm font-semibold text-[#1E2433] flex items-center gap-1 hover:opacity-70 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Text
              </button>
            </div>
            <textarea 
              className="w-full bg-[#FDFCF9] border border-[#D9D5CC] p-4 text-[#1E2433] h-64 text-sm focus:outline-none focus:border-[#1E2433] resize-y leading-relaxed"
              readOnly
              value={result.complaint_draft}
            ></textarea>
          </div>
          
          <div className="flex justify-center pt-4 border-t border-[#E5E1D8]">
            <button onClick={() => setStep(1)} className="text-[#515A6B] hover:text-[#1E2433] font-medium transition-colors text-sm">
              ← Go back and edit details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

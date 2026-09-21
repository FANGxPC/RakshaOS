'use client';

export default function FamilyAlert({ verdict, score, explanation }) {
  const handleShare = async () => {
    const text = `🚨 RakshaOS Alert 🚨\nRisk Score: ${score}/100 (${verdict})\n\nWhy? ${explanation}\n\nPlease check this message.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Suspicious Message Alert',
          text: text,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      // Fallback for desktop/unsupported browsers
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <span className="text-xs font-semibold">Alert Family</span>
    </button>
  );
}

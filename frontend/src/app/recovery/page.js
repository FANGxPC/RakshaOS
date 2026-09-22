import Header from '../../components/Header';
import RecoveryFlow from '../../components/RecoveryFlow';

export default function RecoveryPage() {
  return (
    <main className="flex-grow flex flex-col pt-24 min-h-screen pb-20">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
            Recovery Mode
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            If you&apos;ve already transferred money or shared sensitive details, don&apos;t panic. Time is critical. Let&apos;s build your action plan and complaint draft.
          </p>
        </div>

        <RecoveryFlow />
      </div>
    </main>
  );
}

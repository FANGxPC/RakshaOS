import RiskGauge from './RiskGauge';
import SignalList from './SignalList';
import ActionCard from './ActionCard';

export default function RiskCard({ result }) {
  const { risk_score, verdict, signals, explanation, recommended_action } = result;

  let borderColor = "border-green-500/30";
  let badgeColor = "bg-green-500/20 text-green-400";
  let badgeIcon = "✓";
  let pulseClass = "";

  if (verdict === "WARNING") {
    borderColor = "border-yellow-500/50";
    badgeColor = "bg-yellow-500/20 text-yellow-400";
    badgeIcon = "⚠️";
  } else if (verdict === "HIGH_RISK") {
    borderColor = "border-red-500/70";
    badgeColor = "bg-red-500/20 text-red-400";
    badgeIcon = "🔴";
  } else if (verdict === "EMERGENCY") {
    borderColor = "border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.3)]";
    badgeColor = "bg-red-600 text-white animate-pulse";
    badgeIcon = "🚨";
    pulseClass = "pulse-emergency";
  }

  return (
    <div className={`glass-card max-w-3xl mx-auto w-full border-t-4 overflow-hidden ${borderColor}`}>
      <div className="p-8 md:p-12">
        {/* Header Badge */}
        <div className="flex justify-center mb-8">
          <div className={`px-6 py-2 rounded-full font-bold tracking-widest text-sm flex items-center gap-2 ${badgeColor}`}>
            <span>{badgeIcon}</span>
            {verdict.replace("_", " ")}
          </div>
        </div>

        {/* Gauge */}
        <RiskGauge score={risk_score} verdict={verdict} />

        {/* Explanation */}
        <div className="mt-12 bg-black/30 rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">The &quot;Why&quot; Engine</h3>
          <p className="text-lg text-gray-200 leading-relaxed font-medium">
            {explanation}
          </p>
        </div>

        {/* Breakdown */}
        <SignalList signals={signals} />

        {/* Action */}
        <ActionCard action={recommended_action} verdict={verdict} />
      </div>
    </div>
  );
}

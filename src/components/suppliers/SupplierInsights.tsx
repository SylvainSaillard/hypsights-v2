import React from 'react';
import { Target, ShieldCheck, CheckCircle, Zap } from 'lucide-react';
import type { MatchInsights } from '../../types/supplierTypes';

interface SupplierInsightsProps {
  matchInsights?: MatchInsights;
}

const dimensionConfig: Record<string, { icon: React.ElementType; label: string; gradient: string; iconBg: string; textColor: string; scoreColor: string }> = {
  product_fit:    { icon: Target,      label: 'Product Fit',    gradient: 'from-emerald-50 to-green-50',   iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500', textColor: 'text-emerald-800', scoreColor: 'text-emerald-600' },
  reliability:    { icon: ShieldCheck, label: 'Reliability',    gradient: 'from-blue-50 to-sky-50',        iconBg: 'bg-gradient-to-br from-blue-400 to-sky-500',      textColor: 'text-blue-800',    scoreColor: 'text-blue-600' },
  criteria_match: { icon: CheckCircle, label: 'Criteria Match', gradient: 'from-violet-50 to-purple-50',   iconBg: 'bg-gradient-to-br from-violet-400 to-purple-500', textColor: 'text-violet-800',  scoreColor: 'text-violet-600' },
};

const fallbackConfig = { icon: Zap, label: 'Top Strength', gradient: 'from-amber-50 to-yellow-50', iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-500', textColor: 'text-amber-800', scoreColor: 'text-amber-600' };

const SupplierInsights: React.FC<SupplierInsightsProps> = ({ matchInsights }) => {
  const strength = matchInsights?.key_strength;

  if (!strength) return null;

  const config = dimensionConfig[strength.type] || fallbackConfig;
  const Icon = config.icon;

  return (
    <div className={`mt-3 flex items-center gap-3 bg-gradient-to-r ${config.gradient} rounded-xl px-4 py-3 border border-white/60`}>
      <div className={`${config.iconBg} w-9 h-9 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
        <Icon size={18} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${config.textColor} opacity-70`}>Strongest</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold ${config.textColor}`}>{strength.dimension}</span>
          <span className={`text-lg font-black ${config.scoreColor}`}>{strength.score}<span className="text-xs font-medium opacity-50">/100</span></span>
        </div>
      </div>
    </div>
  );
};

export default SupplierInsights;

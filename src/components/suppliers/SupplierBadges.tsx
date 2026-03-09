import React from 'react';
import { Trophy, Target, ShieldCheck, CheckCircle, Building2, Globe } from 'lucide-react';
import type { MatchInsights, MatchInsightsBadge } from '../../types/supplierTypes';

interface SupplierBadgesProps {
  matchInsights?: MatchInsights;
}

const badgeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  best_overall:     { icon: Trophy,      label: 'Best Match',         color: 'bg-amber-100 text-amber-800 border-amber-300' },
  best_product_fit: { icon: Target,      label: 'Best Product Fit',   color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  best_reliability: { icon: ShieldCheck, label: 'Most Reliable',      color: 'bg-blue-100 text-blue-800 border-blue-300' },
  best_criteria:    { icon: CheckCircle, label: 'Best Criteria Match', color: 'bg-violet-100 text-violet-800 border-violet-300' },
  best_company:     { icon: Building2,   label: 'Strongest Company',  color: 'bg-rose-100 text-rose-800 border-rose-300' },
  best_geography:   { icon: Globe,       label: 'Best Geographic Fit', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
};

const SupplierBadges: React.FC<SupplierBadgesProps> = ({ matchInsights }) => {
  const badges = matchInsights?.badges || [];
  
  if (badges.length === 0) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {badges
        .sort((a: MatchInsightsBadge, b: MatchInsightsBadge) => a.priority - b.priority)
        .map((badge: MatchInsightsBadge) => {
          const config = badgeConfig[badge.type];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <span
              key={badge.type}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${config.color}`}
            >
              <Icon size={16} strokeWidth={2.5} />
              {config.label}
            </span>
          );
        })}
    </div>
  );
};

export default SupplierBadges;

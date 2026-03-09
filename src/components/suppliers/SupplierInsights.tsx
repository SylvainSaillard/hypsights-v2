import React from 'react';
import type { MatchInsights } from '../../types/supplierTypes';

interface SupplierInsightsProps {
  matchInsights?: MatchInsights;
}

const SupplierInsights: React.FC<SupplierInsightsProps> = ({ matchInsights }) => {
  const strength = matchInsights?.key_strength;
  const limitation = matchInsights?.key_limitation;
  
  if (!strength && !limitation) return null;
  
  return (
    <div className="flex flex-col gap-1 mt-3 text-xs">
      {strength && (
        <div className="flex items-center gap-1.5 text-green-700 bg-green-50 rounded-lg px-3 py-1.5">
          <span>💪</span>
          <span className="font-medium">Strongest: {strength.dimension} ({strength.score}/100)</span>
        </div>
      )}
      {limitation && (
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5">
          <span>📌</span>
          <span className="font-medium">Watch: {limitation.dimension} ({limitation.score}/100)</span>
        </div>
      )}
    </div>
  );
};

export default SupplierInsights;

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AnimatedKpiCardProps {
  title: string;
  value: number;
  previousValue: number;
  icon: React.ReactNode;
  color: string;
  hasChanged: boolean;
}

/**
 * Composant KPI avec animations d'évolution
 * Affiche une animation quand la valeur change avec indicateur de tendance
 */
const AnimatedKpiCard: React.FC<AnimatedKpiCardProps> = ({ 
  title, 
  value, 
  previousValue, 
  icon, 
  color, 
  hasChanged 
}) => {
  const [displayValue, setDisplayValue] = useState(previousValue);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation du compteur quand la valeur change
  useEffect(() => {
    if (hasChanged && value !== previousValue) {
      setIsAnimating(true);
      
      // Animation du compteur progressif
      const difference = value - previousValue;
      const steps = Math.min(Math.abs(difference), 20); // Max 20 étapes pour éviter les animations trop longues
      const stepValue = difference / steps;
      const stepDuration = 1500 / steps; // Animation sur 1.5 secondes
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const newValue = previousValue + (stepValue * currentStep);
        
        if (currentStep >= steps) {
          setDisplayValue(value);
          clearInterval(interval);
          setTimeout(() => setIsAnimating(false), 500);
        } else {
          setDisplayValue(Math.round(newValue));
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [value, previousValue, hasChanged]);
  
  // Calculer la tendance
  const trend = hasChanged ? (value > previousValue ? 'up' : value < previousValue ? 'down' : 'stable') : 'stable';
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';
  
  return (
    <div className={`bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center transition-all duration-300 ${
      isAnimating ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg scale-105' : ''
    }`}>
      <div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-4xl font-bold text-white transition-all duration-500 ${
            isAnimating ? 'text-blue-400' : ''
          }`}>
            {displayValue}
          </span>
          {hasChanged && trend !== 'stable' && (
            <div className={`flex items-center space-x-1 ${trendColor} transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-xs font-medium">
                {trend === 'up' ? '+' : ''}{value - previousValue}
              </span>
            </div>
          )}
        </div>
        <p className="text-slate-400 text-sm">{title}</p>
      </div>
      <div 
        className={`p-3 rounded-lg transition-all duration-300 ${
          isAnimating ? 'scale-110 shadow-lg' : ''
        }`} 
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      
      {/* Effet de pulsation pour les changements */}
      {isAnimating && (
        <div 
          className="absolute inset-0 rounded-lg animate-pulse opacity-20"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
};

export default AnimatedKpiCard;

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Styles CSS pour les animations personnalisées
const customStyles = `
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

// Injecter les styles dans le document
if (typeof document !== 'undefined' && !document.getElementById('kpi-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'kpi-animations';
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

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
  
  return (
    <div className="relative group">
      <div className={`
        relative overflow-hidden
        bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
        border-2 border-blue-500/30
        rounded-2xl
        p-8
        shadow-2xl shadow-slate-900/50
        transition-all duration-500 ease-out
        hover:border-blue-400/50
        hover:shadow-2xl hover:shadow-blue-500/20
        hover:-translate-y-2
        hover:scale-105
        ${
          isAnimating 
            ? 'ring-4 ring-blue-500/50 shadow-2xl shadow-blue-500/30 scale-110 border-blue-400/70' 
            : ''
        }
      `}>
        {/* Gradient overlay pour plus de profondeur */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        
        {/* Effet de brillance au hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent 
                       translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
        
        <div className="relative flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-baseline space-x-3 mb-2">
              <span className={`
                text-5xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent
                transition-all duration-500
                ${
                  isAnimating 
                    ? 'from-blue-400 to-blue-200 drop-shadow-lg' 
                    : ''
                }
              `}>
                {displayValue}
              </span>
              
              {hasChanged && trend !== 'stable' && (
                <div className={`
                  flex items-center space-x-1.5 px-2 py-1 rounded-full
                  backdrop-blur-sm border
                  transition-all duration-300
                  ${
                    trend === 'up' 
                      ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }
                  ${
                    isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }
                `}>
                  {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="text-xs font-semibold">
                    {trend === 'up' ? '+' : ''}{value - previousValue}
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-slate-400 text-sm font-medium tracking-wide">{title}</p>
          </div>
          
          <div className="relative">
            <div 
              className={`
                p-4 rounded-xl
                backdrop-blur-sm
                border border-white/10
                transition-all duration-500
                ${
                  isAnimating 
                    ? 'scale-110 shadow-2xl rotate-3' 
                    : 'group-hover:scale-105 group-hover:rotate-1'
                }
              `}
              style={{ 
                background: `linear-gradient(135deg, ${color}, ${color}80)`,
                boxShadow: isAnimating 
                  ? `0 20px 40px ${color}40, 0 0 20px ${color}30` 
                  : `0 8px 16px ${color}20`
              }}
            >
              <div className={`transition-all duration-300 ${
                isAnimating ? 'drop-shadow-lg' : ''
              }`}>
                {icon}
              </div>
            </div>
            
            {/* Effet de halo pour l'icône */}
            {isAnimating && (
              <div 
                className="absolute inset-0 rounded-xl animate-ping opacity-30"
                style={{ backgroundColor: color }}
              />
            )}
          </div>
        </div>
        
        {/* Effet de pulsation globale pour les changements */}
        {isAnimating && (
          <div 
            className="absolute inset-0 rounded-xl animate-pulse opacity-10 pointer-events-none"
            style={{ 
              background: `linear-gradient(45deg, ${color}, transparent, ${color})`,
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 2s ease-in-out'
            }}
          />
        )}
      </div>
      
      {/* Ombre portée améliorée */}
      <div className={`
        absolute inset-0 rounded-xl transition-all duration-500
        bg-gradient-to-br from-slate-900/20 to-slate-900/40
        blur-xl -z-10 opacity-0 group-hover:opacity-100
        ${
          isAnimating ? 'opacity-100 scale-110' : ''
        }
      `} />
    </div>
  );
};

export default AnimatedKpiCard;

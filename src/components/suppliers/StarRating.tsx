import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

interface StarRatingProps {
  score: number; // Score en pourcentage (0-100)
  maxStars: number; // 3 ou 5 étoiles
  label: string;
  explanation?: string; // Texte d'explication IA
  learnMoreLabel?: string; // Label du bouton "En savoir plus"
  hideLabel?: string; // Label du bouton "Masquer"
}

/**
 * Composant StarRating pour afficher les scores sous forme d'étoiles
 * Conversion selon la spec:
 * - Pour 5 étoiles (score 0-100): 1-20%=1★, 21-40%=2★, 41-60%=3★, 61-80%=4★, 81-100%=5★
 * - Pour 3 étoiles (score 0-100): 0-33%=1★, 34-66%=2★, 67-100%=3★
 */
const StarRating: React.FC<StarRatingProps> = ({ 
  score, 
  maxStars, 
  label, 
  explanation,
  learnMoreLabel = 'En savoir plus',
  hideLabel = 'Masquer'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStarCount = (): number => {
    if (maxStars === 5) {
      // Score de 0-100
      if (score <= 20) return 1;
      if (score <= 40) return 2;
      if (score <= 60) return 3;
      if (score <= 80) return 4;
      return 5;
    } else if (maxStars === 3) {
      // Score de 0-100 (converti en 3 étoiles)
      if (score <= 33) return 1;
      if (score <= 66) return 2;
      return 3;
    }
    return 0;
  };

  const filledStars = getStarCount();

  return (
    <div className="space-y-2">
      {/* Header avec label et étoiles */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: maxStars }).map((_, index) => (
            <Star
              key={index}
              size={16}
              className={`${
                index < filledStars
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Accordéon "En savoir plus" */}
      {explanation && (
        <div className="space-y-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} />
                <span>{hideLabel}</span>
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                <span>{learnMoreLabel}</span>
              </>
            )}
          </button>
          
          {/* Contenu de l'accordéon avec animation */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-blue-50/50 border-l-4 border-indigo-400 pl-4 pr-3 py-3 rounded-r">
              <p className="text-xs text-gray-700 leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarRating;

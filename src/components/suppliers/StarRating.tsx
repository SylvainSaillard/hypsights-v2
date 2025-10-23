import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  score: number; // Score en pourcentage (0-100) ou décimal (0-1)
  maxStars: number; // 3 ou 5 étoiles
  label: string;
}

/**
 * Composant StarRating pour afficher les scores sous forme d'étoiles
 * Conversion selon la spec:
 * - Pour 5 étoiles (score 0-100): 1-20%=1★, 21-40%=2★, 41-60%=3★, 61-80%=4★, 81-100%=5★
 * - Pour 3 étoiles (score 0-1): <0.4=1★, 0.4-0.8=2★, >0.8=3★
 */
const StarRating: React.FC<StarRatingProps> = ({ score, maxStars, label }) => {
  
  const getStarCount = (): number => {
    if (maxStars === 5) {
      // Score de 0-100
      if (score <= 20) return 1;
      if (score <= 40) return 2;
      if (score <= 60) return 3;
      if (score <= 80) return 4;
      return 5;
    } else if (maxStars === 3) {
      // Score de 0-1 (décimal)
      if (score < 0.4) return 1;
      if (score < 0.8) return 2;
      return 3;
    }
    return 0;
  };

  const filledStars = getStarCount();

  return (
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
  );
};

export default StarRating;

import React from 'react';
import { X } from 'lucide-react';

interface ScoringTransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoringReasoning?: string;
  title?: string;
}

/**
 * Modal pour afficher la transparence du calcul du score global
 */
const ScoringTransparencyModal: React.FC<ScoringTransparencyModalProps> = ({
  isOpen,
  onClose,
  scoringReasoning,
  title = 'Transparence du Score'
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold pr-10">{title}</h2>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {scoringReasoning ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {scoringReasoning}
                  </p>
                </div>
                
                <div className="text-sm text-gray-500 italic mt-4">
                  Cette formule explique comment le score global est calculé à partir des différents critères d'évaluation.
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune information de transparence disponible pour ce fournisseur.</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScoringTransparencyModal;

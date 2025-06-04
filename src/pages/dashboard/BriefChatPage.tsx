import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { devLog } from '../../lib/devTools';

/**
 * Version minimaliste de la page chat qui redirige vers SimplifiedBriefPage
 * Évite les erreurs de build et respecte le principe KISS
 */
const BriefChatPage: React.FC = () => {
  const { briefId } = useParams<{ briefId: string }>();
  const navigate = useNavigate();
  
  // Rediriger automatiquement vers la version simplifiée
  useEffect(() => {
    if (briefId) {
      devLog('Redirecting to simplified view', { briefId });
      navigate(`/dashboard/briefs/${briefId}/visual`);
    } else {
      navigate('/dashboard');
    }
  }, [briefId, navigate]);
  
  // Afficher un message de chargement pendant la redirection
  return (
    <div className="flex justify-center items-center min-h-screen bg-hypsights-background">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Redirection vers l'interface simplifiée...</p>
      </div>
    </div>
  );
};

export default BriefChatPage;

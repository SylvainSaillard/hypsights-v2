import React, { useState, useEffect } from 'react';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useSolutions } from '../../hooks/useSolutions';
import { useFastSearchResults } from '../../hooks/useFastSearchResults';
import { startFastSearchFromSolution, getFastSearchResults } from '../../services/fastSearchService';
import ChatPanel from './ChatPanel';
import SolutionsPanel from './SolutionsPanel';
import FastSearchResultsPanel from './FastSearchResultsPanel';
import { useI18n } from '../../contexts/I18nContext';
import type { EnhancedChatViewProps } from './types';

/**
 * Composant de chat amélioré avec affichage des solutions
 * Conforme au principe KISS et Thin Client / Fat Edge
 * Version refactorisée avec séparation des responsabilités
 */
const EnhancedChatView: React.FC<EnhancedChatViewProps> = ({
  briefId,
  onMessageSent,
  onSolutionValidated
}) => {
  // États locaux
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState('');
  const [fastSearchQuota, setFastSearchQuota] = useState({ used: 0, total: 3 });
  // Les résultats de recherche sont toujours affichés
  // Modifier pour suivre l'état de chargement par solution
  const [startingSolutionId, setStartingSolutionId] = useState<string | null>(null);
  // Nous n'avons plus besoin de suivre l'ID de recherche car les résultats sont toujours affichés
  
  // Utilisation des hooks personnalisés pour la logique métier
  const {
    messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    isSending,
    sendMessage,
    loadMessages
  } = useChatMessages(briefId);
  
  const {
    solutions,
    isLoading: isLoadingSolutions,
    error: solutionsError,
    loadSolutions,
    validateSolution
  } = useSolutions(briefId, onSolutionValidated);
  
  // Ce bloc a été supprimé car nous ne vérifions plus si des solutions sont validées
  
  // Charger automatiquement les résultats de Fast Search au chargement du composant
  useEffect(() => {
    if (briefId) {
      // Simuler un démarrage de recherche pour s'assurer que les résultats sont chargés
      const loadInitialResults = async () => {
        try {
          const result = await getFastSearchResults(briefId);
          console.log('Résultats initiaux chargés:', result);
        } catch (error) {
          console.error('Erreur lors du chargement des résultats initiaux:', error);
        }
      };
      
      loadInitialResults();
    }
  }, [briefId]);
  

  
  // Charger le quota de Fast Search depuis le profil utilisateur
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/functions/v1/user-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_user_profile' })
        });
        
        const data = await response.json();
        
        if (data.success && data.data.user) {
          setFastSearchQuota({
            used: data.data.user.fast_search_used || 0,
            total: data.data.user.fast_search_quota || 3
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  // Gestionnaire d'envoi de message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSending) return;
    
    const messageText = inputValue.trim();
    setInputValue('');
    
    await sendMessage(messageText);
    
    // Notifier le parent que le message a été envoyé
    if (onMessageSent) {
      onMessageSent();
    }
  };
  
  // Cette fonction a été supprimée car nous n'utilisons plus le bouton global de Fast Search
  
  // Gestionnaire de lancement de Fast Search depuis une solution spécifique
  const handleStartFastSearchFromSolution = async (solutionId: string) => {
    if (fastSearchQuota.used >= fastSearchQuota.total) {
      return;
    }
    
    try {
      // Suivre quelle solution spécifique est en cours de chargement
      setStartingSolutionId(solutionId);
      
      // Appeler l'Edge Function pour lancer la recherche avec une solution spécifique
      const result = await startFastSearchFromSolution(briefId, solutionId);
      
      // Nous n'avons plus besoin de suivre l'ID de recherche car les résultats sont toujours affichés
      // L'ID de recherche est géré directement par le hook useFastSearchResults
      
      // Mettre à jour le quota
      if (result.quota) {
        setFastSearchQuota({
          used: result.quota.used,
          total: result.quota.total
        });
      } else {
        // Fallback si le quota n'est pas retourné
        setFastSearchQuota(prev => ({ ...prev, used: prev.used + 1 }));
      }
      
      // Recharger les solutions pour mettre à jour les dates fast_search_launched_at
      loadSolutions();
      
    } catch (error) {
      console.error('Failed to launch Fast Search from solution:', error);
    } finally {
      // Réinitialiser l'état de chargement
      setStartingSolutionId(null);
    }
  };
  
  // Utiliser le hook pour les résultats de recherche - toujours actif
  const {
    suppliers,
    status: searchStatus,
    loading: searchLoading,
    error: searchError
  } = useFastSearchResults(briefId, true); // Toujours actif
  
  // Logger l'état des résultats de recherche pour débogage
  useEffect(() => {
    console.log('EnhancedChatView - État de recherche:', { 
      suppliersCount: suppliers?.length || 0,
      searchStatus, 
      searchLoading 
    });
    
    // Déboguer les fournisseurs en détail
    if (suppliers && suppliers.length > 0) {
      console.log('EnhancedChatView - Détails des fournisseurs:');
      suppliers.forEach((supplier, index) => {
        console.log(`Fournisseur ${index + 1}:`, {
          id: supplier.id,
          name: supplier.name,
          brief_id: supplier.brief_id,
          products: supplier.products?.length || 0
        });
      });
    } else {
      console.log('EnhancedChatView - Aucun fournisseur disponible');
    }
  }, [suppliers, searchStatus, searchLoading]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Conteneur principal avec hauteur fixe */}
      <div className="flex gap-4 h-[600px]">
        {/* Panneau de chat avec hauteur fixe et défilement */}
        <div className="w-3/5 flex flex-col">
          <ChatPanel
            messages={messages}
            isLoading={isLoadingMessages}
            error={messagesError}
            inputValue={inputValue}
            isSending={isSending}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            onRefresh={loadMessages}
          />
        </div>
        
        {/* Panneau de solutions */}
        {/* Affichage des solutions avec recherche toujours active */}
        <SolutionsPanel
          solutions={solutions}
          isLoading={isLoadingSolutions}
          error={solutionsError}
          onValidate={validateSolution}
          onRefresh={loadSolutions}
          onStartFastSearch={handleStartFastSearchFromSolution}
          startingSolutionId={startingSolutionId}
          briefHasActiveSearch={true}
          showFastSearchDirectly={true}
        />
      </div>
      
      {/* Panneau de résultats de recherche (toujours visible) */}
      <FastSearchResultsPanel
        suppliers={suppliers}
        status={searchStatus}
        loading={searchLoading}
      />
      
      {/* Message d'erreur de recherche */}
      {searchError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {t('fast_search.error', 'Error loading search results')}: {searchError}
        </div>
      )}
    </div>
  );
};

export default EnhancedChatView;

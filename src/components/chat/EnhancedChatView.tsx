import React, { useState, useEffect } from 'react';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useSolutions } from '../../hooks/useSolutions';
import { useFastSearchResults } from '../../hooks/useFastSearchResults';
import { startFastSearch, startFastSearchFromSolution } from '../../services/fastSearchService';
import ChatPanel from './ChatPanel';
import SolutionsPanel from './SolutionsPanel';
import FastSearchBar from './FastSearchBar';
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
  const [isReadyForSearch, setIsReadyForSearch] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isStartingSearch, setIsStartingSearch] = useState(false);
  // searchId est utilisé pour suivre l'ID de recherche actif et pourrait être utilisé
  // pour des fonctionnalités futures comme l'annulation de recherche
  const [searchId, setSearchId] = useState<string | null>(null);
  
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
  
  // Vérifier si des solutions ont été validées
  useEffect(() => {
    const hasValidatedSolutions = solutions.some(solution => solution.status === 'validated');
    setIsReadyForSearch(hasValidatedSolutions);
  }, [solutions]);
  
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
  
  // Gestionnaire de lancement de Fast Search
  const handleLaunchFastSearch = async () => {
    if (!isReadyForSearch || fastSearchQuota.used >= fastSearchQuota.total) {
      return;
    }
    
    try {
      // Vérifier qu'il y a au moins une solution validée
      const hasValidatedSolutions = solutions.some(solution => solution.status === 'validated');
      
      if (!hasValidatedSolutions) {
        console.error('No validated solutions found');
        return;
      }
      
      setIsStartingSearch(true);
      
      // Appeler l'Edge Function pour lancer la recherche
      const result = await startFastSearch(briefId);
      
      // Mettre à jour l'état local
      setSearchId(result.search_id);
      setIsSearchActive(true);
      
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
    } catch (error) {
      console.error('Failed to launch Fast Search:', error);
    } finally {
      setIsStartingSearch(false);
    }
  };
  
  // Gestionnaire de lancement de Fast Search depuis une solution spécifique
  const handleStartFastSearchFromSolution = async (solutionId: string) => {
    if (fastSearchQuota.used >= fastSearchQuota.total || isSearchActive) {
      return;
    }
    
    try {
      setIsStartingSearch(true);
      
      // Appeler l'Edge Function pour lancer la recherche avec une solution spécifique
      const result = await startFastSearchFromSolution(briefId, solutionId);
      
      // Mettre à jour l'état local
      setSearchId(result.search_id);
      setIsSearchActive(true);
      
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
      setIsStartingSearch(false);
    }
  };
  
  // Utiliser le hook pour les résultats de recherche
  const {
    suppliers,
    status: searchStatus,
    loading: searchLoading,
    error: searchError
  } = useFastSearchResults(briefId, isSearchActive);
  
  return (
    <div className="flex flex-col h-full">
      {/* Barre Fast Search (visible uniquement quand des solutions sont validées) */}
      <FastSearchBar 
        isReady={isReadyForSearch}
        quotaUsed={fastSearchQuota.used}
        quotaTotal={fastSearchQuota.total}
        onLaunchSearch={handleLaunchFastSearch}
      />
      
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
        <SolutionsPanel
          solutions={solutions}
          isLoading={isLoadingSolutions}
          error={solutionsError}
          onValidate={validateSolution}
          onRefresh={loadSolutions}
          onStartFastSearch={handleStartFastSearchFromSolution}
          isStartingSearch={isStartingSearch}
          briefHasActiveSearch={isSearchActive}
        />
      </div>
      
      {/* Panneau de résultats de recherche (visible uniquement quand une recherche est active) */}
      {isSearchActive && (
        <FastSearchResultsPanel
          suppliers={suppliers}
          status={searchStatus}
          loading={searchLoading}
        />
      )}
      
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

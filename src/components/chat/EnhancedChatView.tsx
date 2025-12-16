import React, { useState, useEffect } from 'react';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useSolutions } from '../../hooks/useSolutions';
import { startFastSearchFromSolution } from '../../services/fastSearchService';
import ChatPanel from './ChatPanel';
import SolutionsPanel from './SolutionsPanel';
import type { EnhancedChatViewProps } from './types';
import { supabase } from '../../lib/supabaseClient';
import { useFastSearchRefundNotifications } from '../../hooks/useFastSearchRefundNotifications';
import { FastSearchRefundNotification } from '../notifications/FastSearchRefundNotification';
import FastSearchLaunchModal from './FastSearchLaunchModal';

/**
 * Composant de chat amélioré avec affichage des solutions et des fournisseurs
 * Conforme au principe KISS et Thin Client / Fat Edge
 * Version simplifiée avec SuppliersPanel
 */
const EnhancedChatView: React.FC<EnhancedChatViewProps> = ({
  briefId,
  onMessageSent,
  onSolutionValidated,
  onSolutionsChange
}) => {
  // États locaux
  const [inputValue, setInputValue] = useState('');
  const [fastSearchQuota, setFastSearchQuota] = useState({ used: 0, total: 3 });
  const [startingSolutionId, setStartingSolutionId] = useState<string | null>(null);
  const [briefTitle, setBriefTitle] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userLocale, setUserLocale] = useState<'en' | 'fr'>('en');
  
  // État pour le modal de lancement Fast Search
  const [fastSearchModalOpen, setFastSearchModalOpen] = useState(false);
  const [pendingSolutionForSearch, setPendingSolutionForSearch] = useState<{
    id: string;
    title: string;
    solutionNumber?: number;
  } | null>(null);
  
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

  // Hook pour les notifications de remboursement
  const { notifications, removeNotification } = useFastSearchRefundNotifications(briefId, userId);

  // Notifier le parent des changements de solutions
  useEffect(() => {
    if (onSolutionsChange) {
      onSolutionsChange(solutions);
    }
  }, [solutions, onSolutionsChange]);
  
  // Charger le quota de Fast Search et les infos utilisateur
  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('User not authenticated for quota check.');
          return;
        }

        // Récupérer l'ID utilisateur
        setUserId(session.user.id);

        // Récupérer la locale utilisateur depuis les métadonnées
        const { data: userMetadata } = await supabase
          .from('users_metadata')
          .select('preferred_locale')
          .eq('user_id', session.user.id)
          .single();
        
        if (userMetadata?.preferred_locale) {
          setUserLocale(userMetadata.preferred_locale as 'en' | 'fr');
        }

        const response = await fetch('/functions/v1/dashboard-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'get_user_metrics' }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch quota: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setFastSearchQuota({
            used: result.data.fast_searches_used ?? 0,
            total: result.data.fast_searches_quota ?? 3,
          });
        } else {
          console.error('Error fetching quota:', result.error || 'No data received');
        }
      } catch (error) {
        console.error('Exception while fetching user quota:', error);
      }
    };
    
    fetchQuota();

    const fetchBriefTitle = async () => {
      const { data, error } = await supabase
        .from('briefs')
        .select('title')
        .eq('id', briefId)
        .single();
      
      if (error) {
        console.error('Error fetching brief title:', error);
      } else if (data) {
        setBriefTitle(data.title);
      }
    };

    fetchBriefTitle();
  }, [briefId]);
  
  // Gestionnaire d'envoi de message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSending) return;
    
    const messageText = inputValue.trim();
    setInputValue('');
    
    await sendMessage(messageText);
    
    // Déclencher un refresh des solutions après l'envoi du message
    // car l'IA pourrait avoir créé de nouvelles solutions
    setTimeout(() => {
      loadSolutions();
    }, 2000); // Délai pour laisser le temps à l'IA de traiter
    
    // Notifier le parent que le message a été envoyé
    if (onMessageSent) {
      onMessageSent();
    }
  };
  
  // Gestionnaire d'ouverture du modal Fast Search
  const handleOpenFastSearchModal = (solutionId: string) => {
    if (fastSearchQuota.used >= fastSearchQuota.total) {
      return;
    }
    
    // Trouver la solution pour afficher ses infos dans le modal
    const solution = solutions.find(s => s.id === solutionId);
    if (solution) {
      setPendingSolutionForSearch({
        id: solutionId,
        title: solution.title,
        solutionNumber: solution.solution_number
      });
      setFastSearchModalOpen(true);
    }
  };
  
  // Gestionnaire de confirmation du modal - lance réellement la Fast Search
  // stayOnPage: true = reste sur la page (Launch & Watch), false = redirige vers dashboard (Launch & Leave)
  const handleConfirmFastSearch = async (notifyByEmail: boolean, stayOnPage: boolean) => {
    if (!pendingSolutionForSearch) return;
    
    const solutionId = pendingSolutionForSearch.id;
    
    // Fermer le modal
    setFastSearchModalOpen(false);
    setPendingSolutionForSearch(null);
    
    try {
      // Suivre quelle solution spécifique est en cours de chargement (seulement si on reste sur la page)
      if (stayOnPage) {
        setStartingSolutionId(solutionId);
      }
      
      // Appeler l'Edge Function pour lancer la recherche avec une solution spécifique
      const result = await startFastSearchFromSolution(briefId, solutionId);
      
      // TODO: Si notifyByEmail est true, déclencher le workflow N8N pour l'email
      if (notifyByEmail) {
        console.log('User requested email notification for solution:', solutionId);
        // Future implémentation: appel à un endpoint N8N pour enregistrer la demande d'email
      }
      
      // Mettre à jour le quota (seulement si on reste sur la page)
      if (stayOnPage) {
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
      }
      // Note: Si stayOnPage est false, le modal redirige vers /dashboard via navigate()
      
    } catch (error) {
      console.error('Failed to launch Fast Search from solution:', error);
    } finally {
      // Réinitialiser l'état de chargement (seulement si on reste sur la page)
      if (stayOnPage) {
        setStartingSolutionId(null);
      }
    }
  };
  
  // Gestionnaire d'annulation du modal
  const handleCancelFastSearchModal = () => {
    setFastSearchModalOpen(false);
    setPendingSolutionForSearch(null);
  };
  
  return (
    <div className="flex flex-col h-full p-6">
      {/* Modal de lancement Fast Search */}
      <FastSearchLaunchModal
        isOpen={fastSearchModalOpen}
        solutionTitle={pendingSolutionForSearch?.title || ''}
        solutionNumber={pendingSolutionForSearch?.solutionNumber}
        onConfirm={handleConfirmFastSearch}
        onCancel={handleCancelFastSearchModal}
      />
      
      {/* Notifications de remboursement Fast Search */}
      {notifications.map((notification) => (
        <FastSearchRefundNotification
          key={notification.id}
          solutionTitle={notification.solutionTitle}
          reason={notification.reason}
          locale={userLocale}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      {/* Conteneur principal avec hauteur fixe */}
      <div className="flex gap-6 h-[600px]">
        {/* Panneau de chat avec hauteur fixe et défilement */}
        <div className="w-3/5 flex flex-col">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
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
        </div>
        
        {/* Panneau de solutions */}
        <div className="w-2/5 flex flex-col">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
            <SolutionsPanel
              solutions={solutions}
              isLoading={isLoadingSolutions}
              error={solutionsError}
              onValidate={validateSolution}
              onRefresh={loadSolutions}
              onStartFastSearch={handleOpenFastSearchModal}
              startingSolutionId={startingSolutionId}
              briefHasActiveSearch={true}
              showFastSearchDirectly={true}
              fastSearchQuota={fastSearchQuota}
              briefTitle={briefTitle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatView;

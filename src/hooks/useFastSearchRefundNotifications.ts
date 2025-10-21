import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface RefundNotification {
  id: string;
  solutionId: string;
  solutionTitle: string;
  reason: string;
  timestamp: string;
}

export function useFastSearchRefundNotifications(briefId: string | null, userId: string | null) {
  const [notifications, setNotifications] = useState<RefundNotification[]>([]);

  useEffect(() => {
    if (!briefId || !userId) return;

    console.log('[useFastSearchRefundNotifications] Setting up listener for brief:', briefId);

    // S'abonner aux changements de statut des solutions
    const channel = supabase
      .channel(`fast_search_refunds:${briefId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'solutions',
          filter: `brief_id=eq.${briefId}`
        },
        async (payload: any) => {
          console.log('[useFastSearchRefundNotifications] Received update:', payload);

          const newData = payload.new as any;
          const oldData = payload.old as any;

          // Vérifier si c'est un remboursement qui vient de se produire
          if (
            newData.fast_search_refunded === true &&
            oldData?.fast_search_refunded === false
          ) {
            console.log('[useFastSearchRefundNotifications] Refund detected for solution:', newData.id);

            // Créer une notification
            const notification: RefundNotification = {
              id: `refund-${newData.id}-${Date.now()}`,
              solutionId: newData.id,
              solutionTitle: newData.title || 'Solution',
              reason: newData.fast_search_refund_reason || 'No results available',
              timestamp: new Date().toISOString()
            };

            setNotifications(prev => [...prev, notification]);

            // Auto-supprimer après 11 secondes (1 seconde de plus que l'auto-fermeture)
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }, 11000);
          }
        }
      )
      .subscribe((status: any) => {
        console.log('[useFastSearchRefundNotifications] Subscription status:', status);
      });

    return () => {
      console.log('[useFastSearchRefundNotifications] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [briefId, userId]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    removeNotification
  };
}

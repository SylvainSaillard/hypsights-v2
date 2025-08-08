import { useState, useEffect, useCallback } from 'react';
import type { Solution } from '../components/chat/types';
import api from '../services/api';
import { SOLUTIONS_CHANNEL_NAME } from '../components/chat/types';

/**
 * Hook pour gérer les solutions
 * Conforme au principe KISS et Thin Client / Fat Edge
 */
export function useSolutions(briefId: string, onSolutionValidated?: (solutionId: string) => void) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour charger les solutions
  const loadSolutions = useCallback(async () => {
    if (!briefId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('useSolutions - Loading solutions for brief_id:', briefId);
      const data = await api.getSolutions(briefId);
      console.log('useSolutions - Solutions loaded:', data);
      setSolutions(data || []);
    } catch (err) {
      console.error('useSolutions - Exception loading solutions:', err);
      setError(`Une erreur est survenue: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [briefId]);
  
  // Fonction pour valider une solution
  const validateSolution = async (solutionId: string) => {
    try {
      console.log('useSolutions - Validating solution:', solutionId);
      
      // Mise à jour optimiste
      const solutionToUpdate = solutions.find(s => s.id === solutionId);
      if (!solutionToUpdate) return;
      
      // Créer une copie avec le statut mis à jour
      const updatedSolution = { ...solutionToUpdate, status: 'validated' as const };
      
      // Mettre à jour l'état local immédiatement
      setSolutions(prev => 
        prev.map(solution => solution.id === solutionId ? updatedSolution : solution)
      );
      
      // Appel à l'API
      await api.validateSolution(solutionId);
      
      console.log('useSolutions - Solution validated successfully');
      
      // Notifier le parent que la solution a été validée
      if (onSolutionValidated) {
        onSolutionValidated(solutionId);
      }
    } catch (err) {
      console.error('useSolutions - Exception validating solution:', err);
      setError(`Une erreur est survenue: ${(err as Error).message}`);
      
      // Rollback en cas d'erreur - recharger les solutions
      loadSolutions();
    }
  };
  
  // Effet pour configurer l'abonnement real-time aux solutions
  useEffect(() => {
    if (!briefId) return;
    
    console.log('useSolutions - Setting up realtime subscription for briefId:', briefId);
    
    // Abonnement aux solutions
    const solutionsChannel = api.supabase
      .channel(`${SOLUTIONS_CHANNEL_NAME}_${briefId}`)
      .on('postgres_changes', {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'solutions',
        filter: `brief_id=eq.${briefId}`
      }, (payload) => {
        console.log('useSolutions - Solution change detected:', payload);

        if (payload.eventType === 'INSERT') {
          setSolutions(prev => [...prev, payload.new as Solution]);
        } else if (payload.eventType === 'UPDATE') {
          setSolutions(prev => 
            prev.map(s => s.id === (payload.new as Solution).id ? (payload.new as Solution) : s)
          );
        } else if (payload.eventType === 'DELETE') {
          setSolutions(prev => prev.filter(s => s.id !== (payload.old as Solution).id));
        }
      })
      .subscribe((status) => {
        console.log('useSolutions - Solutions subscription status:', status);
      });
    
    // Charger les solutions au montage
    loadSolutions();
    
    // Nettoyage de l'abonnement
    return () => {
      console.log('useSolutions - Cleaning up subscription');
      api.supabase.removeChannel(solutionsChannel);
    };
  }, [briefId]);
  
  return {
    solutions,
    isLoading,
    error,
    loadSolutions,
    validateSolution
  };
}

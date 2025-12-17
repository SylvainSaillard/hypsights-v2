-- Migration: Correction des Fast Searches bloquées
-- Date: 2025-12-17
-- Description: Corrige les Fast Searches qui sont restées en état "pending" sans vérification

-- 1. Identifier et traiter les Fast Searches bloquées (lancées mais jamais vérifiées, > 1 heure)
DO $$
DECLARE
  v_solution RECORD;
  v_supplier_count INTEGER;
  v_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Début de la correction des Fast Searches bloquées...';
  
  FOR v_solution IN 
    SELECT 
      s.id as solution_id,
      s.brief_id,
      s.fast_search_launched_at,
      b.user_id,
      EXTRACT(EPOCH FROM (NOW() - s.fast_search_launched_at)) / 3600 as hours_elapsed
    FROM solutions s
    JOIN briefs b ON s.brief_id = b.id
    WHERE 
      s.fast_search_launched_at IS NOT NULL
      AND s.fast_search_checked_at IS NULL
      AND s.fast_search_refunded = FALSE
      AND s.fast_search_launched_at < NOW() - INTERVAL '1 hour'
  LOOP
    -- Compter les fournisseurs trouvés
    SELECT COUNT(DISTINCT smp.supplier_id)
    INTO v_supplier_count
    FROM supplier_match_profiles smp
    WHERE smp.solution_id = v_solution.solution_id;
    
    IF v_supplier_count > 0 THEN
      -- Succès: marquer comme vérifié avec succès
      UPDATE solutions
      SET 
        fast_search_status = 'success',
        fast_search_checked_at = NOW()
      WHERE id = v_solution.solution_id;
      
      -- Logger
      INSERT INTO fast_search_monitoring_logs (
        solution_id, brief_id, user_id, check_type, status, suppliers_found, refunded, details
      ) VALUES (
        v_solution.solution_id, v_solution.brief_id, v_solution.user_id,
        'migration_fix', 'success', v_supplier_count, FALSE,
        jsonb_build_object('fixed_at', NOW(), 'hours_elapsed', v_solution.hours_elapsed)
      );
      
      RAISE NOTICE 'Solution % : SUCCESS (% fournisseurs trouvés, % heures)', 
        v_solution.solution_id, v_supplier_count, ROUND(v_solution.hours_elapsed::numeric, 1);
    ELSE
      -- Échec: rembourser
      PERFORM refund_fast_search(
        v_solution.solution_id, 
        format('Migration fix: No suppliers found after %.1f hours', v_solution.hours_elapsed)
      );
      
      RAISE NOTICE 'Solution % : REFUNDED (0 fournisseurs, % heures)', 
        v_solution.solution_id, ROUND(v_solution.hours_elapsed::numeric, 1);
    END IF;
    
    v_count := v_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Correction terminée: % Fast Searches traitées', v_count;
END $$;

-- 2. Corriger les solutions avec status='finished' erroné (bug du callback précédent)
UPDATE solutions
SET status = 'validated'
WHERE 
  status = 'finished' 
  AND fast_search_status IN ('success', 'failed', 'pending')
  AND fast_search_launched_at IS NOT NULL;

-- 3. Note: Les valeurs 'error' ne peuvent pas exister dans l'enum solution_status
-- Cette correction n'est plus nécessaire car l'enum n'accepte que: proposed, validated, finished

-- 4. Ajouter un commentaire pour documenter
COMMENT ON COLUMN solutions.status IS 'Statut de la solution: proposed, validated. NE PAS utiliser finished/error ici.';

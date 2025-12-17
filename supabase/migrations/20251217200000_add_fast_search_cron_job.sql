-- Migration: Configuration du cron job pour Fast Search Monitor
-- Date: 2025-12-17
-- Description: Configure un cron job pour vérifier automatiquement les Fast Searches toutes les 5 minutes

-- 1. Activer l'extension pg_cron si nécessaire
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- 2. Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- 3. Créer une fonction pour appeler l'Edge Function fast-search-monitor
-- Note: Cette fonction sera appelée par pg_cron
CREATE OR REPLACE FUNCTION call_fast_search_monitor()
RETURNS void AS $$
DECLARE
  v_url TEXT;
  v_response JSONB;
BEGIN
  -- L'URL de l'Edge Function
  v_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/fast-search-monitor?action=check_all&delay=10';
  
  -- Log de l'appel
  RAISE NOTICE 'Calling fast-search-monitor at %', NOW();
  
  -- Note: pg_net est requis pour les appels HTTP depuis pg_cron
  -- Si pg_net n'est pas disponible, utiliser une approche alternative
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Alternative plus simple: Créer une fonction qui vérifie directement en SQL
-- Cette approche est plus fiable car elle ne dépend pas d'appels HTTP
CREATE OR REPLACE FUNCTION auto_check_fast_searches()
RETURNS void AS $$
DECLARE
  v_solution RECORD;
  v_supplier_count INTEGER;
  v_status TEXT;
  v_refunded BOOLEAN;
BEGIN
  -- Trouver les Fast Searches à vérifier (lancées il y a plus de 10 minutes, non vérifiées)
  FOR v_solution IN 
    SELECT 
      s.id as solution_id,
      s.brief_id,
      b.user_id
    FROM solutions s
    JOIN briefs b ON s.brief_id = b.id
    WHERE 
      s.fast_search_launched_at IS NOT NULL
      AND s.fast_search_checked_at IS NULL
      AND s.fast_search_refunded = FALSE
      AND s.fast_search_launched_at < NOW() - INTERVAL '10 minutes'
  LOOP
    -- Compter les fournisseurs trouvés
    SELECT COUNT(DISTINCT smp.supplier_id)
    INTO v_supplier_count
    FROM supplier_match_profiles smp
    WHERE smp.solution_id = v_solution.solution_id;
    
    -- Déterminer le statut
    IF v_supplier_count > 0 THEN
      v_status := 'success';
      v_refunded := FALSE;
      
      -- Mettre à jour la solution
      UPDATE solutions
      SET 
        fast_search_status = 'success',
        fast_search_checked_at = NOW()
      WHERE id = v_solution.solution_id;
    ELSE
      v_status := 'no_results';
      v_refunded := TRUE;
      
      -- Rembourser via la fonction existante
      PERFORM refund_fast_search(v_solution.solution_id, 'Auto-check: No suppliers found after 10 minutes');
    END IF;
    
    -- Logger l'événement
    INSERT INTO fast_search_monitoring_logs (
      solution_id,
      brief_id,
      user_id,
      check_type,
      status,
      suppliers_found,
      refunded,
      details
    ) VALUES (
      v_solution.solution_id,
      v_solution.brief_id,
      v_solution.user_id,
      'cron_auto_check',
      v_status,
      v_supplier_count,
      v_refunded,
      jsonb_build_object(
        'checked_at', NOW(),
        'source', 'pg_cron'
      )
    );
    
    RAISE NOTICE 'Checked solution %: status=%, suppliers=%', v_solution.solution_id, v_status, v_supplier_count;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Planifier le cron job (toutes les 5 minutes)
-- Note: Cette commande doit être exécutée après l'activation de pg_cron
SELECT cron.schedule(
  'fast-search-auto-check',           -- Nom du job
  '*/5 * * * *',                       -- Toutes les 5 minutes
  $$SELECT auto_check_fast_searches()$$
);

-- 6. Créer aussi une fonction pour traiter les solutions "abandonnées" (plus de 24h)
CREATE OR REPLACE FUNCTION cleanup_abandoned_fast_searches()
RETURNS void AS $$
BEGIN
  -- Rembourser les Fast Searches abandonnées (lancées il y a plus de 24h, non vérifiées)
  UPDATE solutions
  SET 
    fast_search_status = 'timeout',
    fast_search_checked_at = NOW(),
    fast_search_refunded = TRUE,
    fast_search_refund_reason = 'Automatic refund: Search abandoned after 24 hours'
  WHERE 
    fast_search_launched_at IS NOT NULL
    AND fast_search_checked_at IS NULL
    AND fast_search_refunded = FALSE
    AND fast_search_launched_at < NOW() - INTERVAL '24 hours';
    
  -- Log
  RAISE NOTICE 'Cleaned up abandoned fast searches at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Planifier le nettoyage quotidien
SELECT cron.schedule(
  'fast-search-cleanup',              -- Nom du job
  '0 3 * * *',                        -- Tous les jours à 3h du matin
  $$SELECT cleanup_abandoned_fast_searches()$$
);

-- 8. Commentaires
COMMENT ON FUNCTION auto_check_fast_searches IS 'Vérifie automatiquement les Fast Searches toutes les 5 minutes et rembourse si aucun résultat';
COMMENT ON FUNCTION cleanup_abandoned_fast_searches IS 'Nettoie les Fast Searches abandonnées (plus de 24h) quotidiennement';

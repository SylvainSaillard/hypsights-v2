-- Migration: Ajout des champs de monitoring pour Fast Search
-- Date: 2025-01-17
-- Description: Ajoute les champs nécessaires pour monitorer les Fast Searches et gérer les remboursements

-- 1. Ajouter les colonnes de monitoring dans la table solutions
ALTER TABLE solutions 
ADD COLUMN IF NOT EXISTS fast_search_status VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fast_search_checked_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fast_search_refunded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fast_search_refund_reason TEXT DEFAULT NULL;

-- 2. Créer un index pour optimiser les requêtes de monitoring
CREATE INDEX IF NOT EXISTS idx_solutions_fast_search_monitoring 
ON solutions(fast_search_launched_at, fast_search_status, fast_search_checked_at)
WHERE fast_search_launched_at IS NOT NULL;

-- 3. Créer une table pour logger les événements de monitoring
CREATE TABLE IF NOT EXISTS fast_search_monitoring_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_type VARCHAR(50) NOT NULL, -- 'auto_check', 'manual_check', 'refund'
  status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'no_results', 'timeout'
  suppliers_found INTEGER DEFAULT 0,
  refunded BOOLEAN DEFAULT FALSE,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Créer un index pour les logs
CREATE INDEX IF NOT EXISTS idx_fast_search_logs_solution 
ON fast_search_monitoring_logs(solution_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fast_search_logs_user 
ON fast_search_monitoring_logs(user_id, created_at DESC);

-- 5. Activer RLS sur la table de logs
ALTER TABLE fast_search_monitoring_logs ENABLE ROW LEVEL SECURITY;

-- 6. Politique RLS pour les logs (lecture par l'utilisateur propriétaire)
CREATE POLICY "Users can view their own monitoring logs"
ON fast_search_monitoring_logs
FOR SELECT
USING (user_id = auth.uid());

-- 7. Politique RLS pour service_role (accès complet)
CREATE POLICY "Service role has full access to monitoring logs"
ON fast_search_monitoring_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 8. Créer une fonction pour obtenir les Fast Searches à vérifier
CREATE OR REPLACE FUNCTION get_fast_searches_to_check(check_delay_minutes INTEGER DEFAULT 10)
RETURNS TABLE (
  solution_id UUID,
  brief_id UUID,
  user_id UUID,
  launched_at TIMESTAMPTZ,
  minutes_elapsed NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as solution_id,
    s.brief_id,
    b.user_id,
    s.fast_search_launched_at as launched_at,
    EXTRACT(EPOCH FROM (NOW() - s.fast_search_launched_at)) / 60 as minutes_elapsed
  FROM solutions s
  JOIN briefs b ON s.brief_id = b.id
  WHERE 
    s.fast_search_launched_at IS NOT NULL
    AND s.fast_search_checked_at IS NULL
    AND s.fast_search_refunded = FALSE
    AND s.fast_search_launched_at < NOW() - (check_delay_minutes || ' minutes')::INTERVAL
  ORDER BY s.fast_search_launched_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Créer une fonction pour compter les fournisseurs d'une solution
CREATE OR REPLACE FUNCTION count_suppliers_for_solution(p_solution_id UUID)
RETURNS INTEGER AS $$
DECLARE
  supplier_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT sm.supplier_id)
  INTO supplier_count
  FROM supplier_matches sm
  WHERE sm.solution_id = p_solution_id;
  
  RETURN COALESCE(supplier_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Créer une fonction pour rembourser un Fast Search
CREATE OR REPLACE FUNCTION refund_fast_search(
  p_solution_id UUID,
  p_reason TEXT DEFAULT 'No results or workflow timeout'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_brief_id UUID;
  v_user_id UUID;
  v_already_refunded BOOLEAN;
BEGIN
  -- Vérifier si déjà remboursé
  SELECT fast_search_refunded, brief_id
  INTO v_already_refunded, v_brief_id
  FROM solutions
  WHERE id = p_solution_id;
  
  IF v_already_refunded THEN
    RAISE NOTICE 'Fast search already refunded for solution %', p_solution_id;
    RETURN FALSE;
  END IF;
  
  -- Obtenir l'user_id
  SELECT user_id INTO v_user_id
  FROM briefs
  WHERE id = v_brief_id;
  
  -- Marquer la solution comme remboursée
  UPDATE solutions
  SET 
    fast_search_refunded = TRUE,
    fast_search_refund_reason = p_reason,
    fast_search_status = 'refunded',
    fast_search_checked_at = NOW(),
    fast_search_launched_at = NULL  -- Réinitialiser pour libérer le quota
  WHERE id = p_solution_id;
  
  -- Logger l'événement
  INSERT INTO fast_search_monitoring_logs (
    solution_id,
    brief_id,
    user_id,
    check_type,
    status,
    refunded,
    details
  ) VALUES (
    p_solution_id,
    v_brief_id,
    v_user_id,
    'refund',
    'refunded',
    TRUE,
    jsonb_build_object('reason', p_reason, 'refunded_at', NOW())
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Commentaires pour documentation
COMMENT ON COLUMN solutions.fast_search_status IS 'Statut du monitoring: pending, success, failed, no_results, timeout, refunded';
COMMENT ON COLUMN solutions.fast_search_checked_at IS 'Date de vérification du Fast Search (10 min après lancement)';
COMMENT ON COLUMN solutions.fast_search_refunded IS 'Indique si le quota a été remboursé suite à un échec';
COMMENT ON COLUMN solutions.fast_search_refund_reason IS 'Raison du remboursement du quota';

COMMENT ON TABLE fast_search_monitoring_logs IS 'Logs des vérifications et remboursements de Fast Search';
COMMENT ON FUNCTION get_fast_searches_to_check IS 'Retourne les Fast Searches qui doivent être vérifiés';
COMMENT ON FUNCTION count_suppliers_for_solution IS 'Compte le nombre de fournisseurs trouvés pour une solution';
COMMENT ON FUNCTION refund_fast_search IS 'Rembourse un Fast Search en cas d''échec';

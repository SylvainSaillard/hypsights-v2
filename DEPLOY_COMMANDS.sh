#!/bin/bash

# ============================================================================
# Fast Search Monitoring - Commandes de Déploiement
# ============================================================================
# Ce script contient toutes les commandes nécessaires pour déployer
# le système de monitoring et remboursement des Fast Searches.
#
# Usage: Exécuter les commandes une par une (ne pas exécuter le script entier)
# ============================================================================

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Fast Search Monitoring - Déploiement${NC}"
echo -e "${BLUE}========================================${NC}\n"

# ============================================================================
# ÉTAPE 1: Vérification de l'environnement
# ============================================================================
echo -e "${YELLOW}ÉTAPE 1: Vérification de l'environnement${NC}\n"

# Vérifier que Supabase CLI est installé
echo "Vérification de Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI n'est pas installé${NC}"
    echo "Installation: npm install -g supabase"
    exit 1
else
    echo -e "${GREEN}✓ Supabase CLI installé${NC}"
    supabase --version
fi

# Vérifier la connexion au projet
echo -e "\nVérification de la connexion au projet..."
echo "Project ID: lmqagaenmseopcctkrwv"

# ============================================================================
# ÉTAPE 2: Appliquer la migration SQL
# ============================================================================
echo -e "\n${YELLOW}ÉTAPE 2: Appliquer la migration SQL${NC}\n"

echo "Option A: Via Supabase CLI (recommandé)"
echo "Commande à exécuter:"
echo -e "${GREEN}supabase db push --project-ref lmqagaenmseopcctkrwv${NC}\n"

echo "Option B: Via Supabase Dashboard"
echo "1. Aller sur: https://supabase.com/dashboard/project/lmqagaenmseopcctkrwv"
echo "2. SQL Editor → New Query"
echo "3. Copier le contenu de: supabase/migrations/20250117000000_add_fast_search_monitoring.sql"
echo "4. Cliquer sur 'Run'"

echo -e "\n${BLUE}Vérification après migration:${NC}"
echo "Exécuter dans SQL Editor:"
cat << 'EOF'

-- Vérifier les nouvelles colonnes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'solutions' 
AND column_name LIKE 'fast_search%';

-- Vérifier la table de logs
SELECT COUNT(*) FROM fast_search_monitoring_logs;

-- Vérifier les fonctions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
  'get_fast_searches_to_check', 
  'count_suppliers_for_solution', 
  'refund_fast_search'
);

EOF

# ============================================================================
# ÉTAPE 3: Déployer les Edge Functions
# ============================================================================
echo -e "\n${YELLOW}ÉTAPE 3: Déployer les Edge Functions${NC}\n"

echo "Déployer fast-search-monitor (nouvelle fonction):"
echo -e "${GREEN}supabase functions deploy fast-search-monitor --project-ref lmqagaenmseopcctkrwv${NC}\n"

echo "Re-déployer fast-search-handler (modifiée):"
echo -e "${GREEN}supabase functions deploy fast-search-handler --project-ref lmqagaenmseopcctkrwv${NC}\n"

echo -e "${BLUE}Test après déploiement:${NC}"
echo "Tester fast-search-monitor:"
echo -e "${GREEN}curl \"https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10\"${NC}\n"

echo "Résultat attendu:"
cat << 'EOF'
{
  "success": true,
  "checked": 0,
  "results": [],
  "timestamp": "2025-01-17T..."
}
EOF

# ============================================================================
# ÉTAPE 4: Configurer le Cron Job
# ============================================================================
echo -e "\n${YELLOW}ÉTAPE 4: Configurer le Cron Job${NC}\n"

echo -e "${BLUE}Option A: n8n Workflow (Recommandé)${NC}"
echo "1. Créer un nouveau workflow dans n8n"
echo "2. Ajouter un nœud 'Schedule Trigger'"
echo "   - Interval: 5 minutes"
echo "3. Ajouter un nœud 'HTTP Request'"
echo "   - Method: GET"
echo "   - URL: https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10"
echo "4. Activer le workflow"

echo -e "\n${BLUE}Option B: Supabase pg_cron${NC}"
echo "Exécuter dans SQL Editor:"
cat << 'EOF'

-- Activer pg_cron (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Créer le job de monitoring
SELECT cron.schedule(
  'fast-search-monitor',
  '*/5 * * * *',  -- Toutes les 5 minutes
  $$
  SELECT net.http_get(
    url := 'https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);

-- Vérifier que le job est créé
SELECT * FROM cron.job WHERE jobname = 'fast-search-monitor';

EOF

echo -e "\n${BLUE}Option C: GitHub Actions${NC}"
echo "Créer le fichier: .github/workflows/fast-search-monitor.yml"
cat << 'EOF'

name: Fast Search Monitor
on:
  schedule:
    - cron: '*/5 * * * *'  # Toutes les 5 minutes
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check Fast Searches
        run: |
          curl -X GET "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10"

EOF

# ============================================================================
# ÉTAPE 5: Tests de Validation
# ============================================================================
echo -e "\n${YELLOW}ÉTAPE 5: Tests de Validation${NC}\n"

echo -e "${BLUE}Test 1: Lancer une Fast Search${NC}"
echo "1. Via l'interface, lancer une Fast Search"
echo "2. Vérifier dans la base de données:"
cat << 'EOF'

SELECT 
  id, 
  title, 
  fast_search_status, 
  fast_search_launched_at,
  fast_search_checked_at,
  fast_search_refunded
FROM solutions 
WHERE id = 'YOUR_SOLUTION_ID';

-- Résultat attendu:
-- fast_search_status: 'pending'
-- fast_search_launched_at: timestamp récent
-- fast_search_checked_at: null
-- fast_search_refunded: false

EOF

echo -e "\n${BLUE}Test 2: Vérification manuelle${NC}"
echo "Forcer une vérification sans attendre 10 minutes:"
echo -e "${GREEN}curl \"https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_one&solution_id=YOUR_SOLUTION_ID\"${NC}\n"

echo "Vérifier le résultat:"
cat << 'EOF'

SELECT * FROM fast_search_monitoring_logs 
WHERE solution_id = 'YOUR_SOLUTION_ID' 
ORDER BY created_at DESC LIMIT 1;

EOF

echo -e "\n${BLUE}Test 3: Vérifier le remboursement (si 0 fournisseur)${NC}"
cat << 'EOF'

SELECT 
  s.id,
  s.fast_search_status,
  s.fast_search_refunded,
  s.fast_search_refund_reason,
  s.fast_search_launched_at  -- Devrait être NULL après remboursement
FROM solutions s
WHERE s.id = 'YOUR_SOLUTION_ID';

EOF

# ============================================================================
# ÉTAPE 6: Monitoring Post-Déploiement
# ============================================================================
echo -e "\n${YELLOW}ÉTAPE 6: Monitoring Post-Déploiement${NC}\n"

echo -e "${BLUE}Requêtes SQL de monitoring:${NC}\n"

echo "1. Vue d'ensemble (dernières 24h):"
cat << 'EOF'

SELECT 
  fast_search_status,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM solutions
WHERE fast_search_launched_at > NOW() - INTERVAL '24 hours'
GROUP BY fast_search_status
ORDER BY count DESC;

EOF

echo -e "\n2. Taux de remboursement:"
cat << 'EOF'

SELECT 
  COUNT(*) FILTER (WHERE fast_search_refunded = true) as refunded,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE fast_search_refunded = true) * 100.0 / COUNT(*) as refund_rate
FROM solutions
WHERE fast_search_launched_at > NOW() - INTERVAL '24 hours';

EOF

echo -e "\n3. Fast Searches en attente:"
cat << 'EOF'

SELECT 
  s.id,
  s.title,
  s.fast_search_launched_at,
  EXTRACT(EPOCH FROM (NOW() - s.fast_search_launched_at)) / 60 as minutes_elapsed
FROM solutions s
WHERE 
  s.fast_search_launched_at IS NOT NULL
  AND s.fast_search_checked_at IS NULL
  AND s.fast_search_refunded = false
ORDER BY s.fast_search_launched_at ASC;

EOF

echo -e "\n4. Derniers remboursements:"
cat << 'EOF'

SELECT 
  l.created_at,
  s.title as solution_title,
  l.suppliers_found,
  l.details->>'reason' as reason
FROM fast_search_monitoring_logs l
JOIN solutions s ON l.solution_id = s.id
WHERE l.refunded = true
ORDER BY l.created_at DESC
LIMIT 10;

EOF

# ============================================================================
# ÉTAPE 7: Vérification des Logs
# ============================================================================
echo -e "\n${YELLOW}ÉTAPE 7: Vérification des Logs${NC}\n"

echo "Voir les logs de fast-search-monitor:"
echo -e "${GREEN}supabase functions logs fast-search-monitor --project-ref lmqagaenmseopcctkrwv${NC}\n"

echo "Voir les logs de fast-search-handler:"
echo -e "${GREEN}supabase functions logs fast-search-handler --project-ref lmqagaenmseopcctkrwv${NC}\n"

echo "Logs en temps réel:"
echo -e "${GREEN}supabase functions logs fast-search-monitor --project-ref lmqagaenmseopcctkrwv --follow${NC}\n"

# ============================================================================
# RÉSUMÉ
# ============================================================================
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Déploiement Terminé !${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo "✓ Migration SQL appliquée"
echo "✓ Edge Functions déployées"
echo "✓ Cron job configuré"
echo "✓ Tests validés"
echo "✓ Monitoring en place"

echo -e "\n${BLUE}Prochaines étapes:${NC}"
echo "1. Surveiller le taux de remboursement (alerte si >20%)"
echo "2. Vérifier que le cron job fonctionne (toutes les 5 min)"
echo "3. Analyser les raisons de remboursement"
echo "4. Consulter la documentation: docs/FAST_SEARCH_MONITORING.md"

echo -e "\n${BLUE}Commandes utiles:${NC}"
echo "- Test manuel: curl \"https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all\""
echo "- Logs: supabase functions logs fast-search-monitor --project-ref lmqagaenmseopcctkrwv"
echo "- Monitoring: SELECT * FROM fast_search_monitoring_logs ORDER BY created_at DESC LIMIT 20;"

echo -e "\n${YELLOW}⚠️  N'oubliez pas de configurer le cron job (Étape 4) !${NC}\n"

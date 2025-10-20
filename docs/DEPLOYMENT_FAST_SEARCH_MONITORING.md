# Guide de Déploiement - Fast Search Monitoring

## Checklist de Déploiement

### ✅ Étape 1: Appliquer la Migration SQL

```bash
# Option A: Via Supabase CLI
cd /Users/sylvain/Hypsights\ v2
supabase db push

# Option B: Via Supabase Dashboard
# 1. Aller sur https://supabase.com/dashboard/project/lmqagaenmseopcctkrwv
# 2. SQL Editor → New Query
# 3. Copier le contenu de supabase/migrations/20250117000000_add_fast_search_monitoring.sql
# 4. Run
```

**Vérification:**
```sql
-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'solutions' 
AND column_name LIKE 'fast_search%';

-- Vérifier que la table de logs existe
SELECT COUNT(*) FROM fast_search_monitoring_logs;

-- Vérifier que les fonctions existent
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('get_fast_searches_to_check', 'count_suppliers_for_solution', 'refund_fast_search');
```

### ✅ Étape 2: Déployer les Edge Functions

```bash
# Déployer la nouvelle fonction de monitoring
supabase functions deploy fast-search-monitor --project-ref lmqagaenmseopcctkrwv

# Re-déployer fast-search-handler (modifiée)
supabase functions deploy fast-search-handler --project-ref lmqagaenmseopcctkrwv
```

**Vérification:**
```bash
# Tester fast-search-monitor
curl "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10"

# Devrait retourner:
# {"success":true,"checked":0,"results":[],"timestamp":"2025-01-17T..."}
```

### ✅ Étape 3: Configurer le Cron Job

**Option recommandée: n8n Workflow**

Créer un nouveau workflow n8n avec:

1. **Trigger: Schedule**
   - Interval: 5 minutes
   - Start: Immediately

2. **HTTP Request Node**
   - Method: GET
   - URL: `https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10`
   - Headers: `Content-Type: application/json`

3. **IF Node** (optionnel - pour notifications)
   - Condition: `{{ $json.checked > 0 }}`
   - True branch: Envoyer notification Slack/Email

**Alternative: Supabase pg_cron**
```sql
-- Activer pg_cron (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Créer le job
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
```

### ✅ Étape 4: Tester le Système Complet

#### Test 1: Lancer une Fast Search
```typescript
// Dans le frontend, lancer une Fast Search normale
// Vérifier dans la base de données:
SELECT 
  id, 
  title, 
  fast_search_status, 
  fast_search_launched_at,
  fast_search_checked_at,
  fast_search_refunded
FROM solutions 
WHERE id = 'YOUR_SOLUTION_ID';

// Devrait afficher:
// fast_search_status: 'pending'
// fast_search_launched_at: timestamp récent
// fast_search_checked_at: null
// fast_search_refunded: false
```

#### Test 2: Simuler une vérification manuelle
```bash
# Attendre 10 minutes OU modifier le délai pour test
curl "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_one&solution_id=YOUR_SOLUTION_ID"

# Vérifier le résultat dans la base:
SELECT * FROM fast_search_monitoring_logs 
WHERE solution_id = 'YOUR_SOLUTION_ID' 
ORDER BY created_at DESC LIMIT 1;
```

#### Test 3: Vérifier le remboursement
```sql
-- Si aucun fournisseur trouvé, vérifier le remboursement
SELECT 
  s.id,
  s.fast_search_status,
  s.fast_search_refunded,
  s.fast_search_refund_reason,
  s.fast_search_launched_at  -- Devrait être NULL après remboursement
FROM solutions s
WHERE s.id = 'YOUR_SOLUTION_ID';

-- Vérifier le log de remboursement
SELECT * FROM fast_search_monitoring_logs
WHERE solution_id = 'YOUR_SOLUTION_ID' 
AND check_type = 'refund';
```

### ✅ Étape 5: Monitoring Post-Déploiement

#### Dashboard SQL à exécuter quotidiennement
```sql
-- 1. Vue d'ensemble des Fast Searches (dernières 24h)
SELECT 
  fast_search_status,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM solutions
WHERE fast_search_launched_at > NOW() - INTERVAL '24 hours'
GROUP BY fast_search_status
ORDER BY count DESC;

-- 2. Taux de remboursement
SELECT 
  DATE(fast_search_checked_at) as date,
  COUNT(*) FILTER (WHERE fast_search_refunded = true) as refunded,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE fast_search_refunded = true) * 100.0 / COUNT(*) as refund_rate
FROM solutions
WHERE fast_search_checked_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(fast_search_checked_at)
ORDER BY date DESC;

-- 3. Fast Searches en attente (à vérifier)
SELECT 
  s.id,
  b.title as brief_title,
  s.title as solution_title,
  s.fast_search_launched_at,
  EXTRACT(EPOCH FROM (NOW() - s.fast_search_launched_at)) / 60 as minutes_elapsed
FROM solutions s
JOIN briefs b ON s.brief_id = b.id
WHERE 
  s.fast_search_launched_at IS NOT NULL
  AND s.fast_search_checked_at IS NULL
  AND s.fast_search_refunded = false
ORDER BY s.fast_search_launched_at ASC;

-- 4. Derniers remboursements
SELECT 
  l.created_at,
  b.title as brief_title,
  s.title as solution_title,
  l.suppliers_found,
  l.details->>'reason' as reason,
  u.email as user_email
FROM fast_search_monitoring_logs l
JOIN solutions s ON l.solution_id = s.id
JOIN briefs b ON l.brief_id = b.id
JOIN auth.users u ON l.user_id = u.id
WHERE l.refunded = true
ORDER BY l.created_at DESC
LIMIT 20;
```

## Rollback en Cas de Problème

### Désactiver le monitoring temporairement
```sql
-- Désactiver le cron job
SELECT cron.unschedule('fast-search-monitor');

-- Ou dans n8n: désactiver le workflow
```

### Rollback complet (si nécessaire)
```sql
-- 1. Supprimer les fonctions
DROP FUNCTION IF EXISTS refund_fast_search(UUID, TEXT);
DROP FUNCTION IF EXISTS count_suppliers_for_solution(UUID);
DROP FUNCTION IF EXISTS get_fast_searches_to_check(INTEGER);

-- 2. Supprimer la table de logs
DROP TABLE IF EXISTS fast_search_monitoring_logs;

-- 3. Supprimer les colonnes (ATTENTION: perte de données)
ALTER TABLE solutions 
DROP COLUMN IF EXISTS fast_search_status,
DROP COLUMN IF EXISTS fast_search_checked_at,
DROP COLUMN IF EXISTS fast_search_refunded,
DROP COLUMN IF EXISTS fast_search_refund_reason;

-- 4. Re-déployer l'ancienne version de fast-search-handler
# Via git: checkout version précédente et re-déployer
```

## Alertes à Configurer

### 1. Taux de remboursement élevé (>20%)
```sql
-- Requête à exécuter quotidiennement
SELECT 
  COUNT(*) FILTER (WHERE fast_search_refunded = true) * 100.0 / COUNT(*) as refund_rate
FROM solutions
WHERE fast_search_launched_at > NOW() - INTERVAL '24 hours'
HAVING COUNT(*) FILTER (WHERE fast_search_refunded = true) * 100.0 / COUNT(*) > 20;

-- Si résultat > 0: Envoyer alerte à l'équipe
```

### 2. Fast Searches bloquées (>15 minutes)
```sql
-- Requête à exécuter toutes les 5 minutes
SELECT COUNT(*) as stuck_searches
FROM solutions
WHERE 
  fast_search_launched_at IS NOT NULL
  AND fast_search_checked_at IS NULL
  AND fast_search_launched_at < NOW() - INTERVAL '15 minutes';

-- Si stuck_searches > 0: Vérifier le cron job
```

### 3. Aucune vérification depuis 10 minutes
```sql
-- Vérifier que le système fonctionne
SELECT MAX(created_at) as last_check
FROM fast_search_monitoring_logs
WHERE check_type = 'auto_check';

-- Si last_check < NOW() - 10 minutes: Cron job potentiellement arrêté
```

## Support et Maintenance

### Logs à surveiller
1. **Supabase Edge Functions Logs** - Erreurs dans fast-search-monitor
2. **n8n Workflow Logs** - Échecs du cron job
3. **Table fast_search_monitoring_logs** - Historique des vérifications

### Commandes utiles
```bash
# Voir les logs de fast-search-monitor
supabase functions logs fast-search-monitor --project-ref lmqagaenmseopcctkrwv

# Voir les logs de fast-search-handler
supabase functions logs fast-search-handler --project-ref lmqagaenmseopcctkrwv

# Test manuel d'une vérification
curl -X GET "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10"
```

## Contact

En cas de problème:
1. Vérifier les logs Supabase
2. Vérifier la table `fast_search_monitoring_logs`
3. Tester manuellement avec curl
4. Consulter la documentation complète: `docs/FAST_SEARCH_MONITORING.md`

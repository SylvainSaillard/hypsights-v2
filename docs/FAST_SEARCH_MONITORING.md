# Fast Search Monitoring & Refund System

## Vue d'ensemble

Ce système surveille automatiquement les Fast Searches et rembourse le quota utilisateur en cas d'échec (workflow N8n planté ou aucun résultat trouvé).

## Architecture

### 1. Base de Données

#### Table `solutions` - Nouveaux champs
```sql
- fast_search_status VARCHAR(50)      -- 'pending', 'success', 'failed', 'no_results', 'timeout', 'refunded'
- fast_search_checked_at TIMESTAMPTZ  -- Date de vérification (10 min après lancement)
- fast_search_refunded BOOLEAN        -- Indique si le quota a été remboursé
- fast_search_refund_reason TEXT      -- Raison du remboursement
```

#### Table `fast_search_monitoring_logs`
Logs de tous les événements de monitoring et remboursements.

```sql
CREATE TABLE fast_search_monitoring_logs (
  id UUID PRIMARY KEY,
  solution_id UUID REFERENCES solutions(id),
  brief_id UUID REFERENCES briefs(id),
  user_id UUID REFERENCES auth.users(id),
  check_type VARCHAR(50),           -- 'auto_check', 'manual_check', 'refund'
  status VARCHAR(50),               -- 'success', 'failed', 'no_results', 'timeout'
  suppliers_found INTEGER,
  refunded BOOLEAN,
  details JSONB,
  created_at TIMESTAMPTZ
);
```

### 2. Fonctions SQL

#### `get_fast_searches_to_check(check_delay_minutes)`
Retourne les Fast Searches qui doivent être vérifiées.

**Critères:**
- `fast_search_launched_at` non null
- `fast_search_checked_at` null (pas encore vérifiée)
- `fast_search_refunded` = false
- Lancée il y a plus de `check_delay_minutes` minutes (défaut: 10)

#### `count_suppliers_for_solution(solution_id)`
Compte le nombre de fournisseurs trouvés pour une solution.

#### `refund_fast_search(solution_id, reason)`
Rembourse un Fast Search en cas d'échec.

**Actions:**
1. Vérifie que la solution n'a pas déjà été remboursée
2. Marque `fast_search_refunded = true`
3. Réinitialise `fast_search_launched_at = null` (libère le quota)
4. Met à jour `fast_search_status = 'refunded'`
5. Enregistre la raison dans `fast_search_refund_reason`
6. Crée un log dans `fast_search_monitoring_logs`

### 3. Edge Functions

#### `fast-search-handler` (modifiée)
**Modifications:**
- Initialise le monitoring au lancement de la Fast Search
- Met à jour `fast_search_status = 'pending'`
- Enregistre `fast_search_launched_at = NOW()`

#### `fast-search-monitor` (nouvelle)
**Actions:**
- `check_all`: Vérifie toutes les Fast Searches en attente
- `check_one`: Vérifie une Fast Search spécifique

**Logique de vérification:**
1. Compte les fournisseurs trouvés
2. Si `suppliers_found > 0` → Statut `success`
3. Si `suppliers_found = 0` → Statut `no_results`, remboursement automatique
4. Met à jour `fast_search_status` et `fast_search_checked_at`
5. Crée un log dans `fast_search_monitoring_logs`

### 4. Service Frontend

#### `fastSearchMonitorService.ts`
Fonctions disponibles:
- `checkAllPendingSearches(delayMinutes)` - Vérifier toutes les Fast Searches
- `checkSingleSearch(solutionId)` - Vérifier une Fast Search spécifique
- `getUserMonitoringLogs(userId)` - Récupérer les logs utilisateur
- `getBriefMonitoringLogs(briefId)` - Récupérer les logs d'un brief
- `subscribeToFastSearchStatus(briefId, callback)` - S'abonner aux changements
- `isSolutionRefunded(solutionId)` - Vérifier si remboursée

## Flux de Fonctionnement

### 1. Lancement d'une Fast Search
```
User clicks "Fast Search" 
  → fast-search-handler appelée
  → Initialise monitoring (status='pending', launched_at=NOW())
  → Appelle webhook N8n
  → Retourne success au frontend
```

### 2. Monitoring Automatique (après 10 minutes)
```
Cron job ou appel manuel
  → fast-search-monitor appelée
  → Récupère les Fast Searches à vérifier
  → Pour chaque Fast Search:
      - Compte les fournisseurs trouvés
      - Si 0 fournisseur → Rembourse automatiquement
      - Si >0 fournisseurs → Marque comme success
      - Met à jour le statut
      - Crée un log
```

### 3. Remboursement
```
Détection d'échec
  → refund_fast_search() appelée
  → fast_search_refunded = true
  → fast_search_launched_at = null (libère le quota)
  → fast_search_status = 'refunded'
  → Log créé avec raison
  → Quota disponible pour l'utilisateur
```

## Déploiement

### 1. Appliquer la migration
```bash
# Via Supabase CLI
supabase db push

# Ou via Supabase Dashboard
# SQL Editor → Coller le contenu de 20250117000000_add_fast_search_monitoring.sql
```

### 2. Déployer les Edge Functions
```bash
# Déployer fast-search-monitor
supabase functions deploy fast-search-monitor

# Re-déployer fast-search-handler (modifiée)
supabase functions deploy fast-search-handler
```

### 3. Configurer un Cron Job (Recommandé)

#### Option A: Supabase Cron (pg_cron)
```sql
-- Vérifier toutes les 5 minutes
SELECT cron.schedule(
  'check-fast-searches',
  '*/5 * * * *',  -- Toutes les 5 minutes
  $$
  SELECT net.http_get(
    url := 'https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

#### Option B: Service externe (n8n, GitHub Actions, etc.)
```yaml
# GitHub Actions - .github/workflows/fast-search-monitor.yml
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
```

#### Option C: Appel manuel via n8n
Créer un workflow n8n qui:
1. Se déclenche toutes les 5 minutes
2. Appelle l'Edge Function `fast-search-monitor`
3. Envoie une notification si des remboursements ont été effectués

### 4. Vérification du Déploiement

#### Test manuel
```bash
# Vérifier une Fast Search spécifique
curl "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_one&solution_id=YOUR_SOLUTION_ID"

# Vérifier toutes les Fast Searches en attente
curl "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10"
```

#### Vérifier les logs
```sql
-- Voir les derniers logs de monitoring
SELECT * FROM fast_search_monitoring_logs
ORDER BY created_at DESC
LIMIT 20;

-- Voir les Fast Searches remboursées
SELECT 
  s.id,
  s.title,
  s.fast_search_refund_reason,
  s.fast_search_checked_at,
  b.title as brief_title
FROM solutions s
JOIN briefs b ON s.brief_id = b.id
WHERE s.fast_search_refunded = true
ORDER BY s.fast_search_checked_at DESC;
```

## Cas d'Usage

### Cas 1: Workflow N8n planté
**Symptômes:** Aucun fournisseur trouvé après 10 minutes

**Action automatique:**
1. Monitoring détecte 0 fournisseur
2. Statut → `no_results`
3. Remboursement automatique
4. Log créé: "No suppliers found after 10 minutes - workflow may have failed"

### Cas 2: Aucun résultat disponible
**Symptômes:** Workflow terminé mais aucun fournisseur correspondant

**Action automatique:**
1. Monitoring détecte 0 fournisseur
2. Statut → `no_results`
3. Remboursement automatique
4. Log créé: "No suppliers found after 10 minutes - no results available"

### Cas 3: Succès
**Symptômes:** Au moins 1 fournisseur trouvé

**Action automatique:**
1. Monitoring détecte >0 fournisseurs
2. Statut → `success`
3. Pas de remboursement
4. Log créé avec nombre de fournisseurs

## Interface Utilisateur

### Affichage du statut
```typescript
// Dans EnhancedChatView ou SolutionsPanel
const { data: solution } = await supabase
  .from('solutions')
  .select('fast_search_status, fast_search_refunded, fast_search_refund_reason')
  .eq('id', solutionId)
  .single();

if (solution.fast_search_refunded) {
  // Afficher notification: "Fast Search refunded - quota restored"
  // Raison: solution.fast_search_refund_reason
}
```

### Notification en temps réel
```typescript
import { subscribeToFastSearchStatus } from '../services/fastSearchMonitorService';

// S'abonner aux changements
const unsubscribe = subscribeToFastSearchStatus(briefId, (solution) => {
  if (solution.fast_search_refunded) {
    showNotification({
      type: 'info',
      title: 'Fast Search Refunded',
      message: 'Your Fast Search quota has been restored due to: ' + solution.fast_search_refund_reason
    });
  }
});

// Nettoyer à la destruction du composant
return () => unsubscribe();
```

## Monitoring et Maintenance

### Métriques à surveiller
1. **Taux de remboursement** - % de Fast Searches remboursées
2. **Temps de vérification** - Délai entre lancement et vérification
3. **Raisons de remboursement** - Distribution des causes d'échec
4. **Fournisseurs trouvés** - Moyenne par Fast Search réussie

### Requêtes utiles
```sql
-- Taux de remboursement sur les 7 derniers jours
SELECT 
  COUNT(*) FILTER (WHERE fast_search_refunded = true) * 100.0 / COUNT(*) as refund_rate
FROM solutions
WHERE fast_search_launched_at > NOW() - INTERVAL '7 days';

-- Distribution des statuts
SELECT 
  fast_search_status,
  COUNT(*) as count
FROM solutions
WHERE fast_search_launched_at IS NOT NULL
GROUP BY fast_search_status
ORDER BY count DESC;

-- Fast Searches en attente de vérification
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
```

## Troubleshooting

### Problème: Les Fast Searches ne sont pas vérifiées
**Solution:**
1. Vérifier que le cron job est actif
2. Vérifier les logs de l'Edge Function
3. Tester manuellement: `curl .../fast-search-monitor?action=check_all`

### Problème: Remboursements non effectués
**Solution:**
1. Vérifier les RLS policies sur `solutions`
2. Vérifier les logs: `SELECT * FROM fast_search_monitoring_logs`
3. Tester la fonction SQL: `SELECT refund_fast_search('solution_id', 'test')`

### Problème: Quota non libéré après remboursement
**Solution:**
1. Vérifier que `fast_search_launched_at = null` après remboursement
2. Vérifier le calcul du quota dans `dashboard-data` ou `brief-header-data`
3. Forcer la mise à jour: `UPDATE solutions SET fast_search_launched_at = null WHERE id = 'solution_id'`

## Améliorations Futures

1. **Notifications email** - Envoyer un email à l'utilisateur en cas de remboursement
2. **Dashboard admin** - Interface pour voir tous les remboursements
3. **Retry automatique** - Relancer automatiquement les Fast Searches échouées
4. **Alertes Slack** - Notifier l'équipe en cas de taux de remboursement élevé
5. **Analyse des causes** - ML pour détecter les patterns d'échec

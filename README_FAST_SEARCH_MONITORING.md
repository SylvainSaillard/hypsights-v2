# Fast Search Monitoring & Refund System

## 🚀 Quick Start

Ce système surveille automatiquement les Fast Searches et rembourse le quota utilisateur en cas d'échec.

### Déploiement Rapide (5 minutes)

```bash
# 1. Appliquer la migration
supabase db push

# 2. Déployer les Edge Functions
supabase functions deploy fast-search-monitor --project-ref lmqagaenmseopcctkrwv
supabase functions deploy fast-search-handler --project-ref lmqagaenmseopcctkrwv

# 3. Tester
curl "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10"

# 4. Configurer le cron job (voir documentation)
```

## 📖 Documentation

### Pour Démarrer
- **[Résumé Exécutif](docs/FAST_SEARCH_MONITORING_SUMMARY.md)** - Vue d'ensemble en 5 minutes
- **[Guide de Déploiement](docs/DEPLOYMENT_FAST_SEARCH_MONITORING.md)** - Instructions pas à pas

### Documentation Technique
- **[Documentation Complète](docs/FAST_SEARCH_MONITORING.md)** - Architecture détaillée, API, troubleshooting

### Code Source
- **Migration SQL**: `supabase/migrations/20250117000000_add_fast_search_monitoring.sql`
- **Edge Function Monitor**: `supabase/functions/fast-search-monitor/index.ts`
- **Edge Function Handler**: `supabase/functions/fast-search-handler/index.ts` (modifiée)
- **Service Frontend**: `src/services/fastSearchMonitorService.ts`

## 🎯 Fonctionnalités

### ✅ Ce qui est automatique
- ✓ Initialisation du monitoring au lancement d'une Fast Search
- ✓ Vérification automatique après 10 minutes
- ✓ Remboursement automatique si échec détecté
- ✓ Logging de tous les événements
- ✓ Notifications en temps réel (via Supabase Realtime)

### 🔍 Ce qui est surveillé
- Workflow N8n planté (timeout)
- Aucun fournisseur trouvé
- Temps d'exécution anormal
- Taux de remboursement global

## 📊 Monitoring Dashboard

### Requêtes SQL Essentielles

**Vue d'ensemble (dernières 24h)**
```sql
SELECT 
  fast_search_status,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM solutions
WHERE fast_search_launched_at > NOW() - INTERVAL '24 hours'
GROUP BY fast_search_status;
```

**Fast Searches en attente de vérification**
```sql
SELECT 
  id, title, 
  fast_search_launched_at,
  EXTRACT(EPOCH FROM (NOW() - fast_search_launched_at)) / 60 as minutes_elapsed
FROM solutions
WHERE fast_search_launched_at IS NOT NULL
  AND fast_search_checked_at IS NULL
  AND fast_search_refunded = false
ORDER BY fast_search_launched_at ASC;
```

**Derniers remboursements**
```sql
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
```

## 🔧 Configuration

### Variables d'Environnement
Aucune variable supplémentaire nécessaire. Le système utilise les variables Supabase existantes.

### Cron Job (Requis)

**Option 1: n8n Workflow (Recommandé)**
```
Trigger: Schedule (5 minutes)
HTTP Request: GET https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10
```

**Option 2: Supabase pg_cron**
```sql
SELECT cron.schedule(
  'fast-search-monitor',
  '*/5 * * * *',
  $$SELECT net.http_get(url := 'https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10');$$
);
```

## 🧪 Tests

### Test Manuel Complet

```bash
# 1. Lancer une Fast Search via l'interface
# 2. Vérifier l'initialisation
psql> SELECT id, fast_search_status, fast_search_launched_at FROM solutions WHERE id = 'YOUR_SOLUTION_ID';

# 3. Forcer une vérification (sans attendre 10 min)
curl "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_one&solution_id=YOUR_SOLUTION_ID"

# 4. Vérifier le résultat
psql> SELECT * FROM fast_search_monitoring_logs WHERE solution_id = 'YOUR_SOLUTION_ID';
```

### Tests Automatisés

```typescript
// Test du service frontend
import { checkSingleSearch, isSolutionRefunded } from './services/fastSearchMonitorService';

// Vérifier une solution
const result = await checkSingleSearch('solution-id');
console.log('Status:', result.status);
console.log('Refunded:', result.refunded);

// Vérifier le remboursement
const isRefunded = await isSolutionRefunded('solution-id');
console.log('Is refunded:', isRefunded);
```

## 🚨 Alertes Recommandées

### 1. Taux de remboursement élevé (>20%)
```sql
-- À exécuter quotidiennement
SELECT 
  COUNT(*) FILTER (WHERE fast_search_refunded = true) * 100.0 / COUNT(*) as refund_rate
FROM solutions
WHERE fast_search_launched_at > NOW() - INTERVAL '24 hours'
HAVING COUNT(*) FILTER (WHERE fast_search_refunded = true) * 100.0 / COUNT(*) > 20;
```
**Action**: Investiguer le workflow N8n

### 2. Fast Searches bloquées (>15 minutes)
```sql
-- À exécuter toutes les 5 minutes
SELECT COUNT(*) FROM solutions
WHERE fast_search_launched_at IS NOT NULL
  AND fast_search_checked_at IS NULL
  AND fast_search_launched_at < NOW() - INTERVAL '15 minutes';
```
**Action**: Vérifier le cron job

### 3. Cron job inactif
```sql
-- Vérifier la dernière vérification
SELECT MAX(created_at) FROM fast_search_monitoring_logs WHERE check_type = 'auto_check';
```
**Action**: Redémarrer le cron job

## 📈 Métriques à Suivre

### KPIs Principaux
- **Taux de succès**: % de Fast Searches réussies
- **Taux de remboursement**: % de Fast Searches remboursées
- **Temps moyen de vérification**: Délai entre lancement et vérification
- **Fournisseurs moyens par recherche**: Qualité des résultats

### Dashboard Supabase
Créer des graphiques pour:
- Évolution du taux de remboursement (7 jours)
- Distribution des statuts (pie chart)
- Nombre de Fast Searches par jour (line chart)
- Top raisons de remboursement (bar chart)

## 🐛 Troubleshooting

### Problème: Les vérifications ne se lancent pas
**Causes possibles:**
1. Cron job non configuré ou arrêté
2. Edge Function fast-search-monitor non déployée
3. Permissions RLS manquantes

**Solution:**
```bash
# Vérifier le cron job
psql> SELECT * FROM cron.job WHERE jobname = 'fast-search-monitor';

# Tester manuellement
curl "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all"

# Vérifier les logs
supabase functions logs fast-search-monitor
```

### Problème: Remboursements non effectués
**Causes possibles:**
1. Fonction SQL `refund_fast_search` manquante
2. Permissions RLS sur table solutions
3. Erreur dans la logique de comptage

**Solution:**
```sql
-- Tester la fonction de remboursement
SELECT refund_fast_search('solution-id', 'test');

-- Vérifier les permissions
SELECT * FROM pg_policies WHERE tablename = 'solutions';

-- Forcer un remboursement manuel
UPDATE solutions 
SET fast_search_refunded = true, 
    fast_search_launched_at = null,
    fast_search_status = 'refunded'
WHERE id = 'solution-id';
```

### Problème: Quota non libéré après remboursement
**Cause:** `fast_search_launched_at` non réinitialisé

**Solution:**
```sql
-- Vérifier
SELECT id, fast_search_refunded, fast_search_launched_at 
FROM solutions 
WHERE fast_search_refunded = true 
  AND fast_search_launched_at IS NOT NULL;

-- Corriger
UPDATE solutions 
SET fast_search_launched_at = null 
WHERE fast_search_refunded = true 
  AND fast_search_launched_at IS NOT NULL;
```

## 🔄 Maintenance

### Hebdomadaire
- [ ] Vérifier le taux de remboursement
- [ ] Analyser les raisons de remboursement
- [ ] Vérifier que le cron job fonctionne

### Mensuel
- [ ] Nettoyer les logs anciens (>90 jours)
- [ ] Analyser les tendances
- [ ] Optimiser les seuils si nécessaire

### Nettoyage des logs
```sql
-- Supprimer les logs de plus de 90 jours
DELETE FROM fast_search_monitoring_logs 
WHERE created_at < NOW() - INTERVAL '90 days';
```

## 🆘 Support

### Logs à Consulter
1. **Supabase Edge Functions**: `supabase functions logs fast-search-monitor`
2. **Table de logs**: `SELECT * FROM fast_search_monitoring_logs ORDER BY created_at DESC`
3. **n8n Workflow**: Logs du workflow de monitoring

### Commandes Utiles
```bash
# Logs en temps réel
supabase functions logs fast-search-monitor --follow

# Test manuel
curl "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10"

# Vérifier une solution spécifique
curl "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_one&solution_id=SOLUTION_ID"
```

## 📝 Changelog

### Version 1.0.0 (2025-01-17)
- ✨ Système de monitoring automatique
- ✨ Remboursement automatique en cas d'échec
- ✨ Logging complet des événements
- ✨ Edge Function de monitoring
- ✨ Service frontend pour notifications
- 📚 Documentation complète

## 🔮 Améliorations Futures

### Court Terme
- [ ] Notifications email aux utilisateurs remboursés
- [ ] Dashboard admin pour visualiser les métriques
- [ ] Alertes Slack pour l'équipe

### Moyen Terme
- [ ] Retry automatique des Fast Searches échouées
- [ ] Analyse ML des patterns d'échec
- [ ] Optimisation dynamique du délai de vérification

### Long Terme
- [ ] Prédiction des échecs avant lancement
- [ ] A/B testing sur les paramètres de monitoring
- [ ] Intégration avec système de facturation

## 📄 Licence

Propriétaire - Hypsights V2

---

**Questions?** Consultez la [documentation complète](docs/FAST_SEARCH_MONITORING.md) ou contactez l'équipe technique.

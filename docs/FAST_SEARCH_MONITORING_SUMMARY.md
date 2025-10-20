# Fast Search Monitoring - Résumé Exécutif

## 🎯 Objectif

Surveiller automatiquement les Fast Searches et **rembourser le quota utilisateur** si :
- Le workflow N8n plante (pas de résultat après 10 minutes)
- Aucun fournisseur n'est trouvé

## 📊 Architecture en 3 Composants

### 1️⃣ Base de Données (Migration SQL)
```
Table solutions:
  ├─ fast_search_status         → 'pending', 'success', 'no_results', 'refunded'
  ├─ fast_search_launched_at    → Timestamp de lancement
  ├─ fast_search_checked_at     → Timestamp de vérification (10 min après)
  ├─ fast_search_refunded       → Boolean (quota remboursé?)
  └─ fast_search_refund_reason  → Raison du remboursement

Table fast_search_monitoring_logs:
  └─ Historique de toutes les vérifications et remboursements

Fonctions SQL:
  ├─ get_fast_searches_to_check()     → Liste des Fast Searches à vérifier
  ├─ count_suppliers_for_solution()   → Compte les fournisseurs trouvés
  └─ refund_fast_search()             → Rembourse le quota
```

### 2️⃣ Edge Functions

**fast-search-handler** (modifiée)
```typescript
Au lancement d'une Fast Search:
  1. Initialise fast_search_status = 'pending'
  2. Enregistre fast_search_launched_at = NOW()
  3. Appelle le webhook N8n
  4. Retourne success au frontend
```

**fast-search-monitor** (nouvelle)
```typescript
Appelée toutes les 5 minutes par un cron job:
  1. Récupère les Fast Searches lancées il y a >10 min
  2. Pour chaque Fast Search:
     - Compte les fournisseurs trouvés
     - Si 0 fournisseur → Rembourse automatiquement
     - Si >0 fournisseurs → Marque comme success
     - Met à jour le statut
     - Crée un log
```

### 3️⃣ Service Frontend

**fastSearchMonitorService.ts**
```typescript
Fonctions disponibles:
  ├─ checkAllPendingSearches()           → Vérifier toutes les Fast Searches
  ├─ checkSingleSearch(solutionId)       → Vérifier une Fast Search spécifique
  ├─ getUserMonitoringLogs(userId)       → Récupérer les logs utilisateur
  ├─ subscribeToFastSearchStatus()       → S'abonner aux changements en temps réel
  └─ isSolutionRefunded(solutionId)      → Vérifier si remboursée
```

## 🔄 Flux Complet

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER LANCE UNE FAST SEARCH                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ fast-search-handler                                              │
│ ├─ Initialise monitoring (status='pending')                     │
│ ├─ Enregistre launched_at = NOW()                               │
│ ├─ Appelle webhook N8n                                          │
│ └─ Retourne success                                             │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. WORKFLOW N8N RECHERCHE DES FOURNISSEURS                      │
│    (Processus asynchrone - peut prendre plusieurs minutes)      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. APRÈS 10 MINUTES - VÉRIFICATION AUTOMATIQUE                  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Cron Job (toutes les 5 min)                                     │
│ └─ Appelle fast-search-monitor                                  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ fast-search-monitor                                              │
│ ├─ Récupère Fast Searches lancées il y a >10 min               │
│ ├─ Compte les fournisseurs trouvés                             │
│ └─ Décide: Success ou Remboursement                            │
└─────────────────────────────────────────────────────────────────┘
                           ↓
         ┌─────────────────┴─────────────────┐
         ↓                                    ↓
┌──────────────────────┐          ┌──────────────────────┐
│ CAS 1: SUCCÈS        │          │ CAS 2: ÉCHEC         │
│ (>0 fournisseurs)    │          │ (0 fournisseur)      │
├──────────────────────┤          ├──────────────────────┤
│ ✓ Status = 'success' │          │ ✗ Status = 'refunded'│
│ ✓ Pas de remboursemt │          │ ✓ Remboursement auto │
│ ✓ Quota consommé     │          │ ✓ Quota libéré       │
│ ✓ Log créé           │          │ ✓ Log + raison       │
└──────────────────────┘          └──────────────────────┘
```

## 📋 Déploiement en 4 Étapes

### Étape 1: Migration SQL
```bash
supabase db push
# Ou via Dashboard: SQL Editor → Coller migration → Run
```

### Étape 2: Déployer Edge Functions
```bash
supabase functions deploy fast-search-monitor --project-ref lmqagaenmseopcctkrwv
supabase functions deploy fast-search-handler --project-ref lmqagaenmseopcctkrwv
```

### Étape 3: Configurer Cron Job
**Option A: n8n Workflow**
- Trigger: Schedule (5 minutes)
- HTTP Request: GET fast-search-monitor

**Option B: Supabase pg_cron**
```sql
SELECT cron.schedule('fast-search-monitor', '*/5 * * * *', $$
  SELECT net.http_get(url := 'https://.../fast-search-monitor?action=check_all&delay=10');
$$);
```

### Étape 4: Tester
```bash
# Test manuel
curl "https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/fast-search-monitor?action=check_all&delay=10"
```

## 🔍 Monitoring

### Requêtes SQL Utiles

**Taux de remboursement (dernières 24h)**
```sql
SELECT 
  COUNT(*) FILTER (WHERE fast_search_refunded = true) * 100.0 / COUNT(*) as refund_rate
FROM solutions
WHERE fast_search_launched_at > NOW() - INTERVAL '24 hours';
```

**Fast Searches en attente**
```sql
SELECT 
  id, title, 
  EXTRACT(EPOCH FROM (NOW() - fast_search_launched_at)) / 60 as minutes_elapsed
FROM solutions
WHERE fast_search_launched_at IS NOT NULL
  AND fast_search_checked_at IS NULL
  AND fast_search_refunded = false;
```

**Derniers remboursements**
```sql
SELECT * FROM fast_search_monitoring_logs
WHERE refunded = true
ORDER BY created_at DESC
LIMIT 10;
```

## ⚠️ Points d'Attention

### ✅ Avantages
- **Automatique** - Aucune intervention manuelle
- **Équitable** - Utilisateur remboursé si échec
- **Traçable** - Tous les événements loggés
- **Temps réel** - Vérification toutes les 5 minutes

### ⚠️ Limitations
- Délai de 10 minutes avant vérification (configurable)
- Nécessite un cron job actif
- Rembourse même si workflow N8n réussit mais sans résultat

### 🔧 Maintenance
- Surveiller le taux de remboursement (alerte si >20%)
- Vérifier que le cron job fonctionne
- Analyser les raisons de remboursement

## 📚 Documentation Complète

- **Guide technique détaillé**: `docs/FAST_SEARCH_MONITORING.md`
- **Guide de déploiement**: `docs/DEPLOYMENT_FAST_SEARCH_MONITORING.md`
- **Code source**:
  - Migration: `supabase/migrations/20250117000000_add_fast_search_monitoring.sql`
  - Edge Function: `supabase/functions/fast-search-monitor/index.ts`
  - Service Frontend: `src/services/fastSearchMonitorService.ts`

## 🆘 Support

**En cas de problème:**
1. Vérifier les logs Supabase: `supabase functions logs fast-search-monitor`
2. Vérifier la table: `SELECT * FROM fast_search_monitoring_logs ORDER BY created_at DESC`
3. Test manuel: `curl .../fast-search-monitor?action=check_all`
4. Consulter la documentation complète

---

**Résumé en une phrase:**  
*Système automatique qui vérifie toutes les Fast Searches après 10 minutes et rembourse le quota si aucun fournisseur n'est trouvé.*

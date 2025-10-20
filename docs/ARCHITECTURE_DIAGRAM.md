# Fast Search Monitoring - Architecture Visuelle

## 🏗️ Vue d'Ensemble du Système

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HYPSIGHTS V2 - FAST SEARCH                       │
│                         MONITORING & REFUND SYSTEM                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐         ┌──────────────────┐                     │
│  │  EnhancedChatView│         │  SolutionsPanel  │                     │
│  │                  │         │                  │                     │
│  │  - Launch Fast   │         │  - Display       │                     │
│  │    Search        │         │    Solutions     │                     │
│  │  - Show Status   │         │  - Show Quota    │                     │
│  └────────┬─────────┘         └────────┬─────────┘                     │
│           │                            │                                │
│           └────────────┬───────────────┘                                │
│                        │                                                │
│                        ↓                                                │
│           ┌────────────────────────┐                                   │
│           │ fastSearchMonitorService│                                   │
│           │                        │                                   │
│           │ - checkSingleSearch()  │                                   │
│           │ - getUserLogs()        │                                   │
│           │ - subscribeToStatus()  │                                   │
│           └────────────┬───────────┘                                   │
│                        │                                                │
└────────────────────────┼────────────────────────────────────────────────┘
                         │
                         │ HTTP/WebSocket
                         │
┌────────────────────────┼────────────────────────────────────────────────┐
│                        │         EDGE FUNCTIONS LAYER                   │
├────────────────────────┼────────────────────────────────────────────────┤
│                        │                                                │
│           ┌────────────▼───────────┐                                   │
│           │  fast-search-handler   │                                   │
│           │                        │                                   │
│           │  1. Authenticate user  │                                   │
│           │  2. Initialize monitor │                                   │
│           │  3. Call N8n webhook   │                                   │
│           │  4. Return success     │                                   │
│           └────────────┬───────────┘                                   │
│                        │                                                │
│                        │ Updates                                        │
│                        ↓                                                │
│           ┌────────────────────────┐                                   │
│           │  Database (Supabase)   │                                   │
│           │                        │                                   │
│           │  solutions table:      │                                   │
│           │  - fast_search_status  │                                   │
│           │  - launched_at         │                                   │
│           │  - checked_at          │                                   │
│           │  - refunded            │                                   │
│           └────────────┬───────────┘                                   │
│                        │                                                │
│                        │ Reads                                          │
│                        ↓                                                │
│           ┌────────────────────────┐                                   │
│           │ fast-search-monitor    │◄─────── Cron Job (5 min)         │
│           │                        │                                   │
│           │  1. Get pending checks │                                   │
│           │  2. Count suppliers    │                                   │
│           │  3. Decide action      │                                   │
│           │  4. Update status      │                                   │
│           │  5. Refund if needed   │                                   │
│           └────────────┬───────────┘                                   │
│                        │                                                │
└────────────────────────┼────────────────────────────────────────────────┘
                         │
                         │ Calls SQL Functions
                         │
┌────────────────────────┼────────────────────────────────────────────────┐
│                        │         DATABASE LAYER                         │
├────────────────────────┼────────────────────────────────────────────────┤
│                        │                                                │
│           ┌────────────▼───────────┐                                   │
│           │   PostgreSQL Functions │                                   │
│           │                        │                                   │
│           │  get_fast_searches_    │                                   │
│           │    to_check()          │                                   │
│           │                        │                                   │
│           │  count_suppliers_      │                                   │
│           │    for_solution()      │                                   │
│           │                        │                                   │
│           │  refund_fast_search()  │                                   │
│           └────────────┬───────────┘                                   │
│                        │                                                │
│                        │ Operates on                                    │
│                        ↓                                                │
│           ┌────────────────────────┐                                   │
│           │   Database Tables      │                                   │
│           │                        │                                   │
│           │  ┌──────────────────┐  │                                   │
│           │  │   solutions      │  │                                   │
│           │  │  - id            │  │                                   │
│           │  │  - status        │  │                                   │
│           │  │  - launched_at   │  │                                   │
│           │  │  - checked_at    │  │                                   │
│           │  │  - refunded      │  │                                   │
│           │  └──────────────────┘  │                                   │
│           │                        │                                   │
│           │  ┌──────────────────┐  │                                   │
│           │  │ monitoring_logs  │  │                                   │
│           │  │  - solution_id   │  │                                   │
│           │  │  - check_type    │  │                                   │
│           │  │  - status        │  │                                   │
│           │  │  - refunded      │  │                                   │
│           │  │  - details       │  │                                   │
│           │  └──────────────────┘  │                                   │
│           │                        │                                   │
│           │  ┌──────────────────┐  │                                   │
│           │  │ supplier_matches │  │                                   │
│           │  │  - solution_id   │  │                                   │
│           │  │  - supplier_id   │  │                                   │
│           │  └──────────────────┘  │                                   │
│           └────────────────────────┘                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐         ┌──────────────────┐                     │
│  │   N8n Workflow   │         │   Cron Service   │                     │
│  │                  │         │                  │                     │
│  │  - Search        │         │  - Trigger every │                     │
│  │    suppliers     │         │    5 minutes     │                     │
│  │  - Insert data   │         │  - Call monitor  │                     │
│  └──────────────────┘         └──────────────────┘                     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Données Détaillé

### 1. Lancement d'une Fast Search

```
User clicks "Fast Search"
    │
    ↓
EnhancedChatView.startFastSearch()
    │
    ↓
fastSearchService.startFastSearchFromSolution(briefId, solutionId)
    │
    ↓ HTTP POST
fast-search-handler Edge Function
    │
    ├─→ Authenticate user
    │
    ├─→ Initialize monitoring:
    │   UPDATE solutions SET
    │     fast_search_status = 'pending',
    │     fast_search_launched_at = NOW()
    │
    ├─→ Call N8n webhook
    │   POST https://n8n-hypsights.proxiwave.app/webhook/searchsupplier
    │
    └─→ Return { success: true, monitoring_enabled: true }
```

### 2. Monitoring Automatique (après 10 minutes)

```
Cron Job (every 5 minutes)
    │
    ↓ HTTP GET
fast-search-monitor Edge Function
    │
    ├─→ Call get_fast_searches_to_check(10)
    │   SELECT solutions WHERE
    │     launched_at < NOW() - 10 minutes
    │     AND checked_at IS NULL
    │
    ├─→ For each solution:
    │   │
    │   ├─→ Call count_suppliers_for_solution(solution_id)
    │   │   SELECT COUNT(*) FROM supplier_matches
    │   │   WHERE solution_id = ?
    │   │
    │   ├─→ IF suppliers_found > 0:
    │   │   │
    │   │   ├─→ UPDATE solutions SET
    │   │   │     fast_search_status = 'success',
    │   │   │     fast_search_checked_at = NOW()
    │   │   │
    │   │   └─→ INSERT INTO monitoring_logs
    │   │         (status='success', refunded=false)
    │   │
    │   └─→ ELSE (suppliers_found = 0):
    │       │
    │       ├─→ Call refund_fast_search(solution_id)
    │       │   │
    │       │   ├─→ UPDATE solutions SET
    │       │   │     fast_search_refunded = true,
    │       │   │     fast_search_launched_at = NULL,  ← Libère le quota
    │       │   │     fast_search_status = 'refunded'
    │       │   │
    │       │   └─→ INSERT INTO monitoring_logs
    │       │         (status='refunded', refunded=true)
    │       │
    │       └─→ Quota restored for user
    │
    └─→ Return { checked: N, results: [...] }
```

### 3. Notification Temps Réel

```
Database UPDATE on solutions.fast_search_status
    │
    ↓ Supabase Realtime
Frontend subscribeToFastSearchStatus()
    │
    ├─→ IF status = 'refunded':
    │   │
    │   └─→ Show notification:
    │         "Fast Search refunded - quota restored"
    │
    └─→ IF status = 'success':
        │
        └─→ Refresh supplier results
```

## 📊 États du Système

### Statuts d'une Fast Search

```
┌─────────────┐
│   INITIAL   │  fast_search_launched_at = NULL
└──────┬──────┘
       │ User launches Fast Search
       ↓
┌─────────────┐
│   PENDING   │  fast_search_status = 'pending'
│             │  fast_search_launched_at = NOW()
└──────┬──────┘
       │ Wait 10 minutes
       ↓
┌─────────────┐
│  CHECKING   │  Cron job triggers verification
└──────┬──────┘
       │
       ├─────────────────┬─────────────────┐
       ↓                 ↓                 ↓
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   SUCCESS   │   │ NO_RESULTS  │   │   TIMEOUT   │
│             │   │             │   │             │
│ >0 supplier │   │ 0 supplier  │   │ Error       │
│ No refund   │   │ REFUNDED    │   │ REFUNDED    │
└─────────────┘   └─────────────┘   └─────────────┘
```

### Cycle de Vie d'un Quota

```
User has 3 Fast Searches available
    │
    ↓ Launch Fast Search
User has 2 Fast Searches available
    │
    │ fast_search_launched_at = NOW()
    │ (Quota consumed)
    │
    ↓ Wait 10 minutes
Monitoring checks results
    │
    ├─────────────────┬─────────────────┐
    ↓                 ↓                 ↓
SUCCESS           NO_RESULTS        TIMEOUT
Quota stays       Quota refunded    Quota refunded
consumed          │                 │
                  ↓                 ↓
            fast_search_launched_at = NULL
            User has 3 Fast Searches available again
```

## 🔐 Sécurité et Permissions

### RLS Policies

```
┌─────────────────────────────────────────────────────────────┐
│                    TABLE: solutions                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Policy: user_access_solutions                              │
│  ├─ SELECT, UPDATE, DELETE                                  │
│  └─ WHERE user_id = auth.uid() OR role = 'admin'           │
│                                                              │
│  Policy: service_role_solutions                             │
│  ├─ ALL operations                                          │
│  └─ TO service_role                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              TABLE: fast_search_monitoring_logs              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Policy: users_view_own_logs                                │
│  ├─ SELECT                                                  │
│  └─ WHERE user_id = auth.uid()                              │
│                                                              │
│  Policy: service_role_full_access                           │
│  ├─ ALL operations                                          │
│  └─ TO service_role                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📈 Performance et Optimisation

### Indexes Créés

```sql
-- Index pour les requêtes de monitoring
CREATE INDEX idx_solutions_fast_search_monitoring 
ON solutions(fast_search_launched_at, fast_search_status, fast_search_checked_at)
WHERE fast_search_launched_at IS NOT NULL;

-- Index pour les logs
CREATE INDEX idx_fast_search_logs_solution 
ON fast_search_monitoring_logs(solution_id, created_at DESC);

CREATE INDEX idx_fast_search_logs_user 
ON fast_search_monitoring_logs(user_id, created_at DESC);
```

### Requêtes Optimisées

```
get_fast_searches_to_check()
    ↓
Uses: idx_solutions_fast_search_monitoring
    ↓
Filters: launched_at, checked_at, refunded
    ↓
Returns: Only solutions needing check
    ↓
Performance: O(log n) with index
```

## 🔍 Monitoring et Observabilité

### Logs Disponibles

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGGING LAYERS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Edge Function Logs (Supabase)                           │
│     ├─ fast-search-handler                                  │
│     │  └─ Initialization events                             │
│     └─ fast-search-monitor                                  │
│        └─ Check and refund events                           │
│                                                              │
│  2. Database Logs (monitoring_logs table)                   │
│     ├─ Every check recorded                                 │
│     ├─ Every refund recorded                                │
│     └─ Queryable with SQL                                   │
│                                                              │
│  3. Application Logs (Frontend)                             │
│     ├─ User actions                                         │
│     └─ Real-time updates                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Métriques Collectées

```
┌──────────────────────────────────────────────────────────────┐
│                    KEY METRICS                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Business Metrics:                                           │
│  ├─ Fast Search success rate                                │
│  ├─ Refund rate                                             │
│  ├─ Average suppliers per search                            │
│  └─ User satisfaction (indirect)                            │
│                                                               │
│  Technical Metrics:                                          │
│  ├─ Average check time                                      │
│  ├─ Cron job reliability                                    │
│  ├─ Database query performance                              │
│  └─ Edge Function response time                             │
│                                                               │
│  Operational Metrics:                                        │
│  ├─ Pending checks count                                    │
│  ├─ Stuck searches (>15 min)                                │
│  ├─ Daily refund volume                                     │
│  └─ Error rate                                              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

**Architecture Version:** 1.0.0  
**Last Updated:** 17 janvier 2025  
**Status:** ✅ Production Ready

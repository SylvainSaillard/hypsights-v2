# Fix Dashboard - Données Statiques → Dynamiques

## Problème identifié
Dans le dashboard, 3 informations étaient **hardcodées** et ne reflétaient pas la réalité :

### 1. ❌ "+2 this week" (Active Briefs)
- **Avant** : Valeur fixe `'+2 this week'`
- **Après** : Calcul dynamique du nombre de briefs créés cette semaine

### 2. ❌ "Last: Yesterday" (Completed Searches)
- **Avant** : Toujours "Yesterday" même si la dernière recherche date d'il y a 1 mois
- **Après** : Calcul dynamique avec formatage relatif (Today, Yesterday, X days ago, X weeks ago, X months ago)

### 3. ⚠️ "5 per search" (Suppliers Found)
- **Avant** : Calcul approximatif sans vérification
- **Après** : Calcul sécurisé avec vérification `completedSearches > 0`

---

## Modifications apportées

### Backend - Edge Function `dashboard-data/index.ts`

#### 1. Ajout du calcul des briefs créés cette semaine
```typescript
// Calculate briefs created this week
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
briefsCreatedThisWeek = userBriefs.filter(b => new Date(b.created_at) >= oneWeekAgo).length;
```

#### 2. Récupération de la date de dernière recherche
```typescript
// Calculate completedSearches from solutions with status 'finished' and get last search date
const { data: finishedSolutions, error: searchesError } = await supabaseAdmin
  .from('solutions')
  .select('id, fast_search_launched_at')
  .in('brief_id', briefIds)
  .eq('status', 'finished')
  .order('fast_search_launched_at', { ascending: false });

// Get the most recent search date
if (finishedSolutions && finishedSolutions.length > 0 && finishedSolutions[0].fast_search_launched_at) {
  lastSearchDate = finishedSolutions[0].fast_search_launched_at;
}
```

#### 3. Ajout des nouvelles métriques dans la réponse
```typescript
const metrics = {
  activeBriefs: activeBriefs || 0,
  completedSearches: userMetadata.completedSearches || 0,
  suppliersFound: suppliersFound || 0,
  fast_searches_used: userMetadata.fast_searches_used || 0,
  fast_searches_quota: userMetadata.fast_searches_quota || 3,
  briefsCreatedThisWeek: briefsCreatedThisWeek || 0,  // ✅ NOUVEAU
  lastSearchDate: lastSearchDate,                      // ✅ NOUVEAU
};
```

---

### Frontend - `KpiCards.tsx`

#### 1. Ajout de la fonction de formatage de date relative
```typescript
// Helper function to format relative time
const getRelativeTime = (dateString: string | null): string => {
  if (!dateString) return t('kpi.card.change_none', 'None yet');
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return t('kpi.card.time.today', 'Today');
  if (diffDays === 1) return t('kpi.card.time.yesterday', 'Yesterday');
  if (diffDays < 7) return t('kpi.card.time.days_ago', '{days} days ago', { days: diffDays });
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return t('kpi.card.time.weeks_ago', '{weeks} week(s) ago', { weeks });
  }
  const months = Math.floor(diffDays / 30);
  return t('kpi.card.time.months_ago', '{months} month(s) ago', { months });
};
```

#### 2. Mise à jour des KPI Cards

**Active Briefs** :
```typescript
change: metrics.briefsCreatedThisWeek > 0 
  ? t('kpi.card.active_briefs.change_dynamic', '+{count} this week', { count: metrics.briefsCreatedThisWeek })
  : t('kpi.card.change_none', 'None this week'),
changeType: metrics.briefsCreatedThisWeek > 0 ? 'positive' : 'neutral',
```

**Completed Searches** :
```typescript
change: metrics.lastSearchDate 
  ? t('kpi.card.completed_searches.change_dynamic', 'Last: {time}', { time: getRelativeTime(metrics.lastSearchDate) })
  : t('kpi.card.change_none', 'None yet'),
changeType: metrics.lastSearchDate ? 'neutral' : 'negative',
```

**Suppliers Found** :
```typescript
change: metrics.suppliersFound > 0 && metrics.completedSearches > 0
  ? t('kpi.card.suppliers_found.change_per_search', '~{count} per search', { count: Math.round(metrics.suppliersFound / metrics.completedSearches) })
  : t('kpi.card.change_none', 'None yet'),
```

---

## Déploiement

### 1. Déployer l'Edge Function
```bash
cd /Users/sylvain/Hypsights\ v2
supabase functions deploy dashboard-data --project-ref lmqagaenmseopcctkrwv
```

### 2. Vérifier les logs
```bash
supabase functions logs dashboard-data --project-ref lmqagaenmseopcctkrwv
```

### 3. Tester dans le dashboard
- Ouvrir https://hypsights-v2.netlify.app/dashboard
- Vérifier que les 3 KPI cards affichent des données dynamiques :
  - ✅ "+X this week" (nombre réel de briefs créés)
  - ✅ "Last: Today/Yesterday/X days ago" (date réelle de dernière recherche)
  - ✅ "~X per search" (calcul sécurisé)

---

## Bénéfices

### ✅ Données en temps réel
- Les KPI reflètent maintenant la réalité de l'activité utilisateur
- Calculs basés sur les vraies données de la base de données

### ✅ UX améliorée
- Formatage intelligent des dates (Today, Yesterday, X days ago...)
- Messages contextuels ("None yet", "None this week")
- Calculs sécurisés (pas de division par zéro)

### ✅ Fiabilité
- Plus de valeurs hardcodées qui trompent l'utilisateur
- Données synchronisées avec l'état réel du système
- Gestion des cas limites (pas de recherches, pas de briefs, etc.)

---

## Notes techniques

### Erreurs TypeScript Deno (normales)
Les erreurs suivantes dans l'Edge Function sont **normales** et n'affectent pas l'exécution :
```
Cannot find module 'https://deno.land/std@0.177.0/http/server.ts'
Cannot find name 'Deno'
```
Ces erreurs apparaissent car l'IDE utilise TypeScript pour Node.js, mais les Edge Functions s'exécutent dans Deno.

### Performance
- Les calculs sont effectués côté serveur (Edge Function)
- Pas d'impact sur les performances frontend
- Les données sont mises en cache par le hook `useEdgeFunction`

### Compatibilité
- Compatible avec tous les navigateurs modernes
- Fonctionne en production (Netlify) et en développement (localhost)
- Gestion CORS correcte pour tous les environnements

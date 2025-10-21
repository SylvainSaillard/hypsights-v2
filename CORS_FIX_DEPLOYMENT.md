# Fix CORS - www.hypsights.com

## Problème identifié

Votre site est accessible via **`https://www.hypsights.com`** mais les Edge Functions n'autorisaient que **`https://hypsights.com`** (sans le `www`).

### Erreur dans la console :
```
Access to fetch at 'https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/dashboard-data' 
from origin 'https://www.hypsights.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
The 'Access-Control-Allow-Origin' header has a value 'https://hypsights-v2.netlify.app' 
that is not equal to the supplied origin.
```

---

## Solution appliquée

Ajout de **`https://www.hypsights.com`** dans la liste `ALLOWED_ORIGINS` de **11 Edge Functions** :

### Fonctions modifiées :
1. ✅ `ai-chat-handler`
2. ✅ `brief-header-data`
3. ✅ `brief-operations`
4. ✅ `dashboard-data` (déjà fait manuellement)
5. ✅ `fast-search-handler`
6. ✅ `fast-search-monitor`
7. ✅ `i18n-handler`
8. ✅ `quota-manager`
9. ✅ `solution-handler`
10. ✅ `supplier-export`
11. ✅ `supplier-pdf-export`

### Modification apportée :
```typescript
const ALLOWED_ORIGINS = [
  'https://hypsights-v2.netlify.app',
  'https://hypsights.com',
  'https://www.hypsights.com',  // ✅ AJOUTÉ
  'https://hypsights-v2.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:52531'
];
```

---

## Déploiement

### Option 1 : Déployer toutes les fonctions en une fois
```bash
cd "/Users/sylvain/Hypsights v2"

# Déployer toutes les fonctions modifiées
supabase functions deploy ai-chat-handler --project-ref lmqagaenmseopcctkrwv
supabase functions deploy brief-header-data --project-ref lmqagaenmseopcctkrwv
supabase functions deploy brief-operations --project-ref lmqagaenmseopcctkrwv
supabase functions deploy dashboard-data --project-ref lmqagaenmseopcctkrwv
supabase functions deploy fast-search-handler --project-ref lmqagaenmseopcctkrwv
supabase functions deploy fast-search-monitor --project-ref lmqagaenmseopcctkrwv
supabase functions deploy i18n-handler --project-ref lmqagaenmseopcctkrwv
supabase functions deploy quota-manager --project-ref lmqagaenmseopcctkrwv
supabase functions deploy solution-handler --project-ref lmqagaenmseopcctkrwv
supabase functions deploy supplier-export --project-ref lmqagaenmseopcctkrwv
supabase functions deploy supplier-pdf-export --project-ref lmqagaenmseopcctkrwv
```

### Option 2 : Script de déploiement automatique
```bash
cd "/Users/sylvain/Hypsights v2"
chmod +x DEPLOY_ALL_CORS_FIXES.sh
./DEPLOY_ALL_CORS_FIXES.sh
```

### Option 3 : Via Supabase Dashboard
Si vous n'avez pas les permissions CLI, vous pouvez :
1. Aller sur https://supabase.com/dashboard/project/lmqagaenmseopcctkrwv
2. Aller dans **Edge Functions**
3. Pour chaque fonction, cliquer sur **Deploy new version**
4. Copier-coller le contenu du fichier `index.ts` modifié

---

## Vérification après déploiement

### 1. Tester le dashboard
```
https://www.hypsights.com/dashboard
```

### 2. Vérifier la console (F12)
- ✅ Plus d'erreur CORS
- ✅ Les KPI cards se chargent correctement
- ✅ Les données dynamiques s'affichent

### 3. Vérifier les logs Supabase
```bash
supabase functions logs dashboard-data --project-ref lmqagaenmseopcctkrwv
```

---

## Autres problèmes détectés dans les logs

### 1. ⚠️ Multiple GoTrueClient instances
```
Multiple GoTrueClient instances detected in the same browser context.
```

**Cause** : Plusieurs instances de Supabase client créées dans l'application.

**Solution** : Vérifier que `supabaseClient.ts` utilise bien un singleton :
```typescript
// src/lib/supabaseClient.ts
let supabaseInstance: SupabaseClient | null = null;

export const supabase = supabaseInstance || createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

supabaseInstance = supabase;
```

### 2. ⚠️ DashboardOverviewPage re-renders excessifs
```
DashboardOverviewPage: Current locale: en, will call t('dashboard.title') directly in JSX.
(répété 20+ fois)
```

**Cause** : Boucle de re-render dans le composant Dashboard.

**Solution** : Vérifier les dépendances des `useEffect` et `useState` dans `DashboardOverviewPage.tsx`.

---

## Impact business

### Avant le fix :
- ❌ Dashboard inaccessible sur www.hypsights.com
- ❌ Erreurs CORS bloquant toutes les requêtes API
- ❌ Utilisateurs ne peuvent pas voir leurs KPIs
- ❌ Impossible de créer/gérer des briefs

### Après le fix :
- ✅ Dashboard fonctionnel sur www.hypsights.com
- ✅ Toutes les Edge Functions accessibles
- ✅ KPIs dynamiques affichés correctement
- ✅ Expérience utilisateur fluide

---

## Notes techniques

### Pourquoi ce problème ?
Le domaine `www.hypsights.com` et `hypsights.com` sont techniquement **deux origines différentes** pour le navigateur. CORS nécessite que l'origine exacte soit autorisée.

### Redirection recommandée
Pour éviter ce genre de problème à l'avenir, configurez une redirection automatique :
- **Option A** : `www.hypsights.com` → `hypsights.com` (recommandé)
- **Option B** : `hypsights.com` → `www.hypsights.com`

Cela peut être configuré dans :
- Netlify (Settings > Domain management > Domain redirects)
- DNS provider (CNAME ou A record)
- Cloudflare (Page Rules)

---

## Checklist de déploiement

- [x] Modifier les 11 Edge Functions (✅ fait via script)
- [ ] Déployer les Edge Functions sur Supabase
- [ ] Tester sur https://www.hypsights.com/dashboard
- [ ] Vérifier les logs Supabase
- [ ] Confirmer que les KPIs dynamiques s'affichent
- [ ] Configurer une redirection www → non-www (optionnel mais recommandé)

---

## Support

Si le déploiement échoue avec une erreur de permissions :
1. Vérifier que vous êtes connecté : `supabase login`
2. Vérifier votre access token dans le dashboard Supabase
3. Ou déployer manuellement via le dashboard Supabase

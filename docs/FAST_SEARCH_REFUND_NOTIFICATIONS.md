# Fast Search Refund Notifications - Documentation

## Vue d'ensemble

Système de notifications en temps réel qui informe l'utilisateur lorsqu'un crédit Fast Search est automatiquement restauré suite à un échec de recherche.

## Fonctionnalités

### ✅ Notification Positive
- Message tourné vers la solution, pas l'erreur
- Ton informatif et rassurant
- Design moderne avec dégradés bleu/indigo

### 🌍 Multilingue (FR/EN)
- Détection automatique de la langue utilisateur
- Messages adaptés selon la raison du remboursement
- Support complet français et anglais

### ⏱️ Temps Réel
- Écoute des changements via Supabase Realtime
- Notification instantanée lors du remboursement
- Auto-fermeture après 10 secondes

## Architecture

### 1. Composant de Notification
**Fichier:** `src/components/notifications/FastSearchRefundNotification.tsx`

**Props:**
- `solutionTitle`: Nom de la solution concernée
- `reason`: Raison du remboursement
- `locale`: Langue de l'utilisateur ('en' | 'fr')
- `onClose`: Callback de fermeture

**Fonctionnalités:**
- Animation d'entrée fluide
- Barre de progression pour l'auto-fermeture
- Bouton de fermeture manuelle
- Messages contextuels selon la raison

### 2. Hook de Gestion
**Fichier:** `src/hooks/useFastSearchRefundNotifications.ts`

**Fonctionnalités:**
- Écoute des changements de statut `fast_search_refunded`
- Création automatique des notifications
- Gestion de la pile de notifications
- Nettoyage automatique après 11 secondes

**Usage:**
```typescript
const { notifications, removeNotification } = useFastSearchRefundNotifications(briefId, userId);
```

### 3. Intégration
**Fichier:** `src/components/chat/EnhancedChatView.tsx`

Le composant principal intègre:
- Le hook de notifications
- L'affichage des notifications en position fixe (top-right)
- La récupération de la locale utilisateur

## Messages Multilingues

### Anglais (EN)
- **Titre:** "Fast Search Credit Restored"
- **Aucun résultat:** "No suppliers were found for this search"
- **Problème workflow:** "The search could not be completed"
- **Générique:** "The search did not return results"
- **Crédit:** "Your Fast Search credit has been automatically restored"

### Français (FR)
- **Titre:** "Crédit Fast Search Restauré"
- **Aucun résultat:** "Aucun fournisseur n'a été trouvé pour cette recherche"
- **Problème workflow:** "La recherche n'a pas pu être complétée"
- **Générique:** "La recherche n'a pas retourné de résultats"
- **Crédit:** "Votre crédit Fast Search a été automatiquement restauré"

## Flux de Fonctionnement

```
1. Fast Search lancée
   ↓
2. Workflow N8n s'exécute (ou échoue)
   ↓
3. Après 10 minutes: Cron job vérifie
   ↓
4. Si 0 fournisseur: Remboursement automatique
   - fast_search_refunded = true
   - fast_search_launched_at = null
   - fast_search_refund_reason = "..."
   ↓
5. Supabase Realtime détecte le changement
   ↓
6. Hook useFastSearchRefundNotifications reçoit l'événement
   ↓
7. Notification créée et affichée
   ↓
8. Auto-fermeture après 10 secondes
```

## Raisons de Remboursement

Le système détecte automatiquement la raison et affiche le message approprié:

### "No suppliers found"
**Détection:** `reason.includes('No suppliers found')`  
**Message:** Aucun fournisseur trouvé pour cette recherche

### "workflow" ou "failed"
**Détection:** `reason.includes('workflow') || reason.includes('failed')`  
**Message:** La recherche n'a pas pu être complétée

### Autre
**Message générique:** La recherche n'a pas retourné de résultats

## Design UX

### Positionnement
- Position fixe en haut à droite (`fixed top-4 right-4`)
- Z-index élevé (`z-50`) pour être au-dessus de tout
- Animation de glissement depuis la droite

### Couleurs
- **Header:** Dégradé bleu → indigo (`from-blue-500 to-indigo-500`)
- **Crédit restauré:** Fond vert clair avec bordure verte
- **Texte:** Hiérarchie claire (titre en gras, détails en gris)

### Animations
- **Entrée:** Slide-in depuis la droite (300ms)
- **Sortie:** Slide-out vers la droite (300ms)
- **Barre de progression:** Transition linéaire de 10 secondes

## Tests

### Test Manuel

1. **Lancer une Fast Search** sur une solution
2. **Attendre 10 minutes** (ou modifier le délai du cron job pour test)
3. **Vérifier** qu'aucun fournisseur n'est trouvé
4. **Observer** la notification apparaître automatiquement

### Test avec SQL

Pour simuler un remboursement instantané:

```sql
-- Trouver une solution avec Fast Search lancée
SELECT id, title, fast_search_refunded 
FROM solutions 
WHERE fast_search_launched_at IS NOT NULL 
  AND fast_search_refunded = false 
LIMIT 1;

-- Simuler le remboursement
UPDATE solutions
SET 
  fast_search_refunded = true,
  fast_search_refund_reason = 'Test: No suppliers found after 10 minutes',
  fast_search_launched_at = null
WHERE id = 'SOLUTION_ID_FROM_ABOVE';

-- La notification devrait apparaître immédiatement dans l'interface
```

## Dépendances

### Packages
- `lucide-react` - Icônes (RefreshCw, X, Info)
- `@supabase/supabase-js` - Realtime subscriptions

### Tables Supabase
- `solutions` - Colonnes de monitoring Fast Search
- `users_metadata` - Langue préférée de l'utilisateur

### Edge Functions
- `fast-search-monitor` - Système de vérification et remboursement

## Améliorations Futures

### Court Terme
- [ ] Ajouter un son de notification (optionnel)
- [ ] Permettre de "snooze" les notifications
- [ ] Historique des notifications dans un panneau dédié

### Moyen Terme
- [ ] Notifications email en plus des notifications in-app
- [ ] Personnalisation du délai d'auto-fermeture
- [ ] Statistiques sur les remboursements par utilisateur

### Long Terme
- [ ] Notifications push (PWA)
- [ ] Centre de notifications global
- [ ] Préférences de notification par type

## Troubleshooting

### La notification n'apparaît pas

**Causes possibles:**
1. Supabase Realtime non configuré
2. Permissions RLS sur la table `solutions`
3. User ID ou Brief ID null

**Solution:**
```typescript
// Vérifier les logs du hook
console.log('[useFastSearchRefundNotifications] Setting up listener for brief:', briefId);
console.log('[useFastSearchRefundNotifications] Subscription status:', status);
```

### La notification reste affichée trop longtemps

**Cause:** Timer d'auto-fermeture non déclenché

**Solution:**
Vérifier que le composant n'est pas remonté pendant l'affichage de la notification.

### Messages en mauvaise langue

**Cause:** Locale utilisateur non récupérée ou incorrecte

**Solution:**
```sql
-- Vérifier la locale dans users_metadata
SELECT user_id, preferred_locale 
FROM users_metadata 
WHERE user_id = 'USER_ID';

-- Mettre à jour si nécessaire
UPDATE users_metadata 
SET preferred_locale = 'fr' 
WHERE user_id = 'USER_ID';
```

## Support

Pour toute question ou problème:
1. Vérifier les logs du navigateur (console)
2. Vérifier les logs Supabase Realtime
3. Consulter la table `fast_search_monitoring_logs`
4. Tester avec la requête SQL de simulation ci-dessus

---

**Version:** 1.0.0  
**Date:** 21 octobre 2025  
**Statut:** ✅ Production Ready

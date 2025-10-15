# Configuration Webhook Beta Feedback

## Vue d'ensemble

Lorsqu'un utilisateur atteint son quota Fast Search et clique sur "Participer à l'échange" dans la modal, un webhook Make.com est déclenché pour notifier l'équipe Hypsights.

## Webhook URL

```
https://hook.eu1.make.com/3hstttc3isy4a4koz5p6i3fejpdnaj8e
```

## Méthode HTTP

**POST** avec `Content-Type: application/json`

## Données envoyées

### Structure JSON complète

```json
{
  "type": "beta_feedback_request",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "phone": "+33 1 23 45 67 89",
  "message": "Message optionnel de l'utilisateur avec son feedback",
  "timestamp": "2025-01-15T12:38:00.000Z",
  "userId": "uuid-de-l-utilisateur",
  "userCreatedAt": "2025-01-01T10:00:00.000Z",
  "userMetadata": {
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "locale": "fr",
    // Autres métadonnées utilisateur
  },
  "source": "fast_search_quota_modal",
  "quotaReached": true
}
```

### Champs détaillés

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `type` | string | ✅ | Type de requête : `"beta_feedback_request"` |
| `userEmail` | string | ✅ | Email de l'utilisateur (identifiant principal) |
| `userName` | string | ✅ | Nom complet de l'utilisateur |
| `phone` | string | ✅ | Numéro de téléphone renseigné dans la modal |
| `message` | string | ❌ | Message optionnel de l'utilisateur |
| `timestamp` | string (ISO) | ✅ | Date/heure de la soumission |
| `userId` | string (UUID) | ✅ | ID unique de l'utilisateur dans Supabase |
| `userCreatedAt` | string (ISO) | ✅ | Date de création du compte utilisateur |
| `userMetadata` | object | ❌ | Métadonnées additionnelles de l'utilisateur |
| `source` | string | ✅ | Source de la requête : `"fast_search_quota_modal"` |
| `quotaReached` | boolean | ✅ | Indique que le quota Fast Search est atteint |

## Informations utilisateur disponibles

### Informations essentielles
- ✅ **Email** : Identifiant principal pour contacter l'utilisateur
- ✅ **Nom** : Nom complet pour personnaliser le contact
- ✅ **Téléphone** : Numéro pour appel direct
- ✅ **Message** : Feedback initial de l'utilisateur (optionnel)

### Contexte utilisateur
- ✅ **User ID** : Pour retrouver l'utilisateur dans la base de données
- ✅ **Date de création** : Pour savoir depuis quand l'utilisateur utilise Hypsights
- ✅ **Métadonnées** : Informations supplémentaires (locale, avatar, etc.)

### Contexte de la requête
- ✅ **Type** : `beta_feedback_request` pour identifier le type de demande
- ✅ **Source** : `fast_search_quota_modal` pour tracer l'origine
- ✅ **Quota atteint** : `true` pour confirmer que l'utilisateur a épuisé son quota
- ✅ **Timestamp** : Date/heure exacte de la soumission

## Exemple de payload réel

```json
{
  "type": "beta_feedback_request",
  "userEmail": "patrick@hypsights.com",
  "userName": "Patrick Ferran",
  "phone": "+33 6 12 34 56 78",
  "message": "J'aimerais discuter de l'amélioration de la recherche de fournisseurs dans le secteur de l'énergie.",
  "timestamp": "2025-01-15T12:38:45.123Z",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userCreatedAt": "2025-01-10T09:15:30.000Z",
  "userMetadata": {
    "full_name": "Patrick Ferran",
    "locale": "fr",
    "company": "Hypsights"
  },
  "source": "fast_search_quota_modal",
  "quotaReached": true
}
```

## Traitement recommandé dans Make.com

### 1. Notification immédiate
- Envoyer un email à l'équipe Hypsights
- Créer une notification Slack/Teams
- Ajouter une tâche dans le CRM

### 2. Informations à inclure dans la notification

**Sujet** : 🎯 Nouvelle demande de feedback bêta - [Nom utilisateur]

**Corps** :
```
Nouvel utilisateur ayant atteint son quota Fast Search et souhaitant partager son feedback :

👤 Utilisateur :
- Nom : [userName]
- Email : [userEmail]
- Téléphone : [phone]
- Membre depuis : [userCreatedAt]

💬 Message :
[message]

📊 Contexte :
- Quota Fast Search atteint : Oui
- Date de la demande : [timestamp]
- User ID : [userId]

🎯 Action requise :
Contacter l'utilisateur sous 24h pour un échange informel (15 min max) sur son expérience Hypsights.

Questions à poser :
- Comment avez-vous utilisé les Fast Searches ?
- Qu'est-ce qui vous a le plus aidé ?
- Quelles difficultés avez-vous rencontrées ?
- Quelles fonctionnalités aimeriez-vous voir ajoutées ?
```

### 3. Enrichissement des données (optionnel)
- Récupérer l'historique des briefs de l'utilisateur
- Compter le nombre de Fast Searches utilisées
- Identifier les secteurs/géographies recherchés
- Calculer le taux d'engagement

### 4. Suivi
- Marquer la demande comme "En attente de contact"
- Définir un rappel à 24h si pas de contact
- Logger la conversation après l'échange
- Mettre à jour le statut utilisateur

## Gestion des erreurs

### Côté frontend (FastSearchQuotaModal.tsx)

```typescript
try {
  const response = await fetch(webhookUrl, { ... });
  
  if (response.ok) {
    // Succès : Afficher message de confirmation
    alert(t('fastSearchQuota.modal.success'));
    onSuccess?.();
    onClose();
  } else {
    // Erreur HTTP : Afficher message d'erreur
    alert(t('fastSearchQuota.modal.error'));
  }
} catch (error) {
  // Erreur réseau : Afficher message d'erreur
  console.error('Error sending feedback request:', error);
  alert(t('fastSearchQuota.modal.error'));
}
```

### Côté Make.com

Recommandations :
- ✅ Configurer un retry automatique en cas d'échec
- ✅ Logger toutes les requêtes reçues
- ✅ Envoyer une alerte si le webhook échoue
- ✅ Avoir un fallback (email de secours) en cas de problème

## Sécurité

### Validation des données
- ✅ Vérifier que `userEmail` est un email valide
- ✅ Vérifier que `phone` est renseigné
- ✅ Vérifier que `type` est bien `"beta_feedback_request"`
- ✅ Vérifier que `timestamp` est récent (< 5 min)

### Protection contre le spam
- ✅ Limiter à 1 requête par utilisateur par jour
- ✅ Vérifier que l'utilisateur existe dans Supabase
- ✅ Vérifier que le quota est bien atteint

### Données sensibles
- ⚠️ Le webhook contient des données personnelles (email, téléphone, nom)
- ⚠️ Assurer que Make.com est configuré en mode sécurisé
- ⚠️ Ne pas logger les données sensibles en clair
- ⚠️ Respecter le RGPD pour le stockage et traitement des données

## Tests

### Test manuel
1. Se connecter à Hypsights
2. Utiliser 3 Fast Searches pour atteindre le quota
3. Ouvrir la modal automatiquement
4. Remplir le formulaire avec :
   - Téléphone : +33 6 12 34 56 78
   - Message : "Test webhook beta feedback"
5. Cliquer sur "Participer à l'échange"
6. Vérifier que le webhook Make.com reçoit les données

### Vérification Make.com
1. Ouvrir le scénario Make.com
2. Vérifier l'historique des exécutions
3. Confirmer que les données sont complètes
4. Vérifier que les notifications sont envoyées

### Test de charge
- Simuler plusieurs soumissions simultanées
- Vérifier que Make.com gère la charge
- Confirmer que les notifications ne sont pas dupliquées

## Monitoring

### Métriques à suivre
- Nombre de requêtes de feedback par jour/semaine
- Taux de succès du webhook (%)
- Temps de réponse moyen
- Taux de conversion (feedback → échange réalisé)

### Alertes à configurer
- ⚠️ Webhook en échec > 5 fois en 1h
- ⚠️ Aucune requête reçue depuis 7 jours
- ⚠️ Temps de réponse > 5 secondes
- ⚠️ Taux d'erreur > 10%

## Changelog

### 2025-01-15
- ✅ Changement de webhook URL vers le nouveau endpoint
- ✅ Changement de type : `fast_search_quota_request` → `beta_feedback_request`
- ✅ Ajout de `userId`, `userCreatedAt`, `userMetadata`
- ✅ Ajout de `source` et `quotaReached` pour le contexte
- ✅ Mise à jour des messages de succès/erreur

### Ancien webhook (deprecated)
```
https://hook.eu1.make.com/sg1brkl4b6fzl82te1k3q3n6x8nt8wvh
```
Type : `fast_search_quota_request` (offre Fast Search)

### Nouveau webhook (actif)
```
https://hook.eu1.make.com/3hstttc3isy4a4koz5p6i3fejpdnaj8e
```
Type : `beta_feedback_request` (demande de feedback bêta)

## Résumé

✅ **Webhook URL** : `https://hook.eu1.make.com/3hstttc3isy4a4koz5p6i3fejpdnaj8e`  
✅ **Type** : `beta_feedback_request`  
✅ **Données envoyées** : Email, nom, téléphone, message, userId, métadonnées, contexte  
✅ **Objectif** : Notifier l'équipe pour organiser un échange de feedback bêta  
✅ **Délai de contact** : 24h maximum  
✅ **Durée de l'échange** : 15 min max (informel)  

Le webhook est maintenant configuré pour supporter l'approche de feedback bêta ! 🎉

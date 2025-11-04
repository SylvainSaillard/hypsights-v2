# Analyse des Erreurs Fast Search - N8n Workflow

## Résumé des Erreurs

Lors de l'exécution du workflow N8n pour la création des cartes fournisseurs, trois types d'erreurs sont rencontrés.

## Erreur 1: Clé Dupliquée

### Message
duplicate key value violates unique constraint supplier_match_profiles_supplier_id_brief_id_key

### Cause
La table supplier_match_profiles a une contrainte unique sur (supplier_id, brief_id). Un même fournisseur ne peut pas avoir plusieurs profils pour le même brief.

### Solution Recommandée: UPSERT
Utiliser ON CONFLICT pour mettre à jour au lieu d'insérer.

## Erreur 2: Contrainte Check

### Message
new row violates check constraint supplier_match_profiles_geography_score_check

### Cause
La colonne geography_score a une contrainte qui limite les valeurs acceptables (probablement 0, 1, ou 2).

### Solution
Valider les données dans N8n avant insertion avec des valeurs par défaut si nécessaire.

## Erreur 3: Type de Données

### Message
invalid input syntax for type integer: 76.95

### Cause
Le workflow envoie une valeur décimale pour un champ INTEGER.

### Solution
Convertir les scores en entiers dans N8n avant insertion.

# Section "Analyse Détaillée" Interactive avec Transparence

## Résumé
Évolution majeure de l'affichage des scores avec résumé IA permanent, accordéons interactifs et pop-up de transparence.

## Modifications

### 1. Types TypeScript
- Ajout de `scoring_reasoning?: string` dans `SupplierGroup.scores`

### 2. Hook useSupplierGroups
- Mapping de `scoring_reasoning` depuis l'API

### 3. Nouveau Composant: ScoringTransparencyModal
Modal pour afficher la transparence du calcul du score global.

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `scoringReasoning?: string`
- `title?: string`

### 4. StarRating avec Accordéon
Ajout d'un système d'accordéon "En savoir plus" / "Masquer":
- Animation fluide (300ms)
- Icônes ChevronDown/ChevronUp
- Props: `learnMoreLabel`, `hideLabel`

### 5. SupplierCard
- **Résumé IA permanent**: Affichage de `ai_explanation` (match_explanation) juste sous le titre, en italique
- Icône `?` (HelpCircle) dans le header "Analyse Détaillée"
- Ouvre la modal de transparence au clic
- Labels i18n pour tous les composants StarRating

## Clés de Traduction

| Clé | Français | Anglais |
|-----|----------|---------|
| `supplier.scoring_transparency` | Transparence du Score | Scoring Transparency |
| `supplier.learn_more` | En savoir plus | Learn more |
| `supplier.hide` | Masquer | Hide |

## Données Backend Requises

| Champ | Type | Destination | Description |
|-------|------|-------------|-------------|
| `match_explanation` | `string` | Résumé permanent | Résumé général de l'analyse IA (visible en permanence) |
| `scoring_reasoning` | `string` | Pop-up `?` | Formule de calcul (ex: "sE = 72% * 85% * 0.66 = 40%") |
| `score_produit_brief_explanation` | `string` | Accordéon 1 | Détail "Adéquation Produit" |
| `score_fiabilite_explanation` | `string` | Accordéon 2 | Détail "Fiabilité Entreprise" |
| `score_criteres_explanation` | `string` | Accordéon 3 | Détail "Critères Stricts" |

## Fichiers Modifiés

- ✅ `src/types/supplierTypes.ts`
- ✅ `src/hooks/useSupplierGroups.ts`
- ✅ `src/components/suppliers/ScoringTransparencyModal.tsx` (nouveau)
- ✅ `src/components/suppliers/StarRating.tsx`
- ✅ `src/components/suppliers/SupplierCard.tsx`

**Date**: 27 octobre 2025
**Statut**: ✅ Implémentation complète

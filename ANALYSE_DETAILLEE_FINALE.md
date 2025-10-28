# Section "Analyse Détaillée" - Structure Finale

## 📋 Vue d'Ensemble

La section "Analyse Détaillée" combine maintenant:
1. **Un résumé IA permanent** (toujours visible)
2. **Une pop-up de transparence** (calcul du score)
3. **Trois accordéons interactifs** (détails des scores)

---

## 🎯 Structure Visuelle

```
┌─────────────────────────────────────────────────────────┐
│ Analyse Détaillée                               [?]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ✨ AI Hypsights Analysis                                │
│                                                         │
│ "Ce fournisseur correspond bien à vos besoins grâce    │
│  à sa gamme de produits et son expertise..."           │
│ (résumé IA en italique - toujours visible)             │
│─────────────────────────────────────────────────────────│
│                                                         │
│  Adéquation Produit                    ⭐⭐⭐⭐☆        │
│  ▼ En savoir plus                                       │
│                                                         │
│  Fiabilité Entreprise                  ⭐⭐⭐⭐⭐        │
│  ▼ En savoir plus                                       │
│                                                         │
│  Critères Stricts                      ⭐⭐⭐           │
│  ▼ En savoir plus                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Mapping des 5 Champs API

### Champ 1: `match_explanation`
**Destination**: Résumé IA permanent  
**Affichage**: Juste sous le titre "Analyse Détaillée"  
**Style**: Texte en italique, toujours visible  
**Exemple**: "TE Connectivity est un excellent match grâce à sa gamme complète de capteurs MEMS et son expertise dans l'industrie automobile."

### Champ 2: `scoring_reasoning`
**Destination**: Pop-up de transparence (icône `?`)  
**Affichage**: Modal qui s'ouvre au clic sur l'icône  
**Style**: Bloc bleu avec bordure gauche  
**Exemple**: "sE = 72% * 85% * 0.66 = 40%"

### Champ 3: `score_produit_brief_explanation`
**Destination**: Accordéon "Adéquation Produit"  
**Affichage**: Se déploie au clic sur "En savoir plus"  
**Style**: Bloc bleu avec bordure gauche indigo  
**Exemple**: "Les capteurs MEMS de TE Connectivity répondent parfaitement aux spécifications techniques du brief..."

### Champ 4: `score_fiabilite_explanation`
**Destination**: Accordéon "Fiabilité Entreprise"  
**Affichage**: Se déploie au clic sur "En savoir plus"  
**Style**: Bloc bleu avec bordure gauche indigo  
**Exemple**: "En tant que grande entreprise établie depuis 1941, TE Connectivity inspire confiance..."

### Champ 5: `score_criteres_explanation`
**Destination**: Accordéon "Critères Stricts"  
**Affichage**: Se déploie au clic sur "En savoir plus"  
**Style**: Bloc bleu avec bordure gauche indigo  
**Exemple**: "L'entreprise remplit tous les critères demandés: localisation aux USA, grande entreprise..."

---

## 🎨 Détails d'Implémentation

### Résumé IA Permanent
```tsx
{ai_explanation && (
  <div className="mb-4 pb-4 border-b border-gray-300">
    {/* Badge AI Hypsights Analysis */}
    <div className="flex items-center gap-2 mb-3">
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-full px-3 py-1">
        <Sparkles size={14} className="text-purple-600" />
        <span className="text-xs font-semibold text-purple-700">
          AI Hypsights Analysis
        </span>
      </div>
    </div>
    
    {/* Texte de l'analyse */}
    <p className="text-sm text-gray-700 italic leading-relaxed">
      {ai_explanation}
    </p>
  </div>
)}
```

**Caractéristiques:**
- **Badge "AI Hypsights Analysis"** avec icône Sparkles ✨
- Gradient purple/indigo pour le badge
- Texte en italique (`italic`)
- Séparateur en bas (`border-b`)
- Espacement généreux (`mb-4 pb-4`)
- Toujours visible (pas d'accordéon)

### Icône de Transparence
```tsx
{scores.scoring_reasoning && (
  <button
    onClick={() => setIsTransparencyModalOpen(true)}
    className="p-1.5 hover:bg-indigo-100 rounded-full transition-colors group"
    title={t('supplier.scoring_transparency', 'Transparence du Score')}
  >
    <HelpCircle size={18} className="text-indigo-600 group-hover:text-indigo-800" />
  </button>
)}
```

**Comportement:**
- Visible uniquement si `scoring_reasoning` existe
- Hover effect: fond indigo clair
- Tooltip au survol
- Ouvre la modal au clic

### Accordéons Interactifs
```tsx
<StarRating 
  score={scores.score_produit_brief} 
  maxStars={5} 
  label={t('supplier.product_fit', 'Adéquation Produit')}
  explanation={scores.score_produit_brief_explanation}
  learnMoreLabel={t('supplier.learn_more', 'En savoir plus')}
  hideLabel={t('supplier.hide', 'Masquer')}
/>
```

**Fonctionnement:**
- État fermé par défaut
- Animation fluide (300ms)
- Icônes chevron (▼/▲)
- Labels traduits

---

## 🌍 Multilinguisme

Toutes les chaînes de caractères utilisent le système i18n:

| Clé | Français | Anglais |
|-----|----------|---------|
| `supplier.detailed_analysis` | Analyse Détaillée | Detailed Analysis |
| `supplier.scoring_transparency` | Transparence du Score | Scoring Transparency |
| `supplier.scoring_explanation` | Cette formule explique comment le score global est calculé à partir des différents critères d'évaluation. | This formula explains how the overall score is calculated from the different evaluation criteria. |
| `supplier.no_transparency_info` | Aucune information de transparence disponible pour ce fournisseur. | No transparency information available for this supplier. |
| `supplier.product_fit` | Adéquation Produit | Product Fit |
| `supplier.company_reliability` | Fiabilité Entreprise | Company Reliability |
| `supplier.strict_criteria` | Critères Stricts | Strict Criteria |
| `supplier.learn_more` | En savoir plus | Learn more |
| `supplier.hide` | Masquer | Hide |
| `common.close` | Fermer | Close |

---

## ✅ Checklist Backend

Pour que l'interface fonctionne complètement, le backend doit fournir via `supplier_match_profile`:

- [x] `match_explanation` - Résumé général (déjà mappé via `ai_explanation`)
- [ ] `scoring_reasoning` - Formule de calcul
- [ ] `score_produit_brief_explanation` - Détail produit
- [ ] `score_fiabilite_explanation` - Détail fiabilité
- [ ] `score_criteres_explanation` - Détail critères

---

## 📦 Fichiers Modifiés

- ✅ `src/types/supplierTypes.ts` - Types avec `scoring_reasoning`
- ✅ `src/hooks/useSupplierGroups.ts` - Mapping des champs
- ✅ `src/components/suppliers/ScoringTransparencyModal.tsx` - Modal de transparence
- ✅ `src/components/suppliers/StarRating.tsx` - Accordéons interactifs
- ✅ `src/components/suppliers/SupplierCard.tsx` - Intégration complète

---

**Date**: 27 octobre 2025  
**Statut**: ✅ Implémentation frontend complète  
**Version**: 2.0 - Avec résumé IA permanent

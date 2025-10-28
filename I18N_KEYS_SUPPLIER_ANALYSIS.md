# Clés de Traduction - Section Analyse Détaillée

## 📋 Clés à Ajouter dans la Base de Données i18n

Voici toutes les clés de traduction nécessaires pour la section "Analyse Détaillée" des cartes fournisseurs.

---

## 🔑 Liste Complète des Clés

### Section Principale

| Clé | Français (FR) | Anglais (EN) |
|-----|---------------|--------------|
| `supplier.detailed_analysis` | Analyse Détaillée | Detailed Analysis |

### Modal de Transparence

| Clé | Français (FR) | Anglais (EN) |
|-----|---------------|--------------|
| `supplier.scoring_transparency` | Transparence du Score | Scoring Transparency |
| `supplier.scoring_explanation` | Cette formule explique comment le score global est calculé à partir des différents critères d'évaluation. | This formula explains how the overall score is calculated from the different evaluation criteria. |
| `supplier.no_transparency_info` | Aucune information de transparence disponible pour ce fournisseur. | No transparency information available for this supplier. |

### Scores et Critères

| Clé | Français (FR) | Anglais (EN) |
|-----|---------------|--------------|
| `supplier.product_fit` | Adéquation Produit | Product Fit |
| `supplier.company_reliability` | Fiabilité Entreprise | Company Reliability |
| `supplier.strict_criteria` | Critères Stricts | Strict Criteria |

### Accordéons

| Clé | Français (FR) | Anglais (EN) |
|-----|---------------|--------------|
| `supplier.learn_more` | En savoir plus | Learn more |
| `supplier.hide` | Masquer | Hide |

### Commun

| Clé | Français (FR) | Anglais (EN) |
|-----|---------------|--------------|
| `common.close` | Fermer | Close |

---

## 📝 Script SQL pour Insertion

```sql
-- Insertion des clés de traduction pour la section Analyse Détaillée

-- Section Principale
INSERT INTO translations (key, locale, value) VALUES
('supplier.detailed_analysis', 'fr', 'Analyse Détaillée'),
('supplier.detailed_analysis', 'en', 'Detailed Analysis');

-- Modal de Transparence
INSERT INTO translations (key, locale, value) VALUES
('supplier.scoring_transparency', 'fr', 'Transparence du Score'),
('supplier.scoring_transparency', 'en', 'Scoring Transparency'),
('supplier.scoring_explanation', 'fr', 'Cette formule explique comment le score global est calculé à partir des différents critères d''évaluation.'),
('supplier.scoring_explanation', 'en', 'This formula explains how the overall score is calculated from the different evaluation criteria.'),
('supplier.no_transparency_info', 'fr', 'Aucune information de transparence disponible pour ce fournisseur.'),
('supplier.no_transparency_info', 'en', 'No transparency information available for this supplier.');

-- Scores et Critères
INSERT INTO translations (key, locale, value) VALUES
('supplier.product_fit', 'fr', 'Adéquation Produit'),
('supplier.product_fit', 'en', 'Product Fit'),
('supplier.company_reliability', 'fr', 'Fiabilité Entreprise'),
('supplier.company_reliability', 'en', 'Company Reliability'),
('supplier.strict_criteria', 'fr', 'Critères Stricts'),
('supplier.strict_criteria', 'en', 'Strict Criteria');

-- Accordéons
INSERT INTO translations (key, locale, value) VALUES
('supplier.learn_more', 'fr', 'En savoir plus'),
('supplier.learn_more', 'en', 'Learn more'),
('supplier.hide', 'fr', 'Masquer'),
('supplier.hide', 'en', 'Hide');

-- Commun (si pas déjà existant)
INSERT INTO translations (key, locale, value) VALUES
('common.close', 'fr', 'Fermer'),
('common.close', 'en', 'Close')
ON CONFLICT (key, locale) DO NOTHING;
```

---

## ✅ Vérification

Pour vérifier que toutes les clés sont bien présentes:

```sql
SELECT key, locale, value 
FROM translations 
WHERE key LIKE 'supplier.%' OR key = 'common.close'
ORDER BY key, locale;
```

---

## 📦 Fichiers Modifiés

- ✅ `src/components/suppliers/ScoringTransparencyModal.tsx` - Ajout du hook useI18n
- ✅ `src/components/suppliers/SupplierCard.tsx` - Utilisation des clés i18n
- ✅ `src/components/suppliers/StarRating.tsx` - Props pour labels traduits

---

**Date**: 28 octobre 2025  
**Statut**: ✅ Frontend prêt - En attente de l'ajout des traductions en base

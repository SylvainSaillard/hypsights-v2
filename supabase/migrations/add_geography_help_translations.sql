-- Migration: Ajouter les traductions pour le texte d'aide des zones géographiques
-- Date: 2025-01-17
-- Description: Ajoute les clés de traduction FR/EN pour le texte d'aide sous "Zones Géographiques Préférées"

INSERT INTO translations (locale, key, value, created_at, updated_at)
VALUES 
  ('en', 'brief.form.preferred_geographies_help', 'Select the geographies you would like your future suppliers to come from', NOW(), NOW()),
  ('fr', 'brief.form.preferred_geographies_help', 'Sélectionnez les zones géographiques d''où vous souhaitez que vos futurs fournisseurs proviennent', NOW(), NOW())
ON CONFLICT (locale, key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

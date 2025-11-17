# Migration: Ajout du texte d'aide pour les zones géographiques

## Modifications effectuées

### 1. Code Frontend (✅ Complété)
Le fichier `src/components/briefs/BriefForm.tsx` a été modifié pour ajouter un texte d'aide sous le titre "Zones Géographiques Préférées *".

**Ligne 519-521:**
```tsx
<p className="text-sm text-gray-500 mb-4">
  {t('brief.form.preferred_geographies_help', 'Select the geographies you would like your future suppliers to come from')}
</p>
```

### 2. Base de données (⏳ À exécuter manuellement)

**Fichier de migration créé:** `supabase/migrations/add_geography_help_translations.sql`

## Instructions pour exécuter la migration

### Option 1: Via Supabase Dashboard (Recommandé)
1. Connectez-vous à [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez le projet **Hypsights V2** (`lmqagaenmseopcctkrwv`)
3. Allez dans **SQL Editor**
4. Créez une nouvelle requête
5. Copiez-collez le contenu du fichier `supabase/migrations/add_geography_help_translations.sql`
6. Cliquez sur **Run** pour exécuter la migration

### Option 2: Via Supabase CLI
```bash
cd "/Users/sylvain/Hypsights v2"
supabase db push
```

## Contenu de la migration

```sql
INSERT INTO translations (locale, key, value, created_at, updated_at)
VALUES 
  ('en', 'brief.form.preferred_geographies_help', 'Select the geographies you would like your future suppliers to come from', NOW(), NOW()),
  ('fr', 'brief.form.preferred_geographies_help', 'Sélectionnez les zones géographiques d''où vous souhaitez que vos futurs fournisseurs proviennent', NOW(), NOW())
ON CONFLICT (locale, key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();
```

## Vérification

Après avoir exécuté la migration, vérifiez que les traductions sont bien présentes:

```sql
SELECT * FROM translations 
WHERE key = 'brief.form.preferred_geographies_help';
```

Vous devriez voir 2 lignes:
- Une pour `locale = 'en'` avec le texte anglais
- Une pour `locale = 'fr'` avec le texte français

## Résultat attendu

Une fois la migration exécutée, le formulaire de création de brief affichera:

### Version française
**Zones Géographiques Préférées \***  
_Sélectionnez les zones géographiques d'où vous souhaitez que vos futurs fournisseurs proviennent_

### Version anglaise
**Preferred Geographies \***  
_Select the geographies you would like your future suppliers to come from_

## Support multilingue

Le système i18n de l'application gère automatiquement:
- Le chargement des traductions depuis la base de données
- Le changement de langue selon les préférences utilisateur
- Le fallback vers l'anglais si une traduction manque

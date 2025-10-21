#!/bin/bash

# Script pour ajouter https://www.hypsights.com dans toutes les Edge Functions
# Ce script corrige l'erreur CORS qui empêche le dashboard de fonctionner

echo "🔧 Correction CORS pour toutes les Edge Functions..."
echo ""

# Liste des Edge Functions à mettre à jour
FUNCTIONS=(
  "ai-chat-handler"
  "brief-header-data"
  "brief-operations"
  "fast-search-handler"
  "fast-search-monitor"
  "i18n-handler"
  "quota-manager"
  "solution-handler"
  "supplier-export"
  "supplier-pdf-export"
)

# Texte à rechercher
OLD_TEXT="  'https://hypsights.com',
  'https://hypsights-v2.vercel.app',"

# Texte de remplacement
NEW_TEXT="  'https://hypsights.com',
  'https://www.hypsights.com',
  'https://hypsights-v2.vercel.app',"

# Compteur de fichiers modifiés
MODIFIED=0

for func in "${FUNCTIONS[@]}"; do
  FILE="supabase/functions/$func/index.ts"
  
  if [ -f "$FILE" ]; then
    # Vérifier si le fichier contient déjà www.hypsights.com
    if grep -q "https://www.hypsights.com" "$FILE"; then
      echo "✅ $func - Déjà à jour"
    else
      # Vérifier si le fichier contient l'ancien texte
      if grep -q "https://hypsights.com" "$FILE"; then
        # Créer une sauvegarde
        cp "$FILE" "$FILE.backup"
        
        # Effectuer le remplacement
        sed -i '' "s|  'https://hypsights.com',|  'https://hypsights.com',\n  'https://www.hypsights.com',|g" "$FILE"
        
        echo "✅ $func - Modifié"
        MODIFIED=$((MODIFIED + 1))
      else
        echo "⚠️  $func - Structure CORS différente, vérification manuelle requise"
      fi
    fi
  else
    echo "❌ $func - Fichier non trouvé"
  fi
done

echo ""
echo "📊 Résumé:"
echo "   - Fichiers modifiés: $MODIFIED"
echo "   - Total vérifié: ${#FUNCTIONS[@]}"
echo ""
echo "🚀 Prochaine étape: Déployer les fonctions modifiées"
echo "   supabase functions deploy --project-ref lmqagaenmseopcctkrwv"

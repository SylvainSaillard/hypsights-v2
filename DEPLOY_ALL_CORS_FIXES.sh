#!/bin/bash

# Script de déploiement automatique de toutes les Edge Functions avec le fix CORS
# Ce script déploie les 11 fonctions modifiées pour autoriser https://www.hypsights.com

echo "🚀 Déploiement des Edge Functions avec fix CORS..."
echo ""
echo "⚠️  Ce script va déployer 11 Edge Functions sur Supabase"
echo "   Project: lmqagaenmseopcctkrwv"
echo ""
read -p "Continuer ? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Déploiement annulé"
    exit 1
fi

# Liste des fonctions à déployer
FUNCTIONS=(
  "ai-chat-handler"
  "brief-header-data"
  "brief-operations"
  "dashboard-data"
  "fast-search-handler"
  "fast-search-monitor"
  "i18n-handler"
  "quota-manager"
  "solution-handler"
  "supplier-export"
  "supplier-pdf-export"
)

PROJECT_REF="lmqagaenmseopcctkrwv"
SUCCESS=0
FAILED=0
FAILED_FUNCTIONS=()

echo ""
echo "📦 Déploiement en cours..."
echo ""

for func in "${FUNCTIONS[@]}"; do
  echo "⏳ Déploiement de $func..."
  
  if supabase functions deploy "$func" --project-ref "$PROJECT_REF" 2>&1 | tee /tmp/deploy_output.txt; then
    # Vérifier si le déploiement a vraiment réussi
    if grep -q "Deployed" /tmp/deploy_output.txt || grep -q "successfully" /tmp/deploy_output.txt; then
      echo "✅ $func - Déployé avec succès"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "❌ $func - Échec du déploiement"
      FAILED=$((FAILED + 1))
      FAILED_FUNCTIONS+=("$func")
    fi
  else
    echo "❌ $func - Échec du déploiement"
    FAILED=$((FAILED + 1))
    FAILED_FUNCTIONS+=("$func")
  fi
  
  echo ""
done

# Nettoyage
rm -f /tmp/deploy_output.txt

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ DU DÉPLOIEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   ✅ Succès:  $SUCCESS / ${#FUNCTIONS[@]}"
echo "   ❌ Échecs:  $FAILED / ${#FUNCTIONS[@]}"
echo ""

if [ $FAILED -gt 0 ]; then
  echo "⚠️  Fonctions en échec:"
  for func in "${FAILED_FUNCTIONS[@]}"; do
    echo "   - $func"
  done
  echo ""
  echo "💡 Solutions possibles:"
  echo "   1. Vérifier votre connexion: supabase login"
  echo "   2. Vérifier vos permissions sur le projet"
  echo "   3. Déployer manuellement via le dashboard Supabase"
  echo "      https://supabase.com/dashboard/project/$PROJECT_REF/functions"
  echo ""
  exit 1
else
  echo "🎉 Tous les déploiements ont réussi !"
  echo ""
  echo "🔍 Prochaines étapes:"
  echo "   1. Tester le dashboard: https://www.hypsights.com/dashboard"
  echo "   2. Vérifier les logs: supabase functions logs dashboard-data --project-ref $PROJECT_REF"
  echo "   3. Confirmer que les erreurs CORS ont disparu"
  echo ""
  exit 0
fi

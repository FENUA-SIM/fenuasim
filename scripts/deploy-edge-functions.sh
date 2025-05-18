#!/bin/bash

# Vérifier si supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI n'est pas installé. Installation..."
    brew install supabase/tap/supabase
fi

# Déployer les fonctions Edge
echo "Déploiement des fonctions Edge..."
supabase functions deploy sync-packages --project-ref $SUPABASE_PROJECT_ID

# Configurer le cron job
echo "Configuration du cron job..."
supabase functions schedule create sync-packages --cron "0 */6 * * *" --timezone "Pacific/Tahiti"

echo "Déploiement terminé !" 
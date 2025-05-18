   #!/bin/bash
   # Script pour réinitialiser le dépôt git et pousser sur un nouveau repo GitHub

   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit - nouveau repo clean"
   echo "Entrez l'URL de votre nouveau repo GitHub (ex: https://github.com/monuser/monrepo.git) :"
   read REPO_URL
   git remote add origin $REPO_URL
   git branch -M main
   git push -u origin main


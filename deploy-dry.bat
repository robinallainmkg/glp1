@echo off
echo Deploiement GLP-1 France en mode DRY-RUN (simulation)
echo ====================================================

echo Test de connexion SSH...
"C:\Program Files\Git\bin\bash.exe" -c "ssh -i ~/.ssh/glp1_ed25519 -p 65002 u403023291@147.79.98.140 'echo Connexion SSH reussie'"

echo.
echo En mode DRY-RUN, nous simulons le deploiement avec SCP...
echo Nombre de fichiers a transferer:
"C:\Program Files\Git\bin\bash.exe" -c "find dist -type f | wc -l"

echo.
echo Taille totale:
"C:\Program Files\Git\bin\bash.exe" -c "du -sh dist"

@echo off
echo Deploiement GLP-1 France 
echo ========================

echo Test de connexion SSH...
"C:\Program Files\Git\bin\bash.exe" -c "ssh -i ~/.ssh/glp1_ed25519 -p 65002 u403023291@147.79.98.140 'echo Connexion SSH reussie'"

if %errorlevel% neq 0 (
    echo ERREUR: Connexion SSH echouee
    echo Verifiez que la cle SSH est bien configuree sur Hostinger
    pause
    exit /b 1
)

echo.
echo Deploiement en cours...
"C:\Program Files\Git\bin\bash.exe" -c "scp -i ~/.ssh/glp1_ed25519 -P 65002 -r dist/* u403023291@147.79.98.140:/home/u403023291/domains/glp1-france.fr/public_html/"

if %errorlevel% equ 0 (
    echo.
    echo ================================
    echo DEPLOIEMENT TERMINE AVEC SUCCES
    echo ================================
    echo Site: https://glp1-france.fr
) else (
    echo.
    echo ERREUR lors du deploiement
)

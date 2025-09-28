# Guide Configuration DNS pour Google Search Console

## Instructions pour ajouter l'enregistrement TXT DNS :

### 1. Connectez-vous à votre fournisseur DNS (Hostinger)
- Allez dans votre panneau d'administration Hostinger
- Cherchez la section "DNS" ou "Zone DNS" 
- Domaine : glp1-france.fr

### 2. Ajoutez un nouvel enregistrement TXT
```
Type: TXT
Nom: @ (ou racine)
Valeur: google-site-verification=32WlwwxhRBBO_MnuK_rkZZqvEMJmzvRiurjaBEiO_FI
TTL: 3600 (ou défaut)
```

### 3. Attendez la propagation
- Les changements DNS peuvent prendre 1-48h
- Vérifiez la propagation : https://dnschecker.org

### 4. Re-vérifiez dans Google Search Console
- Retournez sur https://search.google.com/search-console
- Cliquez "Vérifier" après la propagation

## Alternative plus rapide :
Utilisez la méthode "Balise HTML" au lieu de DNS
- Plus rapide (immediate)
- Nous l'avons déjà implémentée dans le code

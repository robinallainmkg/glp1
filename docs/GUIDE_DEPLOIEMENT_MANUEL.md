# Guide de Déploiement - Hostinger

## ✅ Solution Finale : Déploiement FTP Automatisé

### Configuration GitHub Actions

Le déploiement est maintenant **automatisé via GitHub Actions** avec la configuration FTP suivante :

```yaml
# .github/workflows/deploy-hostinger.yml
- name: Deploy via FTP
  uses: SamKirkland/FTP-Deploy-Action@v4.3.4
  with:
    server: 147.79.98.140
    username: u403023291
    password: ${{ secrets.FTP_PASSWORD }}
    local-dir: ./dist/
    server-dir: /domains/glp1-france.fr/public_html/
    port: 21
    protocol: ftp
```

### Processus de Déploiement

1. **Push vers la branche `production`** déclenche automatiquement :
   - Build Astro (génération des 168+ pages statiques)
   - Déploiement FTP vers `/public_html/`
   - Vérification du déploiement

2. **Délai de mise en ligne** : 2-5 minutes après le push

### Configuration Secrets GitHub

Secrets requis dans GitHub → Settings → Secrets and variables → Actions :
- `FTP_PASSWORD` : `12031990Robin!`

### Pages Déployées

✅ **Page Partenaires** : https://glp1-france.fr/partenaires
- 7 liens partenaires intégrés
- Accessible via footer → Ressources → Partenaires
- SEO optimisé et responsive

### Troubleshooting

**Si échec de déploiement :**
1. Vérifier les secrets GitHub
2. Vérifier la connectivité FTP Hostinger
3. Utiliser le déploiement manuel via FileZilla (IP: 147.79.98.140)

### Architecture Technique

- **Framework** : Astro v4.16.18 (génération statique)
- **Déploiement** : FTP automatisé via GitHub Actions
- **Hébergement** : Hostinger partagé (147.79.98.140)
- **Build** : 168+ pages générées en ~11s

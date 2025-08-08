# 📋 AIDE-MÉMOIRE DÉPLOIEMENT - GLP-1 France

## 🔑 **INFORMATIONS CLÉS**

### **Domaine :**
```
glp1-france.fr
```

### **Serveurs DNS Hostinger :**
```
ns1.dns-parking.com
ns2.dns-parking.com
```

### **URLs importantes :**
- **Panneau Hostinger :** https://hpanel.hostinger.com
- **Site final :** https://glp1-france.fr
- **Admin login :** https://glp1-france.fr/admin-login
- **GitHub repo :** https://github.com/robinallainmkg/glp1

---

## ⚡ **CHECKLIST DÉPLOIEMENT EXPRESS**

### **1. Configuration DNS (chez votre registrar) :**
- [ ] Se connecter au panneau de votre registrar
- [ ] Aller dans "Gestion DNS" ou "Serveurs de noms"
- [ ] Remplacer les serveurs actuels par :
  - [ ] `ns1.dns-parking.com`
  - [ ] `ns2.dns-parking.com`
- [ ] Sauvegarder les modifications
- [ ] ⏰ Attendre 24-48h pour propagation

### **2. Upload site sur Hostinger :**
- [ ] Se connecter sur https://hpanel.hostinger.com
- [ ] Sélectionner le domaine `glp1-france.fr`
- [ ] Ouvrir "File Manager"
- [ ] Aller dans `public_html/`
- [ ] Supprimer tout le contenu existant
- [ ] Upload `glp1-site-production.zip`
- [ ] Extraire le ZIP dans `public_html/`
- [ ] Déplacer le contenu de `dist/` vers la racine
- [ ] Vérifier que `index.html` est à la racine de `public_html/`

### **3. Configuration serveur :**
- [ ] Créer fichier `.htaccess` dans `public_html/`
- [ ] Copier le contenu de `.htaccess-hostinger`
- [ ] Sauvegarder
- [ ] Activer SSL/HTTPS dans le panneau Hostinger

### **4. Tests de vérification :**
- [ ] Accéder à `https://glp1-france.fr`
- [ ] Vérifier le certificat SSL (cadenas vert)
- [ ] Tester la navigation (menu, recherche)
- [ ] Vérifier les pages de collection
- [ ] Tester l'admin : `https://glp1-france.fr/admin-login`
- [ ] Lancer le script : `./scripts/verify-deployment.sh`

---

## 🚨 **DÉPANNAGE RAPIDE**

### **Si le site ne s'affiche pas :**
1. Vérifier que `index.html` est bien à la racine de `public_html/`
2. Contrôler les permissions (755 pour dossiers, 644 pour fichiers)
3. Vérifier la propagation DNS sur https://dnschecker.org
4. Consulter les logs d'erreur dans Hostinger

### **Si HTTPS ne fonctionne pas :**
1. Activer "Force HTTPS" dans le panneau Hostinger
2. Vérifier que le certificat SSL est activé
3. Attendre jusqu'à 24h pour la génération complète

### **Si les DNS ne se propagent pas :**
1. Vérifier la configuration chez le registrar
2. Attendre jusqu'à 48h maximum
3. Tester avec différents outils : dnschecker.org, whatsmydns.net

---

## 📞 **CONTACTS SUPPORT**

- **Support Hostinger :** Chat 24/7 sur hpanel.hostinger.com
- **Vérification DNS :** https://dnschecker.org
- **Test SSL :** https://www.ssllabs.com/ssltest/
- **GitHub Issues :** https://github.com/robinallainmkg/glp1/issues

---

## ✅ **APRÈS DÉPLOIEMENT RÉUSSI**

### **Configuration recommandée :**
- [ ] Configurer Google Analytics
- [ ] Mettre en place UptimeRobot (monitoring)
- [ ] Vérifier l'indexation Google Search Console
- [ ] Configurer les sauvegardes automatiques Hostinger
- [ ] Tester sur différents appareils/navigateurs

### **Monitoring continu :**
- [ ] Vérification hebdomadaire de la disponibilité
- [ ] Contrôle mensuel des performances
- [ ] Sauvegarde régulière des contenus
- [ ] Mise à jour des articles selon stratégie SEO

---

**🎯 Votre site sera opérationnel dès que la propagation DNS sera terminée !**

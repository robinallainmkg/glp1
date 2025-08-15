# 📊 Système de Données Utilisateurs - GLP-1 France

> **Date de création** : Août 2025  
> **Status** : ✅ Déployé en production

## 🎯 Vue d'ensemble

Le système de données utilisateurs permet de collecter, stocker et analyser les interactions des visiteurs avec le site GLP-1 France. Il comprend un dashboard administrateur, des APIs sécurisées et des formulaires optimisés.

---

## 🏗️ Architecture

### Dashboard Admin
- **URL** : https://glp1-france.fr/admin-user-data/
- **Fichier** : `src/pages/admin-user-data.astro`
- **Authentification** : Basique (admin/admin123)

### APIs TypeScript
1. **Contact API** : `src/pages/api/contact.ts`
2. **Guide API** : `src/pages/api/guide-beauty.ts`
3. **Admin API** : `src/pages/api/admin-data.ts`

### Base de données JSON
1. **Contact** : `data/contact-submissions.json`
2. **Newsletter** : `data/newsletter-subscribers.json`
3. **Guide** : `data/guide-downloads.json`

---

## 📋 Fonctionnalités

### Dashboard Administrateur
- **Statistiques en temps réel** des inscriptions et soumissions
- **Liste détaillée** des utilisateurs avec source de provenance
- **Graphiques visuels** des tendances d'inscription
- **Export CSV** pour analyse externe
- **Filtrage par date** et par source

### Collecte de données
- **Inscriptions newsletter** avec tracking de source
- **Messages de contact** avec opt-in newsletter automatique
- **Téléchargements de guide** avec préférences utilisateur
- **Horodatage précis** de toutes les interactions

### Sécurité
- **Validation email** côté serveur
- **Protection CORS** sur les APIs
- **Authentification admin** sécurisée
- **Sanitisation** des données d'entrée

---

## 🔧 Configuration technique

### Types TypeScript

```typescript
// Contact Submission
interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  newsletter: boolean;
  timestamp: string;
}

// Newsletter Subscriber
interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  source: string;
  timestamp: string;
}

// Guide Download
interface GuideSubmission {
  id: string;
  name: string;
  email: string;
  concerns: string[];
  newsletter: boolean;
  timestamp: string;
}
```

### Structure des données JSON

#### Newsletter Subscribers
```json
{
  "subscribers": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Nom Utilisateur",
      "source": "contact_form|guide_download|direct",
      "timestamp": "2025-08-15T18:30:00.000Z"
    }
  ]
}
```

#### Contact Submissions
```json
{
  "submissions": [
    {
      "id": "uuid",
      "name": "Nom Utilisateur",
      "email": "user@example.com",
      "message": "Message de contact",
      "newsletter": true,
      "timestamp": "2025-08-15T18:30:00.000Z"
    }
  ]
}
```

---

## 🎨 Interface utilisateur

### Formulaires optimisés

#### Formulaire de contact
- **URL** : https://glp1-france.fr/contact/
- **Autocomplete** activé pour une meilleure UX
- **Validation** en temps réel
- **Opt-in newsletter** intégré

#### Formulaire de guide
- **URL** : https://glp1-france.fr/guide-beaute-perte-de-poids-glp1/
- **Sélection multiple** des préoccupations
- **Contenu optimisé** (suppression "beauté")
- **Newsletter consent** explicite

### Dashboard admin responsive
- **Design moderne** avec CSS personnalisé
- **Navigation par onglets** (Statistiques, Utilisateurs, Export)
- **Graphiques interactifs** pour les tendances
- **Interface mobile** adaptée

---

## 📊 Métriques collectées

### Statistiques globales
- **Total inscriptions newsletter**
- **Total soumissions contact**
- **Total téléchargements guide**
- **Taux de conversion newsletter**

### Analytics par source
- **Contact form** : Inscriptions via formulaire de contact
- **Guide download** : Inscriptions via téléchargement de guide
- **Direct** : Inscriptions directes

### Données temporelles
- **Inscriptions par jour/semaine/mois**
- **Tendances d'évolution**
- **Pics d'activité**

---

## 🚀 Déploiement

### Commandes de déploiement
```powershell
# Build et déploiement Windows
npm run build
.\deploy-auto.ps1

# Vérification du build
npm run build  # 152 pages générées
```

### URLs en production
- **Admin Dashboard** : https://glp1-france.fr/admin-user-data/
- **Contact Form** : https://glp1-france.fr/contact/
- **Guide Form** : https://glp1-france.fr/guide-beaute-perte-de-poids-glp1/

### APIs endpoints
- `POST /api/contact` - Soumission de contact
- `POST /api/guide-beauty` - Téléchargement de guide  
- `GET /api/admin-data` - Données admin (authentifié)

---

## 🔮 Évolutions futures

### Fonctionnalités prévues
- **Analytics avancées** avec segmentation utilisateur
- **Notifications email** pour les nouveaux contacts
- **Export automatisé** des rapports
- **Dashboard public** avec métriques anonymisées

### Améliorations techniques
- **Base de données relationnelle** (MySQL/PostgreSQL)
- **Cache Redis** pour les performances
- **API REST complète** avec authentification JWT
- **Tests automatisés** des formulaires

---

## 🛠️ Maintenance

### Sauvegarde des données
- **Backup automatique** des fichiers JSON via déploiement
- **Versionning Git** de toutes les données
- **Export CSV régulier** pour archivage

### Monitoring
- **Logs d'erreur** des APIs
- **Monitoring uptime** du dashboard
- **Alertes** en cas de problème de collecte

---

## 👥 Support

### Accès admin
- **URL** : https://glp1-france.fr/admin-user-data/
- **Identifiants** : admin / admin123
- **Niveau d'accès** : Lecture et export des données

### Contact technique
Pour toute question ou problème technique concernant le système de données utilisateurs, contacter l'équipe de développement.

---

> **Dernière mise à jour** : 15 août 2025  
> **Version** : 1.0.0  
> **Status** : Production stable

#!/usr/bin/env node

/**
 * Script pour mettre à jour automatiquement les frontmatters
 * Remplace les .svg par .jpg après génération Grok
 */

import fs from 'fs/promises';
import path from 'path';

const articlesToUpdate = [
  {
    "collection": "glp1-diabete",
    "file": "diabete-complications-glp1.md",
    "slug": "diabete-complications-glp1",
    "title": "Diabète Complications GLP-1",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/diabete-complications-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "diabete-gestationnel-glp1.md",
    "slug": "diabete-gestationnel-glp1",
    "title": "Diabète Gestationnel GLP-1",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/diabete-gestationnel-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "diabete-pied-glp1.md",
    "slug": "diabete-pied-glp1",
    "title": "Diabète Pied GLP-1",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/diabete-pied-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "diabete-regime-glp1.md",
    "slug": "diabete-regime-glp1",
    "title": "Diabète Régime GLP-1",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/diabete-regime-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "diabete-retinopathie-glp1.md",
    "slug": "diabete-retinopathie-glp1",
    "title": "Diabète Retinopathie GLP-1",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/diabete-retinopathie-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "diabete-sport-glp1.md",
    "slug": "diabete-sport-glp1",
    "title": "Diabète Sport GLP-1",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/diabete-sport-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "diabete-urgence-glp1.md",
    "slug": "diabete-urgence-glp1",
    "title": "Diabète Urgence GLP-1",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/diabete-urgence-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "glp1-auto-surveillance.md",
    "slug": "glp1-auto-surveillance",
    "title": "GLP-1 Auto Surveillance",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/glp1-auto-surveillance.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "glp1-carnet-diabetique.md",
    "slug": "glp1-carnet-diabetique",
    "title": "GLP-1 Carnet Diabetique",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/glp1-carnet-diabetique.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "glp1-diabete-type-1.md",
    "slug": "glp1-diabete-type-1",
    "title": "GLP-1 Diabète Type 1",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/glp1-diabete-type-1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "glp1-hba1c-reduction.md",
    "slug": "glp1-hba1c-reduction",
    "title": "GLP-1 Hba1c Reduction",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/glp1-hba1c-reduction.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "glp1-insuline-interaction.md",
    "slug": "glp1-insuline-interaction",
    "title": "GLP-1 Insuline Interaction",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/glp1-insuline-interaction.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "glp1-nephropathie.md",
    "slug": "glp1-nephropathie",
    "title": "GLP-1 Nephropathie",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/glp1-nephropathie.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "glp1-neuropathie-diabetique.md",
    "slug": "glp1-neuropathie-diabetique",
    "title": "GLP-1 Neuropathie Diabetique",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/glp1-neuropathie-diabetique.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-diabete",
    "file": "traitement-insulinique.md",
    "slug": "traitement-insulinique",
    "title": "Traitement Insulinique",
    "description": "",
    "category": "Diabète",
    "thumbnail": "/images/thumbnails/traitement-insulinique.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "ado-medicament.md",
    "slug": "ado-medicament",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/ado-medicament.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "ballon-gastrique-rembourse.md",
    "slug": "ballon-gastrique-rembourse",
    "title": "Guide Complet GLP-1 2025 : Tout SavoirGuide complet sur Médicaments Glp 1 : informations médicales et recommandations dexperts.",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/ballon-gastrique-rembourse.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "coupe-faim-puissant-interdit-en-france.md",
    "slug": "coupe-faim-puissant-interdit-en-france",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/coupe-faim-puissant-interdit-en-france.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "dipeptidyl-peptidase-4.md",
    "slug": "dipeptidyl-peptidase-4",
    "title": "Guide Complet GLP-1 2025 : Tout SavoirGuide complet sur Médicaments Glp 1 : informations médicales et recommandations dexperts.",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/dipeptidyl-peptidase-4.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "dosage-trulicity.md",
    "slug": "dosage-trulicity",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/dosage-trulicity.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "dulaglutide-nom-commercial.md",
    "slug": "dulaglutide-nom-commercial",
    "title": "Guide Complet dulaglutide 2025 : Tout Savoir",
    "description": "Guide complet sur Dulaglutide Nom Commercial : informations médicales, conseils et recommandations dexperts.",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/dulaglutide-nom-commercial.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "januvia-autre-nom.md",
    "slug": "januvia-autre-nom",
    "title": "Guide Complet GLP-1 2025 : Tout SavoirGuide complet sur Médicaments Glp 1 : informations médicales et recommandations dexperts.",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/januvia-autre-nom.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "liraglutide-perte-de-poids-avis.md",
    "slug": "liraglutide-perte-de-poids-avis",
    "title": "liraglutide Avis 2025 : Efficacité et Témoignages Réels",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/liraglutide-perte-de-poids-avis.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "mecanisme-d-action.md",
    "slug": "mecanisme-d-action",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/mecanisme-d-action.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "medicament-americain-pour-maigrir.md",
    "slug": "medicament-americain-pour-maigrir",
    "title": "Guide Complet maigrir 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/medicament-americain-pour-maigrir.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "medicament-anti-obesite-novo-nordisk.md",
    "slug": "medicament-anti-obesite-novo-nordisk",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/medicament-anti-obesite-novo-nordisk.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "medicament-pour-maigrir-tres-puissant.md",
    "slug": "medicament-pour-maigrir-tres-puissant",
    "title": "Guide Complet maigrir 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/medicament-pour-maigrir-tres-puissant.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "medicament-prise-de-poid.md",
    "slug": "medicament-prise-de-poid",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/medicament-prise-de-poid.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "medicaments-qui-augmentent-la-glycemie.md",
    "slug": "medicaments-qui-augmentent-la-glycemie",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/medicaments-qui-augmentent-la-glycemie.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "metformine-autre-nom.md",
    "slug": "metformine-autre-nom",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/metformine-autre-nom.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "metformine-diarrhee-solution.md",
    "slug": "metformine-diarrhee-solution",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/metformine-diarrhee-solution.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "mounjaro-effet-secondaire.md",
    "slug": "mounjaro-effet-secondaire",
    "title": "Mounjaro Effets Secondaires : Guide Complet de Prévention",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/mounjaro-effet-secondaire.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "mounjaro-injection-pour-maigrir.md",
    "slug": "mounjaro-injection-pour-maigrir",
    "title": "Guide Complet Mounjaro 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/mounjaro-injection-pour-maigrir.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "mounjaro-prix-france.md",
    "slug": "mounjaro-prix-france",
    "title": "Mounjaro Prix 2025 : Coût et Remboursement",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/mounjaro-prix-france.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "nouveau-medicament.md",
    "slug": "nouveau-medicament",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/nouveau-medicament.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "nouveau-traitement-diabete-type-2-injection.md",
    "slug": "nouveau-traitement-diabete-type-2-injection",
    "title": "Guide Complet diabète 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/nouveau-traitement-diabete-type-2-injection.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "orlistat-avant-apres.md",
    "slug": "orlistat-avant-apres",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/orlistat-avant-apres.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "ozempic-injection-prix.md",
    "slug": "ozempic-injection-prix",
    "title": "Ozempic Prix 2025 : Coût et Remboursement",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/ozempic-injection-prix.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "pilule-qui-fait-maigrir.md",
    "slug": "pilule-qui-fait-maigrir",
    "title": "Guide Complet maigrir 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/pilule-qui-fait-maigrir.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "saxenda-prix.md",
    "slug": "saxenda-prix",
    "title": "Saxenda Prix 2025 : Coût et Remboursement",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/saxenda-prix.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "semaglutide-achat.md",
    "slug": "semaglutide-achat",
    "title": "Guide Complet semaglutide 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/semaglutide-achat.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "sitagliptine-effets-secondaires.md",
    "slug": "sitagliptine-effets-secondaires",
    "title": "Sitagliptine Effets Secondaires : Guide Complet de Prévention 2025",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/sitagliptine-effets-secondaires.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "stylo-saxenda.md",
    "slug": "stylo-saxenda",
    "title": "Guide Complet Saxenda 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/stylo-saxenda.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "sulfamide-hypoglycemiant.md",
    "slug": "sulfamide-hypoglycemiant",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/sulfamide-hypoglycemiant.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "sulfamides-medicaments.md",
    "slug": "sulfamides-medicaments",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/sulfamides-medicaments.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "tirzepatide-avis.md",
    "slug": "tirzepatide-avis",
    "title": "tirzepatide Avis 2025 : Efficacité et Témoignages Réels",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/tirzepatide-avis.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "traitement-diabete-type-2.md",
    "slug": "traitement-diabete-type-2",
    "title": "Guide Complet diabète 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/traitement-diabete-type-2.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "traitements-medicamenteux.md",
    "slug": "traitements-medicamenteux",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/traitements-medicamenteux.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "trulicity-danger.md",
    "slug": "trulicity-danger",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/trulicity-danger.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "trulicity-ou-ozempic.md",
    "slug": "trulicity-ou-ozempic",
    "title": "Guide Complet Ozempic 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/trulicity-ou-ozempic.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "victoza-posologie.md",
    "slug": "victoza-posologie",
    "title": "Victoza Posologie 2025 : Comment Bien lUtiliser ?",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/victoza-posologie.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "victoza-rupture.md",
    "slug": "victoza-rupture",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/victoza-rupture.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "wegovy-avis.md",
    "slug": "wegovy-avis",
    "title": "Wegovy Avis 2025 : Efficacité et Témoignages Réels",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/wegovy-avis.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medicaments-glp1",
    "file": "xenical-remboursement.md",
    "slug": "xenical-remboursement",
    "title": "Xenical Remboursement 2025 : Coût et Prise en Charge",
    "description": "",
    "category": "Guide médical",
    "thumbnail": "/images/thumbnails/xenical-remboursement.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "avant-apres-glp1.md",
    "slug": "avant-apres-glp1",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/avant-apres-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "chirurgie-bariatrique.md",
    "slug": "chirurgie-bariatrique",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/chirurgie-bariatrique.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "combien-de-dose-dans-un-stylo-ozempic.md",
    "slug": "combien-de-dose-dans-un-stylo-ozempic",
    "title": "Ozempic Posologie : Comment Bien lUtiliser ?",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/combien-de-dose-dans-un-stylo-ozempic.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "diabete-amaigrissement-rapide.md",
    "slug": "diabete-amaigrissement-rapide",
    "title": "Guide Complet diabète 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/diabete-amaigrissement-rapide.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "glp1-perte-de-poids.md",
    "slug": "glp1-perte-de-poids",
    "title": "GLP-1 Perte de Poids 2025 : Résultats et Témoignages",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/glp1-perte-de-poids.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "medicament-americain-pour-maigrir.md",
    "slug": "medicament-americain-pour-maigrir",
    "title": "Guide Complet maigrir 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/medicament-americain-pour-maigrir.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "medicament-pour-maigrir-tres-puissant-en-pharmacie.md",
    "slug": "medicament-pour-maigrir-tres-puissant-en-pharmacie",
    "title": "Guide Complet maigrir 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/medicament-pour-maigrir-tres-puissant-en-pharmacie.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "medicament-pour-maigrir-tres-puissant.md",
    "slug": "medicament-pour-maigrir-tres-puissant",
    "title": "Guide Complet maigrir 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/medicament-pour-maigrir-tres-puissant.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "medicament-pour-perdre-du-ventre-en-1-semaine.md",
    "slug": "medicament-pour-perdre-du-ventre-en-1-semaine",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/medicament-pour-perdre-du-ventre-en-1-semaine.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "obesite-severe-prise-en-charge.md",
    "slug": "obesite-severe-prise-en-charge",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/obesite-severe-prise-en-charge.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "ou-trouver-ozempic.md",
    "slug": "ou-trouver-ozempic",
    "title": "Guide Complet Ozempic 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/ou-trouver-ozempic.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "ozempic-effets-secondaires-forum.md",
    "slug": "ozempic-effets-secondaires-forum",
    "title": "Ozempic Effets Secondaires : Guide Complet de Prévention",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/ozempic-effets-secondaires-forum.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "ozempic-prix.md",
    "slug": "ozempic-prix",
    "title": "Ozempic Prix 2025 : Coût et Remboursement",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/ozempic-prix.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "ozempic-regime.md",
    "slug": "ozempic-regime",
    "title": "Guide Complet Ozempic 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/ozempic-regime.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "personne-obese.md",
    "slug": "personne-obese",
    "title": "Guide Complet GLP-1 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/personne-obese.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-perte-de-poids",
    "file": "pilule-qui-fait-maigrir.md",
    "slug": "pilule-qui-fait-maigrir",
    "title": "Guide Complet maigrir 2025 : Tout Savoir",
    "description": "",
    "category": "Perte de poids",
    "thumbnail": "/images/thumbnails/pilule-qui-fait-maigrir.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-cout",
    "file": "anneau-gastrique-prix-cmu.md",
    "slug": "anneau-gastrique-prix-cmu",
    "title": "Anneau Gastrique Prix CmuGuide complet sur Anneau Gastrique Et Cmu : informations médicales et recommandations dexperts.",
    "description": "",
    "category": "Économie santé",
    "thumbnail": "/images/thumbnails/anneau-gastrique-prix-cmu.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-cout",
    "file": "operation-pour-maigrir-prix.md",
    "slug": "operation-pour-maigrir-prix",
    "title": "Operation Pour Maigrir PrixGuide complet sur Operations Pour Maigrir : informations médicales et recommandations dexperts.",
    "description": "",
    "category": "Économie santé",
    "thumbnail": "/images/thumbnails/operation-pour-maigrir-prix.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-cout",
    "file": "saxenda-prix-pharmacie.md",
    "slug": "saxenda-prix-pharmacie",
    "title": "Saxenda Prix PharmacieGuide complet sur Saxenda Prix Pharmacie : informations médicales et recommandations dexperts.",
    "description": "",
    "category": "Économie santé",
    "thumbnail": "/images/thumbnails/saxenda-prix-pharmacie.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-cout",
    "file": "wegovy-prix.md",
    "slug": "wegovy-prix",
    "title": "Wegovy PrixGuide complet sur Prix De Wegovy En France 2025 : informations médicales et recommandations dexperts.",
    "description": "",
    "category": "Économie santé",
    "thumbnail": "/images/thumbnails/wegovy-prix.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "glp1-cout",
    "file": "wegovy-remboursement-mutuelle.md",
    "slug": "wegovy-remboursement-mutuelle",
    "title": "Wegovy Remboursement Mutuelle",
    "description": "",
    "category": "Économie santé",
    "thumbnail": "/images/thumbnails/wegovy-remboursement-mutuelle.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medecins-glp1-france",
    "file": "clinique-pour-obesite-new.md",
    "slug": "clinique-pour-obesite-new",
    "title": "Clinique Pour Obesite New",
    "description": "",
    "category": "Médecins spécialisés",
    "thumbnail": "/images/thumbnails/clinique-pour-obesite-new.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medecins-glp1-france",
    "file": "clinique-pour-obesite.md",
    "slug": "clinique-pour-obesite",
    "title": "Clinique Pour Obesite",
    "description": "",
    "category": "Médecins spécialisés",
    "thumbnail": "/images/thumbnails/clinique-pour-obesite.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medecins-glp1-france",
    "file": "diabetologue-paris.md",
    "slug": "diabetologue-paris",
    "title": "Diabetologue Paris",
    "description": "",
    "category": "Médecins spécialisés",
    "thumbnail": "/images/thumbnails/diabetologue-paris.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medecins-glp1-france",
    "file": "endocrinologue-pour-maigrir-new.md",
    "slug": "endocrinologue-pour-maigrir-new",
    "title": "Endocrinologue Pour Maigrir New",
    "description": "",
    "category": "Médecins spécialisés",
    "thumbnail": "/images/thumbnails/endocrinologue-pour-maigrir-new.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "medecins-glp1-france",
    "file": "endocrinologue-pour-maigrir.md",
    "slug": "endocrinologue-pour-maigrir",
    "title": "Endocrinologue Pour Maigrir",
    "description": "",
    "category": "Médecins spécialisés",
    "thumbnail": "/images/thumbnails/endocrinologue-pour-maigrir.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "recherche-glp1",
    "file": "glp-inhibitors.md",
    "slug": "glp-inhibitors",
    "title": "Glp Inhibitors",
    "description": "",
    "category": "Recherche médicale",
    "thumbnail": "/images/thumbnails/glp-inhibitors.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "recherche-glp1",
    "file": "recherche-clinique-glp1.md",
    "slug": "recherche-clinique-glp1",
    "title": "Recherche Clinique GLP-1",
    "description": "",
    "category": "Recherche médicale",
    "thumbnail": "/images/thumbnails/recherche-clinique-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "glp1-calories-journalieres.md",
    "slug": "glp1-calories-journalieres",
    "title": "GLP-1 Calories Journalieres",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/glp1-calories-journalieres.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "glp1-index-glycemique.md",
    "slug": "glp1-index-glycemique",
    "title": "GLP-1 Index Glycemique",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/glp1-index-glycemique.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "glp1-micronutriments.md",
    "slug": "glp1-micronutriments",
    "title": "GLP-1 Micronutriments",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/glp1-micronutriments.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "glp1-portion-alimentaire.md",
    "slug": "glp1-portion-alimentaire",
    "title": "GLP-1 Portion Alimentaire",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/glp1-portion-alimentaire.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "glp1-proteines.md",
    "slug": "glp1-proteines",
    "title": "GLP-1 Proteines",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/glp1-proteines.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "isglt2-liste.md",
    "slug": "isglt2-liste",
    "title": "Isglt2 Liste",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/isglt2-liste.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "jeune-intermittent-glp1.md",
    "slug": "jeune-intermittent-glp1",
    "title": "Jeune Intermittent GLP-1",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/jeune-intermittent-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "regime-cetogene-glp1.md",
    "slug": "regime-cetogene-glp1",
    "title": "Régime Cetogene GLP-1",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/regime-cetogene-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "regime-chrono-nutrition-glp1.md",
    "slug": "regime-chrono-nutrition-glp1",
    "title": "Régime Chrono Nutrition GLP-1",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/regime-chrono-nutrition-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "regime-dash-glp1.md",
    "slug": "regime-dash-glp1",
    "title": "Régime Dash GLP-1",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/regime-dash-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "regime-detox-glp1.md",
    "slug": "regime-detox-glp1",
    "title": "Régime Detox GLP-1",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/regime-detox-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "regime-mediterraneen-glp1.md",
    "slug": "regime-mediterraneen-glp1",
    "title": "Régime Mediterraneen GLP-1",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/regime-mediterraneen-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "regime-paleo-glp1.md",
    "slug": "regime-paleo-glp1",
    "title": "Régime Paleo GLP-1",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/regime-paleo-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  },
  {
    "collection": "regime-glp1",
    "file": "regime-sans-sucre-glp1.md",
    "slug": "regime-sans-sucre-glp1",
    "title": "Régime Sans Sucre GLP-1",
    "description": "",
    "category": "Nutrition",
    "thumbnail": "/images/thumbnails/regime-sans-sucre-glp1.svg",
    "content": "SYSTÈME D'AFFILIATION AUTOMATIQUE - Layout: ArticleWithAffiliateSidebar - Produits: Configurés par collection..."
  }
];

console.log('🔄 Mise à jour automatique des frontmatters...');

let updatedCount = 0;

for (const article of articlesToUpdate) {
  const filePath = path.join('src/content', article.collection, article.file);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const newImagePath = `/images/thumbnails/${article.slug}.jpg`;
    
    // Vérifier si l'image existe
    const imagePath = path.join('public', 'images', 'thumbnails', `${article.slug}.jpg`);
    
    try {
      await fs.access(imagePath);
      
      // L'image existe, mettre à jour le frontmatter
      const updatedContent = content.replace(
        /thumbnail: "?\/images\/thumbnails\/[^"\s]+\.svg"?/,
        `thumbnail: "${newImagePath}"`
      );
      
      if (updatedContent !== content) {
        await fs.writeFile(filePath, updatedContent, 'utf-8');
        console.log(`✅ Mis à jour: ${article.collection}/${article.file}`);
        updatedCount++;
      }
      
    } catch {
      console.log(`⏳ En attente: ${article.slug}.jpg (image non trouvée)`);
    }
    
  } catch (error) {
    console.log(`❌ Erreur ${article.file}: ${error.message}`);
  }
}

console.log(`
🎯 Mise à jour terminée: ${updatedCount}/${articlesToUpdate.length} articles`);

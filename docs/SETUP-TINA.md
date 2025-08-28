# Configuration TinaCMS - Instructions Setup

## Setup rapide sur nouveau device

1. **Clone le repository**
   ```bash
   git clone https://github.com/robinallainmkg/glp1.git
   cd glp1
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer TinaCMS**
   ```bash
   cp .env.example .env.local
   ```
   
   Puis éditer `.env.local` avec vos vraies clés TinaCMS :
   - `NEXT_PUBLIC_TINA_CLIENT_ID` : Trouvé dans votre dashboard TinaCMS
   - `TINA_TOKEN` : Token d'accès généré dans TinaCMS
   
4. **Lancer TinaCMS**
   ```bash
   npm run dev:tina
   ```

## Accès TinaCMS

- **Interface admin** : `http://localhost:4321/admin`
- **API GraphQL** : `http://localhost:4001/graphql`

## Collections disponibles

- 💰 **Produits d'Affiliation** (`affiliate_products`)
- 💊 **Médicaments GLP1** (`medicaments_glp1`)
- ⚖️ **GLP1 Perte de Poids** (`glp1_perte_de_poids`)
- 💰 **Coût et Prix** (`glp1_cout`)
- Et toutes les autres collections...

## Notes importantes

- ✅ Configuration TinaCMS synchronisée via Git
- ✅ Produits d'affiliation prêts à éditer
- ✅ Schema et collections configurés
- ⚠️ Variables d'environnement à configurer localement
- ⚠️ Authentification TinaCMS requise (même compte)

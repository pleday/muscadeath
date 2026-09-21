# Muscadeath Festival — site web

Site moderne du festival Muscadeath (Vallet, 44), construit avec React, Vite,
TypeScript et Tailwind CSS. L'ensemble du contenu, des couleurs et des images
est centralisé dans quelques fichiers pour être facilement personnalisable
sans toucher au code des composants.

## Démarrer

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production dans dist/
```

Le site utilise le routage côté client (page `/admin`). `npm run dev` et
`npm run preview` gèrent cela automatiquement. Si vous déployez `dist/` sur un
hébergeur statique (Netlify, etc.), gardez le fichier `public/_redirects`
fourni (ou configurez une règle équivalente) pour que `/admin` fonctionne
après un rechargement de page.

## Personnaliser le contenu

Tous les textes (accroches, programmation, tarifs, actualités, contact,
liens de navigation, réseaux sociaux, etc.) se trouvent dans :

```
src/config/site.config.ts
```

Modifiez les valeurs de cet objet pour mettre à jour le site : chaque section
de la page (Hero, À propos, Programmation, Infos pratiques, Galerie,
Actualités, Contact) lit ses données depuis ce fichier.

## Personnaliser les couleurs

La palette de couleurs se trouve dans :

```
src/config/theme.ts
```

Changez la valeur de `ACTIVE_THEME` pour choisir un des thèmes prédéfinis
(`muscadet-metal`, `toxic-green`, `purple-night`), ou modifiez directement les
codes couleur pour créer votre propre palette. Toute la mise en page (boutons,
titres, fonds, bordures) utilise ces variables automatiquement.

## Personnaliser les images

Les images sont référencées depuis le dossier `public/images/`. Pour
remplacer une image :

1. Ajoutez votre fichier dans `public/images/` (jpg, png, svg, webp...).
2. Mettez à jour le chemin correspondant dans `src/config/site.config.ts`
   (ex. `hero.backgroundImage`, `about.image`, `gallery.images`, etc.).

Des visuels de remplacement (SVG) sont fournis par défaut pour que le site
soit fonctionnel dès le départ ; remplacez-les par les photos réelles du
festival (affiches, photos de scène, du public, du camping...).

## Page d'administration

Un espace d'administration permet de modifier le contenu, les couleurs et
certaines images directement depuis le navigateur, sans toucher au code.

- **Accès** : discret, via le petit ⚙ en bas de la page (pied de page), ou
  directement sur `/admin`.
- **Mot de passe par défaut** : `muscadeath2027` (à changer, voir
  `src/config/admin.ts` pour la procédure).
- **Onglets** : Contenu (textes principaux), Actualités (ajout / édition /
  réordonnancement / suppression des actus, avec upload d'image), Boutique
  (articles précommandés en vente), Statistiques (chiffre d'affaires,
  commandes, meilleures ventes), Couleurs (thème + presets), Images (choix,
  pour l'accueil et la section « À propos », entre une image uploadée ou une
  couleur unie), Avancé (édition JSON pour la programmation, les tarifs, la
  galerie et les réseaux sociaux).

**Important — limites de sécurité et de persistance (mode local) :**

- Par défaut (sans configuration Supabase, voir section suivante), ce site
  est 100% statique. Les modifications faites dans l'admin sont enregistrées
  dans le `localStorage` du navigateur utilisé et s'appliquent immédiatement
  à l'aperçu, mais **ne sont pas visibles par les autres visiteurs**.
- Pour publier quand même un changement fait en local : utilisez le bouton
  « Exporter » de l'admin pour télécharger un fichier JSON, puis reportez
  les valeurs dans `src/config/site.config.ts` / `src/config/theme.ts` et
  redéployez le site.
- Le mot de passe local est vérifié uniquement côté navigateur (son
  empreinte est présente dans le code JavaScript livré). C'est un frein pour
  dissuader les visiteurs occasionnels, **pas une protection de sécurité
  réelle**.

## Rendre l'administration effective en ligne (Supabase)

Pour que les modifications faites dans `/admin` soient **immédiatement
visibles par tous les visiteurs** (sans exporter/reporter manuellement dans
le code et sans redéployer), branchez le site sur un projet
[Supabase](https://supabase.com) gratuit. Ça reste 100% compatible avec un
hébergement statique (Netlify, Vercel, GitHub Pages, OVH mutualisé...) : tous
les appels se font depuis le navigateur, pas besoin de serveur Node.

1. **Créer un projet Supabase** (gratuit) sur [supabase.com](https://supabase.com).
2. **Créer la table de contenu** : dans l'éditeur SQL du projet, exécutez le
   contenu du fichier [`supabase/schema.sql`](supabase/schema.sql) fourni.
   Il crée la table `site_content`, active la sécurité au niveau des lignes
   (RLS) et n'autorise l'écriture qu'aux comptes connectés.
3. **Créer votre compte admin** : dans *Authentication > Users*, ajoutez un
   utilisateur avec votre email et un mot de passe. C'est ce compte qui sert
   à se connecter sur `/admin` (il remplace le mot de passe local).
4. **Récupérer les clés API** : dans *Project Settings > API*, copiez
   `Project URL` et la clé publique `anon`.
5. **Configurer le projet** : copiez `.env.example` en `.env.local` et
   renseignez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Ajoutez les
   mêmes variables dans les paramètres de build de votre hébergeur (Netlify,
   Vercel...) pour la production.
6. **Rebuild & déployez** (`npm run build`).
7. Connectez-vous sur `/admin` avec l'email/mot de passe créés à l'étape 3,
   modifiez le contenu puis cliquez sur **« Publier en ligne »** : le
   changement est enregistré dans Supabase et appliqué chez tous les
   visiteurs dès leur prochain chargement de page — sans redéploiement.

La clé `anon` est publique par conception (elle apparaît dans le code
livré au navigateur) : la sécurité réelle est assurée par les policies RLS
définies dans `supabase/schema.sql`, qui n'autorisent l'écriture qu'aux
utilisateurs authentifiés. Ne créez pas de compte public d'inscription :
seul le(s) compte(s) que vous créez manuellement dans Supabase peuvent se
connecter à `/admin`.

Si `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` ne sont pas définies, le
site fonctionne normalement en mode local (voir section précédente).

## Boutique en ligne (paiement par carte, Stripe)

La section « Boutique » permet un vrai paiement en ligne (panier, carte
bancaire via Stripe) pour les précommandes, retirées sur place au festival.
Cela nécessite un compte Stripe (gratuit, sans abonnement, seulement des
frais par transaction encaissée) et le projet Supabase configuré ci-dessus
(pour stocker les commandes et héberger les fonctions serveur nécessaires).

### 1. Créer un compte Stripe

1. Créez un compte sur [stripe.com](https://stripe.com).
2. Restez en **mode test** pour essayer (cartes de test, aucun vrai
   paiement) tant que vous n'avez pas fini de configurer et testé le tunnel
   d'achat. Vous basculerez en mode production plus tard, dans le même
   compte.
3. Dans *Développeurs > Clés API*, notez la **clé secrète** (`sk_test_...`
   puis `sk_live_...` une fois en production).

### 2. Installer la table des commandes

Dans l'éditeur SQL Supabase, exécutez [`supabase/orders.sql`](supabase/orders.sql)
(en plus de `schema.sql`). Il crée la table `orders`, lisible uniquement par
votre compte admin (RLS), et écrite uniquement par la fonction du webhook
Stripe (via la clé `service_role`, qui contourne RLS).

### 3. Déployer les fonctions serveur (Supabase Edge Functions)

Le paiement Stripe nécessite un petit bout de code côté serveur (créer une
session de paiement, vérifier la signature du webhook) : impossible de le
faire en toute sécurité depuis le navigateur seul. On utilise les *Edge
Functions* de Supabase, qui restent compatibles avec un hébergement statique
(elles tournent chez Supabase, pas sur votre hébergeur).

1. Installez la [CLI Supabase](https://supabase.com/docs/guides/cli) puis
   connectez-la à votre projet :
   ```bash
   npx supabase login
   npx supabase link --project-ref VOTRE_REF_PROJET
   ```
2. Renseignez les secrets utilisés par les fonctions (remplacez les
   valeurs) :
   ```bash
   npx supabase secrets set \
     STRIPE_SECRET_KEY=sk_test_... \
     SITE_URL=https://votre-domaine.fr \
     SUPABASE_SERVICE_ROLE_KEY=... \
     SUPABASE_URL=https://VOTRE_PROJET.supabase.co
   ```
   `SUPABASE_SERVICE_ROLE_KEY` se trouve dans *Project Settings > API*
   (clé secrète, ne jamais l'exposer côté navigateur). `STRIPE_WEBHOOK_SECRET`
   sera ajouté à l'étape 4.
3. Déployez les deux fonctions :
   ```bash
   npx supabase functions deploy create-checkout-session --no-verify-jwt
   npx supabase functions deploy stripe-webhook --no-verify-jwt
   ```

### 4. Configurer le webhook Stripe

1. Dans le dashboard Stripe, *Développeurs > Webhooks > Ajouter un
   endpoint*.
2. URL de l'endpoint : celle affichée après le déploiement de
   `stripe-webhook` (généralement
   `https://VOTRE_PROJET.supabase.co/functions/v1/stripe-webhook`).
3. Événement à écouter : `checkout.session.completed`.
4. Copiez le **secret de signature** du webhook (`whsec_...`) et ajoutez-le
   aux secrets Supabase :
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 5. Tester puis passer en production

- En mode test Stripe, utilisez une [carte de test](https://stripe.com/docs/testing)
  (ex. `4242 4242 4242 4242`, n'importe quelle date future, n'importe quel
  CVC) pour vérifier tout le tunnel : panier → paiement → page de
  confirmation → commande visible dans l'onglet **Statistiques** de l'admin.
- Une fois satisfait, activez votre compte Stripe (informations bancaires
  de l'association) et remplacez `STRIPE_SECRET_KEY` par la clé **live**
  (`sk_live_...`), puis recréez le webhook en mode live (les webhooks test
  et live sont séparés) et mettez à jour `STRIPE_WEBHOOK_SECRET`.

Si Stripe/Supabase ne sont pas configurés, les boutons du panier affichent
un message d'erreur clair au lieu de planter, et le reste du site continue
de fonctionner normalement.

## Structure du projet

```
src/
  config/
    site.config.ts   # tout le contenu texte + chemins d'images (valeurs par défaut)
    theme.ts          # palette de couleurs (valeurs par défaut + presets)
    admin.ts          # empreinte du mot de passe local (utilisé si Supabase n'est pas configuré)
  lib/
    supabase.ts        # client Supabase (no-op si les variables d'env sont absentes)
    checkout.ts          # appelle la fonction Supabase qui crée la session de paiement Stripe
  context/
    ConfigContext.tsx # fusionne les valeurs par défaut, le cache local et le contenu publié sur Supabase
    CartContext.tsx    # panier de la boutique (persisté en local, partagé sur tout le site)
  admin/               # page d'administration (login + onglets d'édition + publication + statistiques)
  components/
    Header.tsx         Hero.tsx           About.tsx
    Lineup.tsx          InfosPratiques.tsx Gallery.tsx
    News.tsx             Contact.tsx        Footer.tsx
    Merch.tsx            CartDrawer.tsx     SectionTitle.tsx    icons.tsx
  pages/
    OrderSuccess.tsx     OrderCancelled.tsx # pages de retour après paiement Stripe
  Site.tsx             # assemble les sections de la page publique
  App.tsx              # routes "/" (site), "/admin" et "/commande/*" (paiement)
  main.tsx             # démarre l'app (routeur + contexte de configuration + panier)
public/images/          # images du site (remplaçables)
supabase/
  schema.sql            # contenu du site (à exécuter une fois dans Supabase)
  orders.sql            # table des commandes de la boutique
  functions/
    create-checkout-session/ # Edge Function : crée la session de paiement Stripe
    stripe-webhook/           # Edge Function : enregistre les commandes payées
```


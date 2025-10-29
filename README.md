# benb

## Objectif du projet

benb est une **vitrine marketing interactive** pour une propriété de location haut de gamme construite avec Next.js 14 et TypeScript. L'interface combine un parcours marketing (hero immersif, découverte, présentation détaillée, carte interactive et événements) et des fonctionnalités transactionnelles telles que la consultation des disponibilités et la prise de réservation. Les contenus dynamiques (propriétés, événements, réservations) sont stockés dans Firebase Firestore et consommés côté client avec un mécanisme de repli vers des données par défaut pour garantir une expérience fluide, même en l'absence de connexion à Firestore.

## Stack et organisation

- **Framework** : Next.js 14 (App Router, rendu statique `output: 'export'`).
- **Langage** : TypeScript avec ESLint.
- **UI** : Tailwind CSS et composants Radix UI/Shadcn (Hero, Map, Reservation, etc.).
- **Backend-as-a-Service** : Firebase (Firestore, Storage, Hosting).
- **Gestion des données** : `src/lib/firestore.ts` centralise les accès aux collections en lecture seule et convertit les horodatages Firestore.
- **Fallback hors-ligne** : `app/page.tsx` charge un jeu de données statique si Firestore est indisponible.

## Prérequis

- Node.js **>= 18.17** (compatible Next.js 14) et npm 9+ ou Yarn 1.x.
- Firebase CLI (`npm install -g firebase-tools`) avec un compte Google ayant accès au projet.
- (Optionnel) Emulateurs Firebase installés localement pour le développement hors-ligne.

## Installation rapide

1. **Cloner** le dépôt et installer les dépendances :
   ```bash
   git clone <votre-url-depot>
   cd benb
   npm install    # ou yarn install
   ```
2. **Configurer les variables d'environnement** en copiant le gabarit :
   ```bash
   cp .env.example .env.local
   ```
   Complétez les valeurs (voir section *Configuration Firebase*).
3. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Configuration Firebase

### 1. Créer et lier le projet Firebase

1. Créez un projet Firebase (console.firebase.google.com) et ajoutez une application Web.
2. Activez les services nécessaires :
   - **Cloud Firestore** en mode production (ou test durant le développement).
   - **Cloud Storage** pour les médias.
3. Récupérez la configuration Web (API key, projectId…) et renseignez les variables d'environnement détaillées ci-dessous.
4. Connectez le dépôt au bon projet Firebase :
   ```bash
   firebase login
   firebase use --add    # sélectionnez le projet créé ci-dessus
   ```

### 2. Variables d'environnement

Copiez les champs du SDK Web dans `.env.local` :

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Clé API de l'application Web Firebase. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domaine d'authentification (`<project-id>.firebaseapp.com`). |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Identifiant du projet Firebase. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket Storage (`<project-id>.appspot.com`). |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID expéditeur Cloud Messaging. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Identifiant unique de l'application (format `1:<sender>:web:<id>`). |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | (Optionnel) ID Analytics si Google Analytics est activé. |

> 💡 Les variables sont validées au démarrage avec Zod (`lib/env.ts`). Toute variable manquante provoquera une erreur explicite.

### 3. Données d'exemple et règles

- Les collections utilisées (`properties`, `reservations`, `availability`, `events`) sont définies dans `src/lib/firestore.ts`.
- Vous pouvez importer un jeu de données initial via l'UI Firestore ou un script `firebase firestore:import`.
- Les règles et index sont versionnés dans `firestore.rules` et `firestore.indexes.json`. Déployez-les avec `npm run firebase:deploy:firestore`.

### 4. Emulateurs Firebase

Pour développer sans toucher aux données de production :

```bash
npm run firebase:emulators
```

Les emulateurs démarrent Firestore (8080), Hosting (5000), ainsi qu'une UI (port 4000 par défaut). Adaptez votre code pour pointer vers les emulateurs si nécessaire.

## Commandes de développement

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance Next.js en mode développement (hot reload). |
| `npm run lint` | Analyse le code avec ESLint. |
| `npm run build` | Génère l'export statique de l'application dans `out/`. |
| `npm run analyze` | Construit l'app avec analyse du bundle via @next/bundle-analyzer. |
| `npm run firebase:emulators` | Démarre les emulateurs Firebase configurés dans `firebase.json`. |
| `npm run firebase:deploy` | Lance `npm run build` puis déploie Hosting + Firestore via Firebase CLI. |
| `npm run firebase:deploy:hosting` | Déploie uniquement la partie Hosting. |
| `npm run firebase:deploy:firestore` | Met à jour les règles et index Firestore. |

## Déploiement

1. Vérifiez que vos variables d'environnement de production sont définies dans `.env.local`.
2. Construisez l'export statique :
   ```bash
   npm run build
   ```
   Le dossier `out/` contiendra les fichiers servis par Firebase Hosting.
3. Authentifiez-vous auprès de Firebase puis déployez :
   ```bash
   firebase login          # si ce n'est pas déjà fait
   npm run firebase:deploy
   ```
   - Utilisez `npm run firebase:deploy:hosting` pour ne pousser que les assets statiques.
   - `npm run firebase:deploy:firestore` met à jour les règles/index sans toucher à l'UI.
4. Une fois le déploiement terminé, Firebase Hosting fournit une URL de type `https://<votre-projet>.web.app` ou `https://<votre-projet>.firebaseapp.com`.

## Démo

- **Aperçu local** : [http://localhost:3000](http://localhost:3000) via `npm run dev`.
- **Production** : https://villaroya-eed5f.web.app

## Ressources utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Guide Firebase Hosting + Next.js (export statique)](https://firebase.google.com/docs/hosting/frameworks/nextjs)
- [Tailwind CSS](https://tailwindcss.com/docs)

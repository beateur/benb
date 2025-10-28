# Cloud Functions - Email de Confirmation de Réservation

## 📧 Vue d'ensemble

Cette Cloud Function envoie automatiquement un email de confirmation lorsqu'une nouvelle réservation est créée dans Firestore.

## 🚀 Fonctionnalités

- ✅ Déclenchement automatique sur création de document dans `reservations`
- ✅ Envoi d'email via l'API Resend
- ✅ Template HTML responsive et professionnel
- ✅ Logs détaillés pour le débogage
- ✅ Gestion d'erreurs robuste
- ✅ Configuration sécurisée de la clé API

## 📋 Prérequis

1. **Compte Resend** : Créez un compte sur [resend.com](https://resend.com)
2. **Domaine vérifié** : Ajoutez et vérifiez votre domaine dans Resend
3. **Clé API Resend** : Générez une clé API dans le dashboard Resend
4. **Firebase Blaze Plan** : Les Cloud Functions nécessitent un plan payant

## ⚙️ Configuration

### 1. Configurer la clé API Resend (Sécurisée)

La clé API est stockée de manière sécurisée via Firebase Functions Params :

```bash
# Dans le répertoire racine du projet
firebase functions:secrets:set RESEND_API_KEY
```

Entrez votre clé API Resend lorsque vous y êtes invité.

**Alternative (pour le développement local)** :
```bash
# Créer un fichier .env dans benb-cloud-functions/
echo "RESEND_API_KEY=re_votre_cle_api" > .env
```

### 2. Mettre à jour l'expéditeur de l'email

Dans `src/index.ts`, ligne ~245, remplacez :
```typescript
from: "La Villa Roya <noreply@resend.dev>"
```

Par votre domaine vérifié :
```typescript
from: "La Villa Roya <noreply@votre-domaine-verifie.com>"
```

### 3. Installer les dépendances

```bash
cd benb-cloud-functions
npm install
```

### 4. Compiler le TypeScript

```bash
npm run build
```

## 🚢 Déploiement

### Déployer la fonction

```bash
# Depuis la racine du projet
firebase deploy --only functions

# Ou depuis benb-cloud-functions/
npm run deploy
```

### Vérifier le déploiement

```bash
firebase functions:list
```

Vous devriez voir : `sendReservationConfirmation`

## 🧪 Test

### Test en local avec l'émulateur

```bash
cd benb-cloud-functions
npm run serve
```

Puis créez un document dans Firestore via l'UI de l'émulateur (localhost:4000).

### Test en production

Créez manuellement une réservation dans Firestore Console :

```javascript
{
  "email": "test@example.com",
  "name": "John Doe",
  "guestName": "John Doe",
  "propertyName": "La Villa Roya",
  "checkInDate": Timestamp.now(),
  "checkOutDate": Timestamp.now(),
  "numberOfGuests": 4,
  "totalPrice": 2054,
  "createdAt": Timestamp.now()
}
```

## 📊 Monitoring

### Voir les logs

```bash
# Tous les logs
firebase functions:log

# Logs en temps réel
firebase functions:log --only sendReservationConfirmation
```

### Logs dans la console Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet `benb-74435`
3. Functions → Logs

## 🎨 Personnalisation du Template

Le template HTML se trouve dans la fonction `generateEmailTemplate()` (ligne ~45).

### Éléments personnalisables :
- Couleurs (CSS inline)
- Logo/Image d'en-tête
- Texte de salutation
- Détails de la réservation affichés
- Footer

### Exemple d'ajout d'un logo :
```html
<div class="header">
  <img src="https://votre-domaine.com/logo.png" alt="Logo" style="max-width: 150px; margin-bottom: 20px;">
  <h1>✨ Réservation confirmée</h1>
</div>
```

## 🔧 Structure du Code

```
benb-cloud-functions/
├── src/
│   └── index.ts          # Cloud Function principale
├── lib/                  # Code compilé (généré)
├── package.json
├── tsconfig.json
└── README.md             # Ce fichier
```

### Fonction principale : `sendReservationConfirmation`

**Trigger** : `firestore.document("reservations/{reservationId}").onCreate`

**Paramètres attendus** :
- `email` (requis) : Email du client
- `name` ou `guestName` (recommandé) : Nom du client
- `propertyName` (optionnel) : Nom de la propriété
- `checkInDate` (optionnel) : Date d'arrivée (Timestamp)
- `checkOutDate` (optionnel) : Date de départ (Timestamp)
- `numberOfGuests` (optionnel) : Nombre de voyageurs
- `totalPrice` (optionnel) : Prix total

## 🔒 Sécurité

- ✅ Clé API stockée via Firebase Params/Secrets (non hardcodée)
- ✅ Validation des données entrantes
- ✅ Gestion d'erreurs sans propagation
- ✅ Logs détaillés sans exposer de données sensibles

## 📈 Coûts

**Firebase Functions (Blaze Plan)** :
- 2 millions d'invocations gratuites/mois
- ~0.40$/million d'invocations supplémentaires

**Resend** :
- 3000 emails gratuits/mois (plan gratuit)
- 1$/1000 emails supplémentaires (plan Pro)

## 🆘 Troubleshooting

### Erreur : "RESEND_API_KEY not defined"
```bash
firebase functions:secrets:set RESEND_API_KEY
```

### Erreur : "Domain not verified"
Vérifiez votre domaine dans le dashboard Resend avant d'envoyer des emails.

### Email non reçu
1. Vérifiez les logs : `firebase functions:log`
2. Vérifiez votre dossier spam
3. Vérifiez que l'email est valide dans Firestore

### Fonction ne se déclenche pas
1. Vérifiez le déploiement : `firebase functions:list`
2. Vérifiez le nom de la collection : doit être exactement `reservations`
3. Vérifiez les logs de déploiement

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Firebase Functions v2](https://firebase.google.com/docs/functions)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)

## 🤝 Support

Pour toute question, consultez les logs ou contactez l'équipe de développement.

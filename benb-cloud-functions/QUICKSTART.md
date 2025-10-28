# 🚀 Guide de Démarrage Rapide - Cloud Functions Email

## Configuration en 5 minutes

### 1️⃣ Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit (3000 emails/mois)
3. Ajoutez votre domaine dans Settings → Domains
4. Vérifiez votre domaine (DNS records)
5. Générez une clé API dans Settings → API Keys

### 2️⃣ Configurer la clé API

**Option A : Production (Recommandé)**
```bash
# Depuis la racine du projet
firebase functions:secrets:set RESEND_API_KEY
# Entrez votre clé API quand demandé
```

**Option B : Développement local**
```bash
cd benb-cloud-functions
cp .env.example .env
# Éditez .env et remplacez RESEND_API_KEY par votre vraie clé
```

### 3️⃣ Mettre à jour le domaine d'envoi

Ouvrez `benb-cloud-functions/src/index.ts` et modifiez la ligne ~245 :

```typescript
// AVANT
from: "La Villa Roya <noreply@resend.dev>"

// APRÈS (avec votre domaine vérifié)
from: "La Villa Roya <noreply@votre-domaine.com>"
```

### 4️⃣ Compiler et déployer

```bash
# Depuis la racine du projet
cd benb-cloud-functions
npm run build
npm run deploy

# Ou en une commande depuis la racine
firebase deploy --only functions
```

### 5️⃣ Tester

**Option A : Test manuel dans Firestore Console**

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Firestore Database → Créer un document dans `reservations`
3. Ajoutez les champs suivants :

```json
{
  "email": "votre-email@test.com",
  "guestName": "John Doe",
  "propertyName": "La Villa Roya",
  "numberOfGuests": 4,
  "totalPrice": 2054,
  "checkInDate": <Timestamp>,
  "checkOutDate": <Timestamp>
}
```

4. Sauvegardez → L'email est envoyé automatiquement !

**Option B : Test avec émulateur (local)**

```bash
cd benb-cloud-functions
npm run serve
# Ouvrez http://localhost:4000
# Créez un document dans Firestore via l'UI
```

### 6️⃣ Vérifier les logs

```bash
# Voir les logs en temps réel
firebase functions:log --only sendReservationConfirmation

# Ou dans Firebase Console
# Functions → Logs
```

---

## ✅ Checklist de vérification

- [ ] Compte Resend créé
- [ ] Domaine vérifié dans Resend
- [ ] Clé API configurée (`firebase functions:secrets:set`)
- [ ] Domaine d'envoi mis à jour dans `index.ts`
- [ ] Code compilé (`npm run build`)
- [ ] Fonction déployée (`firebase deploy --only functions`)
- [ ] Test effectué avec succès
- [ ] Email reçu ✉️

---

## 🆘 Problèmes fréquents

**Email non reçu ?**
- Vérifiez le dossier spam
- Vérifiez que le domaine est vérifié dans Resend
- Consultez les logs : `firebase functions:log`

**Erreur de déploiement ?**
- Vérifiez que vous êtes sur le plan Blaze : `firebase projects:list`
- Vérifiez la configuration : `firebase use`

**"RESEND_API_KEY not defined" ?**
```bash
firebase functions:secrets:set RESEND_API_KEY
```

---

## 📞 Besoin d'aide ?

Consultez le [README complet](./README.md) pour plus de détails.

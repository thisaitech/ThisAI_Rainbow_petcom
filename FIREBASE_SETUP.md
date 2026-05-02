# Firebase Setup

This app now uses Firebase as its product backend.

## 1. Enable Firebase services

Turn on these services in your Firebase project:

- Authentication
- Cloud Firestore
- Cloud Storage

## 2. Create admin users

Create Email/Password users in Firebase Authentication for the admin accounts that should manage products.

Default demo emails used by this project:

- `admin@bowpaw.com`
- `owner@bowpaw.com`

If you use different admin emails, update:

- `firestore.rules`
- `storage.rules`

## 3. Add `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is optional.

## 4. Deploy rules

```bash
firebase deploy --only firestore:rules,storage
```

## 5. Runtime behavior

- Storefront catalog loads from Firebase when configured
- Admin create, update, delete, and seed actions write to Firebase
- If Firebase is missing, the app falls back to local browser demo data only
- The old MySQL/Hostinger database backend has been removed

## 6. Hosting

You can still host the frontend wherever you want. For a static export:

```bash
npm run build:static
```

If you deploy with Firebase Hosting:

```bash
firebase deploy
```

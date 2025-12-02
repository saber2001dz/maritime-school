# Guide de Déploiement Vercel - Maritime School

## Problème Résolu
✅ Correction du problème de connexion sur Vercel où l'utilisateur était redirigé vers `/login` après une authentification réussie.

## Modifications Apportées

### 1. Configuration Better-Auth ([lib/auth.ts](lib/auth.ts))
- Ajout de `useSecureCookies: true` pour la production (HTTPS)
- Configuration du cache de session
- Amélioration de la gestion des `trustedOrigins`

### 2. Formulaire de Connexion ([components/login-form.tsx](components/login-form.tsx))
- Ajout de callbacks `onSuccess` et `onError` pour mieux gérer les états
- Ajout d'un délai de 100ms avant la redirection pour assurer que les cookies sont définis
- Ajout de logs console pour le débogage

### 3. Vérification de Session ([lib/dal.ts](lib/dal.ts))
- Ajout de logs en production pour diagnostiquer les problèmes de session
- Meilleure gestion des erreurs

### 4. Endpoints de Débogage
- `/api/debug` : Vérifier la configuration des variables d'environnement
- `/api/test-session` : Tester l'état de la session et des cookies

## Configuration Vercel

### Variables d'Environnement Requises

Dans **Vercel Dashboard → Settings → Environment Variables**, configurez :

```env
# Base de données Neon (Production)
DATABASE_URL=postgresql://neondb_owner:npg_acVzu5lJg6OR@ep-summer-thunder-agycz7q4-pooler.c-2.eu-central-1.aws.neon.tech/MaritimeSchool?sslmode=require

DIRECT_URL=postgresql://neondb_owner:npg_acVzu5lJg6OR@ep-summer-thunder-agycz7q4.c-2.eu-central-1.aws.neon.tech/MaritimeSchool?sslmode=require

# Better-Auth Configuration
BETTER_AUTH_SECRET=2TfmY1cVvs18fD0JP5ZPGIbARTu2Ftue6ngR0CVWg/0=

# IMPORTANT: Remplacez par votre URL Vercel réelle
BETTER_AUTH_URL=https://votre-app.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://votre-app.vercel.app

# API Neon (optionnel)
NEON_API_KEY=napi_4fst6dfgnmz995xxzfnwf75dg7a1a68az6yfv3szrb4fo6yg3t002pkdfkf5rgqd
```

**⚠️ IMPORTANT**:
- Remplacez `https://votre-app.vercel.app` par votre vraie URL Vercel
- Assurez-vous que les URLs n'ont PAS de slash final (`/`)
- Configurez ces variables pour **tous les environnements** (Production, Preview, Development)

## Étapes de Déploiement

### 1. Vérifier le Build en Local
```bash
npm run build
```

### 2. Configurer les Variables dans Vercel
1. Accédez à votre projet sur Vercel
2. Allez dans **Settings** → **Environment Variables**
3. Ajoutez toutes les variables listées ci-dessus
4. Cliquez sur **Save** pour chaque variable

### 3. Déployer sur Vercel
```bash
# Via Git (recommandé)
git add .
git commit -m "Fix: Configuration Better-Auth pour production Vercel"
git push origin main

# OU via CLI Vercel
vercel --prod
```

### 4. Vérifier la Configuration
Après le déploiement, visitez ces URLs pour vérifier :

1. **Configuration générale** :
   ```
   https://votre-app.vercel.app/api/debug
   ```
   Vérifiez que :
   - `hasAuthSecret: true`
   - `authUrl` et `publicAuthUrl` sont correctement définis
   - `hasDatabaseUrl: true`

2. **Test de session** :
   ```
   https://votre-app.vercel.app/api/test-session
   ```
   Avant connexion : devrait afficher `hasSessionToken: false`

### 5. Tester la Connexion

1. Allez sur `https://votre-app.vercel.app/login`
2. Connectez-vous avec : `admin@maritime.gn`
3. Ouvrez la console du navigateur (F12) pour voir les logs
4. Vérifiez que vous êtes redirigé vers `/principal`

### 6. Vérifier la Session Après Connexion
```
https://votre-app.vercel.app/api/test-session
```
Devrait maintenant afficher :
- `hasSessionToken: true`
- `sessionValid: true`
- `userEmail: "admin@maritime.gn"`

## Déboguer les Problèmes

### Problème : Toujours redirigé vers `/login`

**1. Vérifier les cookies dans le navigateur**
- F12 → Application → Cookies
- Cherchez `better-auth.session_token`
- Vérifiez que le cookie est présent et a les attributs `Secure` et `SameSite=Lax`

**2. Vérifier les logs Vercel**
```bash
vercel logs --follow
```
Recherchez les messages :
- "Vérification session - Token présent: false" → Cookie non défini
- "Session invalide ou expirée" → Problème de validation de session
- "Session valide pour l'utilisateur: ..." → ✅ Tout fonctionne

**3. Vérifier la configuration des variables**
```
https://votre-app.vercel.app/api/debug
```

**4. Vérifier que le compte existe dans Neon**
```bash
psql "postgresql://..." -c "SELECT email, role FROM \"User\" WHERE email = 'admin@maritime.gn';"
```

### Problème : Cookies non définis

**Cause possible** : `BETTER_AUTH_URL` ne correspond pas à l'URL du site

**Solution** :
1. Vérifiez que `BETTER_AUTH_URL` = URL exacte de votre site Vercel
2. Pas de slash final
3. Doit commencer par `https://` (pas `http://`)

### Problème : 500 Internal Server Error

**Vérifier** :
1. Variables d'environnement bien configurées
2. `DATABASE_URL` accessible depuis Vercel
3. Logs Vercel pour voir l'erreur exacte

## Nettoyage Post-Déploiement

Une fois que tout fonctionne, **supprimez les endpoints de débogage** :

```bash
rm app/api/debug/route.ts
rm app/api/test-session/route.ts
```

Et supprimez les logs de production dans [lib/dal.ts](lib/dal.ts) :
```typescript
// Supprimer ces blocs
if (process.env.NODE_ENV === "production") {
  console.log(...)
}
```

Puis redéployez.

## Compte de Test

- **Email** : `admin@maritime.gn`
- **Mot de passe** : (votre mot de passe configuré)
- **Rôle** : administrateur

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Vercel : `vercel logs`
2. Vérifiez les endpoints de debug
3. Consultez les logs du navigateur (Console F12)
4. Vérifiez que les cookies sont bien définis

---

**Date de mise à jour** : 2 décembre 2025
**Version** : 1.0

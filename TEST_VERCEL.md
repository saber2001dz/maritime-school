# 🧪 Guide de Test - Connexion Vercel

## Avant de Tester

1. ✅ Variables d'environnement dans Vercel sont correctes (sans slash final)
2. ✅ Code déployé sur Vercel
3. ✅ Build réussi

## Tests à Effectuer

### Test 1 : Vérifier la Configuration

**URL** : `https://maritime-school.vercel.app/api/debug`

**Résultat attendu** :
```json
{
  "warnings": ["✅ All good"],
  "config": {
    "authUrlHasTrailingSlash": false,
    "publicAuthUrlHasTrailingSlash": false,
    "hasAuthSecret": true,
    "nodeEnv": "production"
  }
}
```

❌ **Si vous voyez des warnings** : Corrigez les variables dans Vercel et redéployez.

---

### Test 2 : Test de Connexion (Principal)

1. **Ouvrir** : `https://maritime-school.vercel.app/login`
2. **Ouvrir la console** : F12 → Console
3. **Se connecter** avec :
   - Email : `admin@maritime.gn`
   - Password : [votre mot de passe]

**Dans la console, vous devriez voir** :
```
Tentative de connexion...
Connexion réussie
```

**Résultat attendu** :
- ✅ Toast de succès apparaît
- ✅ Redirection vers `/principal`
- ✅ Vous **restez** sur `/principal` (pas de boucle de redirection)

---

### Test 3 : Vérifier le Cookie

Après connexion réussie :

1. **F12** → **Application** (Chrome) ou **Storage** (Firefox)
2. **Cookies** → `https://maritime-school.vercel.app`
3. Cherchez **`better-auth.session_token`**

**Attributs attendus** :
- ✅ `HttpOnly` : ✓ (coché)
- ✅ `Secure` : ✓ (coché)
- ✅ `SameSite` : Lax
- ✅ `Path` : /
- ✅ `Value` : Une longue chaîne de caractères

**Screenshot attendu** :
```
Name: better-auth.session_token
Value: eyJhb...XYZ (long token)
Domain: .maritime-school.vercel.app
Path: /
Expires: [Date dans 7 jours]
HttpOnly: ✓
Secure: ✓
SameSite: Lax
```

❌ **Si le cookie n'existe pas** : Le problème persiste, vérifiez les logs Vercel.

---

### Test 4 : Vérifier la Session

**URL** : `https://maritime-school.vercel.app/api/test-session`

**Résultat attendu** (après connexion) :
```json
{
  "hasSessionToken": true,
  "sessionValid": true,
  "userEmail": "admin@maritime.gn",
  "environment": "production"
}
```

❌ **Si `hasSessionToken: false`** : Le cookie n'est pas envoyé avec les requêtes.
❌ **Si `sessionValid: false`** : Le token est présent mais invalide.

---

### Test 5 : Test de Persistance

1. **Après connexion**, rafraîchir la page (F5)
2. **Résultat attendu** :
   - ✅ Vous restez connecté
   - ✅ Pas de redirection vers `/login`

3. **Fermer le navigateur** et le rouvrir
4. **Aller sur** : `https://maritime-school.vercel.app/principal`
5. **Résultat attendu** :
   - ✅ Vous êtes toujours connecté (si < 7 jours)

---

### Test 6 : Vérifier les Logs Vercel

**Commande** :
```bash
vercel logs --follow
```

**Ou dans Vercel Dashboard** : Votre Projet → Logs

**Logs attendus après connexion** :
```
POST /api/auth-login 200
Cookie défini avec succès pour: admin@maritime.gn

GET /principal 200
Vérification session - Token présent: true
Session valide pour l'utilisateur: admin@maritime.gn
```

---

## Checklist de Validation

- [ ] `/api/debug` affiche "✅ All good"
- [ ] Connexion réussie sans erreur
- [ ] Redirection vers `/principal` fonctionne
- [ ] Pas de boucle de redirection
- [ ] Cookie `better-auth.session_token` présent
- [ ] Cookie a les attributs : `HttpOnly`, `Secure`, `SameSite=Lax`
- [ ] `/api/test-session` affiche `sessionValid: true`
- [ ] Session persiste après refresh (F5)
- [ ] Logs Vercel montrent "Token présent: true"

---

## Débogage en Cas de Problème

### Problème : Cookie non défini

**Symptômes** :
- Connexion réussie mais redirection vers `/login`
- `/api/test-session` → `hasSessionToken: false`

**Solutions** :
1. Vérifier les logs : `vercel logs`
2. Chercher : `Cookie défini avec succès` ou des erreurs
3. Tester l'API directement :
   ```bash
   curl -X POST https://maritime-school.vercel.app/api/auth-login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@maritime.gn","password":"PASSWORD"}' \
     -v | grep Set-Cookie
   ```

### Problème : Cookie défini mais pas envoyé

**Symptômes** :
- Cookie visible dans F12 → Application
- Mais `/api/test-session` → `hasSessionToken: false`

**Solutions** :
1. Vérifier le domaine du cookie (doit être `.maritime-school.vercel.app`)
2. Vérifier l'attribut `SameSite` (doit être `Lax`, pas `Strict`)
3. Vider le cache et les cookies, réessayer

### Problème : Session invalide

**Symptômes** :
- Cookie présent
- `/api/test-session` → `hasSessionToken: true`, `sessionValid: false`

**Solutions** :
1. Vérifier que `BETTER_AUTH_SECRET` est identique en local et Vercel
2. Vérifier que `DATABASE_URL` pointe vers Neon
3. Vérifier dans Neon que la session existe dans la table `Session`

---

## Test de Non-Régression

Après avoir vérifié que tout fonctionne :

1. **Se déconnecter** (si fonctionnalité disponible)
2. **Se reconnecter** → doit fonctionner
3. **Tester avec un mauvais mot de passe** → doit afficher une erreur
4. **Tester avec un email inexistant** → doit afficher une erreur
5. **Accéder à `/principal` sans être connecté** → doit rediriger vers `/login`

---

## Métriques de Succès

✅ **Taux de réussite de connexion** : 100%
✅ **Temps de redirection** : < 500ms
✅ **Persistance de session** : 7 jours
✅ **Pas d'erreurs dans les logs**
✅ **Cookie défini à chaque connexion**

---

**Date** : 2 décembre 2025
**Status** : Guide de test complet

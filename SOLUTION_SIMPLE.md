# Solution Simple - Connexion Vercel

## Changements Effectués

### 1. Retour à Better-Auth Client Simple

**[components/login-form.tsx](components/login-form.tsx)** : Utilisation directe de `signIn.email()` avec `window.location.href` pour la redirection.

```typescript
const { error } = await signIn.email({ email, password })
if (!error) {
  window.location.href = "/principal"
}
```

### 2. Validation de Session Simplifiée

**[lib/dal.ts](lib/dal.ts)** : Utilisation de `headers()` au lieu de manipuler manuellement les cookies.

```typescript
const session = await auth.api.getSession({
  headers: await headers(),
})
```

### 3. Configuration Better-Auth Minimale

**[lib/auth.ts](lib/auth.ts)** : Configuration simple sans options complexes.

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: normalizeUrl(process.env.BETTER_AUTH_URL),
  trustedOrigins: [normalizeUrl(process.env.BETTER_AUTH_URL)],
  plugins: [admin({...})],
  hooks: {...}
})
```

## Variables Vercel

```env
BETTER_AUTH_URL=https://maritime-school.vercel.app
BETTER_AUTH_SECRET=2TfmY1cVvs18fD0JP5ZPGIbARTu2Ftue6ngR0CVWg/0=
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

**Important** : Pas de slash final dans les URLs !

## Déploiement

```bash
git add .
git commit -m "Fix: Solution simple pour connexion Vercel"
git push origin main
```

## Test

1. Connectez-vous sur `https://maritime-school.vercel.app/login`
2. Vérifiez que vous restez sur `/principal`

---

**Version** : Simple et minimale
**Date** : 2 décembre 2025

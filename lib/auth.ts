import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { createAuthMiddleware } from "better-auth/api"
import { admin } from "better-auth/plugins/admin"
import { createAccessControl } from "better-auth/plugins/access"
import { prisma } from "./db"

// Définir les permissions personnalisées pour l'école maritime
const schoolStatements = {
  user: ["create", "list", "update", "delete", "set-role"],
  agent: ["create", "edit", "delete", "view"],
  formation: ["create", "edit", "delete", "view"],
  session: ["list", "revoke"],
}

const schoolAc = createAccessControl(schoolStatements)

// Fonction pour normaliser les URLs (enlever le slash final)
const normalizeUrl = (url: string | undefined): string => {
  if (!url) return "http://localhost:3000"
  return url.replace(/\/$/, "") // Enlève le slash final
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: normalizeUrl(process.env.BETTER_AUTH_URL),
  trustedOrigins: [
    normalizeUrl(process.env.BETTER_AUTH_URL),
    normalizeUrl(process.env.NEXT_PUBLIC_BETTER_AUTH_URL),
  ].filter((url, index, self) => self.indexOf(url) === index), // Remove duplicates
  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // Mettre à jour la session chaque jour
  },
  plugins: [
    admin({
      defaultRole: "agent",
      adminRoles: ["administrateur"],
      ac: schoolAc,
      roles: {
        administrateur: schoolAc.newRole({
          user: ["create", "list", "update", "delete", "set-role"],
          agent: ["create", "edit", "delete", "view"],
          formation: ["create", "edit", "delete", "view"],
          session: ["list", "revoke"],
        }),
        coordinateur: schoolAc.newRole({
          agent: ["edit", "view"],
          formation: ["edit", "view"],
          session: ["list"],
        }),
        formateur: schoolAc.newRole({
          agent: ["view"],
          formation: ["view"],
        }),
        agent: schoolAc.newRole({
          agent: ["view"],
          formation: ["view"],
        }),
      },
    }),
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email") {
        const newSession = ctx.context.newSession
        if (newSession?.user?.id) {
          await prisma.user.update({
            where: { id: newSession.user.id },
            data: { lastLogin: new Date() },
          })
        }
      }
    }),
  },
})

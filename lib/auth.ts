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
  formateur: ["create", "edit", "delete", "view"],
  cours: ["create", "edit", "delete", "view"],
  sessionFormation: ["create", "edit", "delete", "view"],
  agentFormation: ["create", "edit", "delete", "view"],
  coursFormateur: ["create", "edit", "delete", "view"],
  sessionAgent: ["create", "edit", "delete", "view"],
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
  trustedOrigins: [normalizeUrl(process.env.BETTER_AUTH_URL)],
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
          formateur: ["create", "edit", "delete", "view"],
          cours: ["create", "edit", "delete", "view"],
          sessionFormation: ["create", "edit", "delete", "view"],
          agentFormation: ["create", "edit", "delete", "view"],
          coursFormateur: ["create", "edit", "delete", "view"],
          sessionAgent: ["create", "edit", "delete", "view"],
        }),
        direction: schoolAc.newRole({
          agent: ["view"],
          formation: ["view"],
          session: ["list"],
          formateur: ["view"],
          cours: ["view"],
          sessionFormation: ["view"],
          agentFormation: ["view"],
          coursFormateur: ["view"],
          sessionAgent: ["view"],
        }),
        coordinateur: schoolAc.newRole({
          agent: ["edit", "view"],
          formation: ["edit", "view"],
          session: ["list"],
          formateur: ["edit", "view"],
          cours: ["edit", "view"],
          sessionFormation: ["edit", "view"],
          agentFormation: ["edit", "view"],
          coursFormateur: ["edit", "view"],
          sessionAgent: ["edit", "view"],
        }),
        formateur: schoolAc.newRole({
          agent: ["view"],
          formation: ["view"],
          formateur: ["view"],
          cours: ["view"],
          sessionFormation: ["view"],
          agentFormation: ["view"],
          coursFormateur: ["view"],
          sessionAgent: ["view"],
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

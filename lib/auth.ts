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

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  ].filter((url, index, self) => self.indexOf(url) === index), // Remove duplicates
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

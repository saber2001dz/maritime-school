import { prisma } from "./db"

// Définition des permissions par rôle (doit correspondre à lib/auth.ts)
const rolePermissions: Record<string, Record<string, string[]>> = {
  administrateur: {
    user: ["create", "list", "update", "delete", "set-role"],
    agent: ["create", "edit", "delete", "view"],
    formation: ["create", "edit", "delete", "view"],
    session: ["list", "revoke"],
  },
  coordinateur: {
    agent: ["edit", "view"],
    formation: ["edit", "view"],
    session: ["list"],
  },
  formateur: {
    agent: ["view"],
    formation: ["view"],
  },
  agent: {
    agent: ["view"],
    formation: ["view"],
  },
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 * @param userId - ID de l'utilisateur
 * @param resource - Ressource (ex: "user", "agent", "formation")
 * @param action - Action (ex: "create", "edit", "delete", "view")
 * @returns true si l'utilisateur a la permission, false sinon
 */
export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    // Récupérer l'utilisateur et son rôle
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || !user.role) {
      return false
    }

    // Vérifier la permission dans les définitions
    const permissions = rolePermissions[user.role]
    if (!permissions) {
      return false
    }

    const resourcePermissions = permissions[resource]
    if (!resourcePermissions) {
      return false
    }

    return resourcePermissions.includes(action)
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

/**
 * Vérifie si un utilisateur est administrateur
 * @param userId - ID de l'utilisateur
 * @returns true si l'utilisateur est administrateur, false sinon
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    return user?.role === "administrateur"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

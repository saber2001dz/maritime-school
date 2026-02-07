import { NextResponse } from "next/server"
import { prisma } from "./db"

// Définition des permissions par rôle (doit correspondre à lib/auth.ts)
export const rolePermissions: Record<string, Record<string, string[]>> = {
  administrateur: {
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
  },
  direction: {
    agent: ["view"],
    formation: ["view"],
    session: ["list"],
    formateur: ["view"],
    cours: ["view"],
    sessionFormation: ["view"],
    agentFormation: ["view"],
    coursFormateur: ["view"],
    sessionAgent: ["view"],
  },
  coordinateur: {
    agent: ["edit", "view"],
    formation: ["edit", "view"],
    session: ["list"],
    formateur: ["edit", "view"],
    cours: ["edit", "view"],
    sessionFormation: ["edit", "view"],
    agentFormation: ["edit", "view"],
    coursFormateur: ["edit", "view"],
    sessionAgent: ["edit", "view"],
  },
  formateur: {
    agent: ["view"],
    formation: ["view"],
    formateur: ["view"],
    cours: ["view"],
    sessionFormation: ["view"],
    agentFormation: ["view"],
    coursFormateur: ["view"],
    sessionAgent: ["view"],
  },
  agent: {
    agent: ["view"],
    formation: ["view"],
  },
}

/**
 * Vérifie une permission de manière synchrone (sans appel DB)
 * Utilisable côté serveur ET client
 */
export function can(
  role: string | undefined | null,
  resource: string,
  action: string
): boolean {
  if (!role) return false
  const permissions = rolePermissions[role]
  if (!permissions) return false
  const resourcePermissions = permissions[resource]
  if (!resourcePermissions) return false
  return resourcePermissions.includes(action)
}

/**
 * Helper pour les routes API : vérifie auth + permission
 * Retourne 401 si non authentifié, 403 si non autorisé
 */
export async function requirePermission(
  resource: string,
  action: string
): Promise<{
  authorized: boolean
  userId: string | null
  role: string | null
  errorResponse?: NextResponse
}> {
  // Import dynamique pour éviter "server-only" dans les imports statiques client
  const { verifySession } = await import("@/lib/dal")
  const session = await verifySession()

  if (!session.isAuth) {
    return {
      authorized: false,
      userId: null,
      role: null,
      errorResponse: NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      ),
    }
  }

  const role = session.role
  if (!can(role, resource, action)) {
    return {
      authorized: false,
      userId: session.userId,
      role,
      errorResponse: NextResponse.json(
        { error: "ليس لديك صلاحية لهذه العملية" },
        { status: 403 }
      ),
    }
  }

  return {
    authorized: true,
    userId: session.userId,
    role,
  }
}

/**
 * Vérifie si un utilisateur a une permission spécifique (avec appel DB)
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

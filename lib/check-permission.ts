import { NextResponse } from "next/server"
import { prisma } from "./db"
import { can } from "./permissions"
import { loadPermissions } from "./permissions-server"

// Re-export de can depuis permissions.ts
export { can }

/**
 * Helper pour les routes API : vérifie auth + permission
 * Charge la matrice de permissions depuis la DB
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

  const permissionsMap = await loadPermissions()
  const role = session.role
  if (!can(role, resource, action, permissionsMap)) {
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
 */
export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || !user.role) {
      return false
    }

    const permissionsMap = await loadPermissions()
    return can(user.role, resource, action, permissionsMap)
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

/**
 * Vérifie si un utilisateur est administrateur
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

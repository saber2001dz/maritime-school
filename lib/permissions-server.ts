import "server-only"
import { cache } from "react"
import { prisma } from "./db"
import type { PermissionsMap } from "./permissions"

/**
 * Charge la matrice de permissions depuis la DB
 * Caché par requête via React cache() — pas de double appel DB
 */
export const loadPermissions = cache(async (): Promise<PermissionsMap> => {
  const rolePermissions = await prisma.rolePermission.findMany({
    include: { role: true, resource: true },
  })

  const map: PermissionsMap = {}
  for (const rp of rolePermissions) {
    if (!map[rp.role.name]) map[rp.role.name] = {}
    map[rp.role.name][rp.resource.name] = rp.actions
  }
  return map
})

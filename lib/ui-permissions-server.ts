/**
 * UI Permissions - Server Only
 *
 * Fonctions serveur pour charger les permissions UI depuis la base de données
 */

import { cache } from 'react'
import { prisma } from '@/lib/db'
import type { UIPermissionsMap } from './ui-permissions'

/**
 * Charge la map des permissions UI depuis la base de données
 * Utilise React cache() pour éviter les requêtes multiples par request
 *
 * @returns UIPermissionsMap - Map des permissions (roleId -> componentNames[])
 *
 * @example
 * ```typescript
 * // Dans un Server Component
 * import { loadUIPermissions } from '@/lib/ui-permissions-server'
 *
 * const uiPermissionsMap = await loadUIPermissions()
 * ```
 */
export const loadUIPermissions = cache(async (): Promise<UIPermissionsMap> => {
  try {
    // Récupérer toutes les permissions UI activées
    const permissions = await prisma.uIComponentPermission.findMany({
      where: { enabled: true },
      include: {
        role: true,
        component: true,
      },
    })

    // Construire la map: roleId -> componentNames[]
    const map: UIPermissionsMap = {}

    for (const permission of permissions) {
      const roleId = permission.role.id
      const componentName = permission.component.name

      if (!map[roleId]) {
        map[roleId] = []
      }

      map[roleId].push(componentName)
    }

    return map
  } catch (error) {
    console.error('Error loading UI permissions:', error)
    return {}
  }
})

/**
 * Charge les permissions UI pour un rôle spécifique
 *
 * @param roleId - ID du rôle
 * @returns Liste des noms de composants accessibles
 *
 * @example
 * ```typescript
 * const allowedComponents = await loadUIPermissionsForRole(user.roleId)
 * ```
 */
export async function loadUIPermissionsForRole(roleId: string): Promise<string[]> {
  try {
    const permissions = await prisma.uIComponentPermission.findMany({
      where: {
        roleId,
        enabled: true,
      },
      include: {
        component: true,
      },
    })

    return permissions.map(p => p.component.name)
  } catch (error) {
    console.error('Error loading UI permissions for role:', error)
    return []
  }
}

/**
 * Charge tous les composants UI avec leurs catégories
 *
 * @returns Map des composants UI groupés par catégorie
 *
 * @example
 * ```typescript
 * const componentsByCategory = await loadUIComponents()
 * // {
 * //   "Agents": [{ name: "agent_export_excel", displayName: "Export Excel", ... }],
 * //   "Formations": [...]
 * // }
 * ```
 */
export async function loadUIComponents() {
  try {
    const components = await prisma.uIComponent.findMany({
      orderBy: [{ category: 'asc' }, { displayName: 'asc' }],
    })

    const grouped: Record<string, typeof components> = {}

    for (const component of components) {
      if (!grouped[component.category]) {
        grouped[component.category] = []
      }
      grouped[component.category].push(component)
    }

    return grouped
  } catch (error) {
    console.error('Error loading UI components:', error)
    return {}
  }
}

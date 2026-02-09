/**
 * UI Permissions - Client & Server
 *
 * Fonctions pour vérifier l'accès aux composants UI selon les rôles
 */

export type UIPermissionsMap = Record<string, string[]> // roleId -> componentIds[]

/**
 * Vérifie si un rôle a accès à un composant UI spécifique
 *
 * @param roleId - ID du rôle (ou null si pas connecté)
 * @param componentName - Nom technique du composant (ex: "agent_export_excel")
 * @param uiPermissionsMap - Map des permissions UI chargée depuis la DB
 * @returns true si le rôle a accès au composant, false sinon
 *
 * @example
 * ```typescript
 * const canExport = canAccessUIComponent(user.roleId, "agent_export_excel", uiPermissionsMap)
 * if (canExport) {
 *   return <Button>Export Excel</Button>
 * }
 * ```
 */
export function canAccessUIComponent(
  roleId: string | null,
  componentName: string,
  uiPermissionsMap: UIPermissionsMap
): boolean {
  if (!roleId) return false

  const allowedComponents = uiPermissionsMap[roleId] || []
  return allowedComponents.includes(componentName)
}

/**
 * Vérifie si un rôle a accès à plusieurs composants UI
 *
 * @param roleId - ID du rôle
 * @param componentNames - Liste des noms de composants
 * @param uiPermissionsMap - Map des permissions UI
 * @returns Record avec le nom du composant en clé et true/false en valeur
 *
 * @example
 * ```typescript
 * const permissions = canAccessUIComponents(user.roleId, [
 *   "agent_export_excel",
 *   "agent_import_data",
 *   "agent_bulk_edit"
 * ], uiPermissionsMap)
 *
 * // permissions = {
 * //   "agent_export_excel": true,
 * //   "agent_import_data": false,
 * //   "agent_bulk_edit": true
 * // }
 * ```
 */
export function canAccessUIComponents(
  roleId: string | null,
  componentNames: string[],
  uiPermissionsMap: UIPermissionsMap
): Record<string, boolean> {
  if (!roleId) {
    return Object.fromEntries(componentNames.map(name => [name, false]))
  }

  const allowedComponents = uiPermissionsMap[roleId] || []
  return Object.fromEntries(
    componentNames.map(name => [name, allowedComponents.includes(name)])
  )
}

/**
 * Récupère tous les composants accessibles pour un rôle
 *
 * @param roleId - ID du rôle
 * @param uiPermissionsMap - Map des permissions UI
 * @returns Liste des noms de composants accessibles
 *
 * @example
 * ```typescript
 * const allowedComponents = getAllowedUIComponents(user.roleId, uiPermissionsMap)
 * // ["agent_export_excel", "formation_stats", "session_calendar_view"]
 * ```
 */
export function getAllowedUIComponents(
  roleId: string | null,
  uiPermissionsMap: UIPermissionsMap
): string[] {
  if (!roleId) return []
  return uiPermissionsMap[roleId] || []
}

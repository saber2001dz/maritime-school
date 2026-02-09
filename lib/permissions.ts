export type PermissionsMap = Record<string, Record<string, string[]>>

/**
 * Vérifie une permission de manière synchrone (sans appel DB)
 * Utilisable côté serveur ET client
 *
 * @param role - Le rôle de l'utilisateur
 * @param resource - La ressource (ex: "agent", "formation")
 * @param action - L'action (ex: "create", "edit", "delete", "view")
 * @param permissionsMap - La matrice de permissions chargée depuis la DB
 */
export function can(
  role: string | undefined | null,
  resource: string,
  action: string,
  permissionsMap?: PermissionsMap
): boolean {
  if (!role || !permissionsMap) return false
  return permissionsMap[role]?.[resource]?.includes(action) ?? false
}

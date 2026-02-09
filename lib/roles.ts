/**
 * Client-safe role types and helpers
 * No server imports — safe for use in client components
 */

export interface Role {
  id: string
  name: string
  displayName: string
  description: string
  color: string
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
  userCount?: number
  permissions?: string[]
}

// Type for role names
export type RoleName = string

// Default role
export const DEFAULT_ROLE = "agent"

/**
 * Client-safe helper: retourne le displayName d'un rôle à partir d'une liste de rôles
 */
export function getRoleDisplayName(name: string, roles?: Role[]): string {
  if (!roles) return name
  return roles.find((r) => r.name === name)?.displayName || name
}

/**
 * Client-safe helper: retourne la couleur d'un rôle à partir d'une liste de rôles
 */
export function getRoleColor(name: string, roles?: Role[]): string {
  if (!roles) return "gray"
  return roles.find((r) => r.name === name)?.color || "gray"
}

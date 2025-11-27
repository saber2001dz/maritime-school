/**
 * Shared roles configuration
 * Single source of truth for all role definitions across the application
 * Used by Better-Auth access control and UI components
 */

export interface Role {
  name: string
  displayName: string
  description: string
  permissions: string[]
  color: string
}

export const ROLES: readonly Role[] = [
  {
    name: "administrateur",
    displayName: "Administrateur",
    description: "Acces complet a toutes les fonctionnalites du systeme",
    permissions: [
      "Creer des utilisateurs",
      "Gerer les agents",
      "Gerer les formations",
      "Modifier les roles",
      "Revoquer des sessions",
    ],
    color: "purple",
  },
  {
    name: "coordinateur",
    displayName: "Coordinateur",
    description: "Gestion des agents et des formations",
    permissions: [
      "Modifier les agents",
      "Consulter les agents",
      "Modifier les formations",
      "Consulter les formations",
      "Consulter les sessions",
    ],
    color: "blue",
  },
  {
    name: "formateur",
    displayName: "Formateur",
    description: "Consultation des agents et des formations",
    permissions: [
      "Consulter les agents",
      "Consulter les formations",
    ],
    color: "green",
  },
  {
    name: "agent",
    displayName: "Agent",
    description: "Acces de base en lecture seule",
    permissions: [
      "Consulter les agents",
      "Consulter les formations",
    ],
    color: "gray",
  },
] as const

// Helper function to get role by name
export function getRoleByName(name: string): Role | undefined {
  return ROLES.find((role) => role.name === name)
}

// Helper function to get role display name
export function getRoleDisplayName(name: string): string {
  return getRoleByName(name)?.displayName || name
}

// Helper function to validate role
export function isValidRole(name: string): boolean {
  return ROLES.some((role) => role.name === name)
}

// Helper function to get role color
export function getRoleColor(name: string): string {
  return getRoleByName(name)?.color || "gray"
}

// Type for role names
export type RoleName = typeof ROLES[number]["name"]

// Default role
export const DEFAULT_ROLE: RoleName = "agent"

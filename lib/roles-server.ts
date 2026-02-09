import "server-only"
import { prisma } from "./db"
import { cache } from "react"
import type { Role } from "./roles"

/**
 * Charge tous les rôles depuis la DB (caché par requête via React cache)
 */
export const loadRoles = cache(async (): Promise<Role[]> => {
  return prisma.role.findMany({ orderBy: { name: "asc" } })
})

/**
 * Récupère un rôle par son nom
 */
export async function getRoleByName(name: string): Promise<Role | null> {
  return prisma.role.findUnique({ where: { name } })
}

/**
 * Vérifie si un nom de rôle existe en DB
 */
export async function isValidRole(name: string): Promise<boolean> {
  const role = await prisma.role.findUnique({ where: { name } })
  return !!role
}

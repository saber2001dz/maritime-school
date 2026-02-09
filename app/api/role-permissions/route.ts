import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requirePermission } from "@/lib/check-permission"

export async function GET() {
  try {
    const permissions = await prisma.rolePermission.findMany({
      include: {
        role: true,
        resource: true,
      },
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error("Error fetching role permissions:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requirePermission("user", "update")
    if (!auth.authorized) return auth.errorResponse!

    const body = await request.json()
    const { roleId, resourceId, actions, roleName, resourceName, action } = body

    // Support two modes:
    // 1. Toggle single action by name: { roleName, resourceName, action }
    // 2. Set full actions array by ID: { roleId, resourceId, actions }

    let resolvedRoleId = roleId
    let resolvedResourceId = resourceId
    let resolvedActions = actions

    if (roleName && resourceName && action) {
      // Mode 1: Toggle single action by name
      const [role, resource] = await Promise.all([
        prisma.role.findUnique({ where: { name: roleName } }),
        prisma.resource.findUnique({ where: { name: resourceName } }),
      ])

      if (!role) {
        return NextResponse.json({ error: "Rôle non trouvé" }, { status: 404 })
      }
      if (!resource) {
        return NextResponse.json({ error: "Ressource non trouvée" }, { status: 404 })
      }

      // Validate action belongs to resource
      if (!resource.actions.includes(action)) {
        return NextResponse.json({ error: `Action invalide: ${action}` }, { status: 400 })
      }

      resolvedRoleId = role.id
      resolvedResourceId = resource.id

      // Get current actions and toggle
      const existing = await prisma.rolePermission.findUnique({
        where: { roleId_resourceId: { roleId: role.id, resourceId: resource.id } },
      })

      const currentActions = existing?.actions || []
      if (currentActions.includes(action)) {
        resolvedActions = currentActions.filter((a: string) => a !== action)
      } else {
        resolvedActions = [...currentActions, action]
      }
    } else if (roleId && resourceId && Array.isArray(actions)) {
      // Mode 2: Set full actions array by ID
      const [role, resource] = await Promise.all([
        prisma.role.findUnique({ where: { id: roleId } }),
        prisma.resource.findUnique({ where: { id: resourceId } }),
      ])

      if (!role) {
        return NextResponse.json({ error: "Rôle non trouvé" }, { status: 404 })
      }
      if (!resource) {
        return NextResponse.json({ error: "Ressource non trouvée" }, { status: 404 })
      }

      // Validate actions
      const invalidActions = actions.filter((a: string) => !resource.actions.includes(a))
      if (invalidActions.length > 0) {
        return NextResponse.json(
          { error: `Actions invalides: ${invalidActions.join(", ")}` },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: "Paramètres requis: (roleName, resourceName, action) ou (roleId, resourceId, actions)" },
        { status: 400 }
      )
    }

    if (resolvedActions.length === 0) {
      // Si aucune action, supprimer l'entrée
      await prisma.rolePermission.deleteMany({
        where: { roleId: resolvedRoleId, resourceId: resolvedResourceId },
      })
      return NextResponse.json({ success: true, deleted: true })
    }

    // Upsert
    const permission = await prisma.rolePermission.upsert({
      where: { roleId_resourceId: { roleId: resolvedRoleId, resourceId: resolvedResourceId } },
      update: { actions: resolvedActions },
      create: { roleId: resolvedRoleId, resourceId: resolvedResourceId, actions: resolvedActions },
      include: { role: true, resource: true },
    })

    return NextResponse.json(permission)
  } catch (error) {
    console.error("Error updating role permission:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

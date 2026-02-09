import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requirePermission } from "@/lib/check-permission"
import { DEFAULT_ROLE } from "@/lib/roles"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { resource: true },
        },
      },
    })

    if (!role) {
      return NextResponse.json({ error: "Rôle non trouvé" }, { status: 404 })
    }

    return NextResponse.json(role)
  } catch (error) {
    console.error("Error fetching role:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("user", "update")
    if (!auth.authorized) return auth.errorResponse!

    const { id } = await context.params
    const body = await request.json()
    const { displayName, description, color } = body

    const role = await prisma.role.update({
      where: { id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
      },
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error("Error updating role:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("user", "delete")
    if (!auth.authorized) return auth.errorResponse!

    const { id } = await context.params
    const role = await prisma.role.findUnique({ where: { id } })

    if (!role) {
      return NextResponse.json({ error: "Rôle non trouvé" }, { status: 404 })
    }

    if (role.isSystem) {
      return NextResponse.json(
        { error: "Impossible de supprimer un rôle système" },
        { status: 403 }
      )
    }

    // Réassigner les utilisateurs au rôle par défaut
    await prisma.user.updateMany({
      where: { role: role.name },
      data: { role: DEFAULT_ROLE },
    })

    await prisma.role.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting role:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

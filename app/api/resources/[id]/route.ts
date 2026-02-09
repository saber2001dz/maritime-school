import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requirePermission } from "@/lib/check-permission"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const resource = await prisma.resource.findUnique({ where: { id } })

    if (!resource) {
      return NextResponse.json({ error: "Ressource non trouvée" }, { status: 404 })
    }

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Error fetching resource:", error)
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
    const { displayName, description, actions, actionLabels } = body

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(description !== undefined && { description }),
        ...(actions !== undefined && { actions }),
        ...(actionLabels !== undefined && { actionLabels }),
      },
    })

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Error updating resource:", error)
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
    await prisma.resource.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

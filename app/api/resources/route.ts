import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requirePermission } from "@/lib/check-permission"

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission("user", "create")
    if (!auth.authorized) return auth.errorResponse!

    const body = await request.json()
    const { name, displayName, description, actions, actionLabels } = body

    if (!name || !displayName || !actions || !Array.isArray(actions)) {
      return NextResponse.json(
        { error: "Nom, nom d'affichage et actions sont requis" },
        { status: 400 }
      )
    }

    const existing = await prisma.resource.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json(
        { error: "Une ressource avec ce nom existe déjà" },
        { status: 409 }
      )
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        displayName,
        description: description || "",
        actions,
        actionLabels: actionLabels || {},
      },
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error("Error creating resource:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

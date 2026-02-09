import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requirePermission } from "@/lib/check-permission"

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { resource: true },
        },
      },
      orderBy: { name: "asc" },
    })

    // Compter le nombre d'utilisateurs par rôle
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const count = await prisma.user.count({
          where: { role: role.name },
        })

        // Transformer les permissions en format lisible
        const permissionsList = role.permissions.flatMap((rp) =>
          rp.actions.map((action) => `${rp.resource.displayName}: ${action}`)
        )

        return {
          ...role,
          userCount: count,
          permissions: permissionsList,
        }
      })
    )

    return NextResponse.json(rolesWithCounts)
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rôles" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission("user", "create")
    if (!auth.authorized) return auth.errorResponse!

    const body = await request.json()
    const { name, displayName, description, color } = body

    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Le nom et le nom d'affichage sont requis" },
        { status: 400 }
      )
    }

    // Vérifier unicité
    const existing = await prisma.role.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json(
        { error: "Un rôle avec ce nom existe déjà" },
        { status: 409 }
      )
    }

    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        description: description || "",
        color: color || "gray",
      },
    })

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du rôle" },
      { status: 500 }
    )
  }
}

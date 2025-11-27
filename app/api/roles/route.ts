import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ROLES } from "@/lib/roles"

export async function GET() {
  try {
    // Compter le nombre d'utilisateurs par rôle
    const userCounts = await Promise.all(
      ROLES.map(async (role) => {
        const count = await prisma.user.count({
          where: { role: role.name },
        })
        return {
          ...role,
          userCount: count,
        }
      })
    )

    return NextResponse.json(userCounts)
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rôles" },
      { status: 500 }
    )
  }
}

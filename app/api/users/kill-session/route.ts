import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur manquant" }, { status: 400 })
    }

    // Supprimer toutes les sessions actives de l'utilisateur de la base de données
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        userId: userId,
        expiresAt: {
          gte: new Date() // Supprimer uniquement les sessions non expirées
        }
      }
    })

    console.log(`${deletedSessions.count} session(s) terminée(s) pour l'utilisateur: ${userId}`)

    return NextResponse.json({
      success: true,
      message: `${deletedSessions.count} session(s) terminée(s) avec succès`,
      count: deletedSessions.count
    })
  } catch (error) {
    console.error("Erreur lors de la terminaison de la session:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la terminaison de la session" },
      { status: 500 }
    )
  }
}

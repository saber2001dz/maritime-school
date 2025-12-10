import { prisma } from "@/lib/db"
import { computeSessionStatus } from "@/lib/session-utils"
import { SessionTabsClient } from "./session-tabs-client"

export default async function SessionFormationPage() {
  // Récupérer les sessions depuis la base de données avec les formations liées
  const sessions = await prisma.sessionFormation.findMany({
    include: {
      formation: {
        select: {
          id: true,
          formation: true,
          typeFormation: true,
          specialite: true,
        }
      }
    },
    orderBy: {
      dateDebut: 'desc',
    },
  })

  // Récupérer la liste des formations pour le select
  const formations = await prisma.formation.findMany({
    select: {
      id: true,
      formation: true,
    },
    orderBy: {
      formation: 'asc',
    },
  })

  // Calculer le statut pour chaque session côté serveur
  const sessionsWithStatus = sessions.map((session) => ({
    ...session,
    statut: computeSessionStatus(session.dateDebut, session.dateFin)
  }))

  return <SessionTabsClient sessions={sessionsWithStatus} formations={formations} />
}

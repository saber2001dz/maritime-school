import { prisma } from "@/lib/db"
import { computeSessionStatus } from "@/lib/session-utils"
import { SessionTabsClient } from "./session-tabs-client"
import { verifySession } from "@/lib/dal"

export const dynamic = 'force-dynamic'

export default async function SessionFormationPage() {
  const { role } = await verifySession()
  // Récupérer les sessions depuis la base de données avec les formations liées
  const sessions = await prisma.sessionFormation.findMany({
    include: {
      formation: {
        select: {
          id: true,
          formation: true,
          typeFormation: true,
          specialite: true,
          capaciteAbsorption: true,
        }
      },
      agentFormations: {
        select: {
          resultat: true,
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
    statut: computeSessionStatus(session.dateDebut, session.dateFin),
    nombreParticipantsReels: session.agentFormations.filter(
      af => af.resultat !== null && af.resultat !== "لم يلتحق"
    ).length,
  }))

  let userRoleId: string | null = null
  if (role) {
    const roleRecord = await prisma.role.findUnique({ where: { name: role } })
    userRoleId = roleRecord?.id ?? null
  }

  return <SessionTabsClient sessions={sessionsWithStatus} formations={formations} userRole={role} userRoleId={userRoleId} />
}

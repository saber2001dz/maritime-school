import { prisma } from "@/lib/db"
import { computeSessionStatus } from "@/lib/session-utils"
import { SessionTabsClient } from "./session-tabs-client"
import { verifySession } from "@/lib/dal"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SessionFormationPage({ searchParams }: PageProps) {
  const [{ role }] = await Promise.all([verifySession(), searchParams])

  const [sessions, formations, roleRecord] = await Promise.all([
    prisma.sessionFormation.findMany({
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
    }),
    prisma.formation.findMany({
      select: {
        id: true,
        formation: true,
      },
      orderBy: {
        formation: 'asc',
      },
    }),
    role ? prisma.role.findUnique({ where: { name: role } }) : Promise.resolve(null),
  ])

  // Calculer le statut pour chaque session côté serveur
  const sessionsWithStatus = sessions.map((session) => ({
    ...session,
    statut: computeSessionStatus(session.dateDebut, session.dateFin),
    nombreParticipantsReels: session.agentFormations.filter(
      af => af.resultat !== null && af.resultat !== "لم يلتحق"
    ).length,
  }))

  return <SessionTabsClient sessions={sessionsWithStatus} formations={formations} userRole={role} userRoleId={roleRecord?.id ?? null} />
}

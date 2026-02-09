import { prisma } from "@/lib/db"
import { Project } from "@/components/ui/project-data-table"
import SessionAgentClient from "@/components/session-agent-client"
import localFont from "next/font/local"
import { getStatusVariant, getResultatLabel } from "@/lib/resultat-utils"
import { verifySession } from "@/lib/dal"

const notoNaskhArabic = localFont({
  src: "../../../fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

// Interface pour les données de AgentFormation
interface AgentFormationWithAgent {
  id: string
  sessionFormationId: string | null
  resultat: string | null
  agent: {
    nomPrenom: string
    grade: string
    matricule: string
  }
}

// Fonction pour transformer les données de Prisma vers le format Project
function transformSessionAgents(data: AgentFormationWithAgent[]): Project[] {
  const transformedData: Project[] = data.map((item, index) => ({
    id: item.id,
    name: (index + 1).toString(), // ع/ر - Numéro de ligne
    repository: item.agent.nomPrenom, // الإسم و اللقب - Nom et prénom
    team: item.agent.grade, // الرتبة - Grade
    tech: item.agent.matricule, // الــرقـــم - Matricule
    createdAt: "", // Non utilisé
    contributors: "", // Non utilisé
    status: {
      text: getResultatLabel(item.resultat), // النتيجة - Résultat (avec label formaté)
      variant: getStatusVariant(item.resultat),
    },
    formationId: item.sessionFormationId || "", // ID de la session pour l'édition
  }))

  return transformedData
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SessionAgentPage({ searchParams }: PageProps) {
  const { role } = await verifySession()
  // Attendre les searchParams (Next.js 15+)
  const params = await searchParams
  const sessionFormationId = params.sessionFormationId as string | undefined
  const returnUrl = (params.returnUrl as string) || '/session-formation'

  // Récupérer les informations de la session si un sessionFormationId est fourni
  let sessionInfo = null
  let formationId: string | undefined = undefined
  let nombreParticipants: number = 0
  if (sessionFormationId) {
    sessionInfo = await prisma.sessionFormation.findUnique({
      where: { id: sessionFormationId },
      select: {
        reference: true,
        dateDebut: true,
        dateFin: true,
        formationId: true,
        nombreParticipants: true,
        formation: {
          select: {
            formation: true,
          },
        },
      },
    })
    formationId = sessionInfo?.formationId
    nombreParticipants = sessionInfo?.nombreParticipants || 0
  }

  // Récupérer les données directement depuis la base de données (AgentFormation)
  const agentFormations = await prisma.agentFormation.findMany({
    where: sessionFormationId ? { sessionFormationId } : undefined,
    select: {
      id: true,
      sessionFormationId: true,
      resultat: true,
      agent: {
        select: {
          nomPrenom: true,
          grade: true,
          matricule: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  // Transformer les données pour le format attendu par le composant client
  const transformedData = transformSessionAgents(agentFormations)

  return (
    <SessionAgentClient
      initialData={transformedData}
      sessionInfo={sessionInfo}
      notoNaskhArabicClassName={notoNaskhArabic.className}
      returnUrl={returnUrl}
      sessionFormationId={sessionFormationId}
      formationId={formationId}
      nombreParticipants={nombreParticipants}
      userRole={role}
    />
  )
}

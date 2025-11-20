import { ResizableTableWrapper } from "./resizable-table-wrapper"
import { prisma } from "@/lib/db"

export default async function PrincipalPage() {
  // Récupérer les agents depuis la base de données avec leur formation la plus récente
  const agents = await prisma.agent.findMany({
    include: {
      formations: {
        orderBy: { dateDebut: 'desc' },
        take: 1,
        select: { dateDebut: true }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Transformer les données Prisma pour correspondre à l'interface Agent
  const agentsData = agents.map((agent: typeof agents[0]) => ({
    id: agent.id,
    nomPrenom: agent.nomPrenom,
    grade: agent.grade,
    matricule: agent.matricule,
    responsabilite: agent.responsabilite,
    telephone: agent.telephone,
    derniereDateFormation: agent.formations[0]?.dateDebut || "-",
    categorie: agent.categorie as "ضابط سامي" | "ضابط" | "ضابط صف" | "هيئة الرقباء",
    avatar: agent.avatar ?? undefined,
  }))

  return (
    <div className="min-h-screen bg-background py-6 md:py-12">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="mb-8 md:mb-12">
          <ResizableTableWrapper agents={agentsData} />
        </div>
      </div>
    </div>
  )
}

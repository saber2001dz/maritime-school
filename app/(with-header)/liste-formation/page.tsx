import { FormationTableWrapper } from "./formation-table-wrapper"
import { prisma } from "@/lib/db"
import { Server } from "@/components/ui/server-management-table"
import { verifySession } from "@/lib/dal"

export const dynamic = 'force-dynamic'

// Fonction pour convertir le type de formation en status
function getStatusFromType(typeFormation: string): "active" | "paused" | "inactive" {
  switch (typeFormation) {
    case "تكوين إختصاص":
      return "active"
    case "تكوين تخصصي":
      return "paused"
    case "تكوين مستمر":
      return "inactive"
    default:
      return "active"
  }
}

export default async function ListeFormation() {
  const { role } = await verifySession()

  let userRoleId: string | null = null
  if (role) {
    const roleRecord = await prisma.role.findUnique({ where: { name: role } })
    userRoleId = roleRecord?.id ?? null
  }
  // Récupérer les formations depuis la base de données
  const formations = await prisma.formation.findMany({
    orderBy: {
      formation: 'asc', // Tri alphabétique
    },
  })

  // Transformer les données Prisma en format Server
  const formattedFormations: Server[] = formations.map((formation, index) => ({
    id: formation.id,
    number: String(index + 1).padStart(2, "0"),
    serviceName: formation.formation,
    osType: "windows" as const,
    specialite: formation.specialite || "غير محدد",
    dueDate: formation.duree || "غير محدد",
    capaciteAbsorption: formation.capaciteAbsorption || 0,
    status: getStatusFromType(formation.typeFormation),
  }))

  return <FormationTableWrapper formations={formattedFormations} userRole={role} userRoleId={userRoleId} />
}

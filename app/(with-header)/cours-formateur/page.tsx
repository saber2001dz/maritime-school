import { prisma } from "@/lib/db"
import { Project } from "@/components/ui/project-data-table"
import CoursFormateurClient from "@/components/cours-formateur-client"
import localFont from "next/font/local"

const notoNaskhArabic = localFont({
  src: "../../fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

// Fonction pour transformer les données de Prisma vers le format Project
function transformCoursFormateurs(data: any[]): Project[] {
  const transformedData: Project[] = data.map((item) => ({
    id: item.id,
    name: item.cours.titre,
    repository: item.cours.titre, // الدرس - Nom du cours
    team: item.dateDebut, // تاريخ البداية - Date de début
    tech: item.dateFin, // تاريخ النهاية - Date de fin
    createdAt: item.reference || "-", // المــرجــــــــع - Référence
    contributors: item.nombreHeures.toString(), // عدد الساعات - Nombre d'heures
    status: {
      text: "مكتمل", // Statut par défaut
      variant: "success" as const,
    },
    formationId: item.coursId, // ID du cours pour l'édition
  }))

  // Trier par date de début du plus récent au moins récent
  transformedData.sort((a, b) => {
    const dateA = new Date(a.team)
    const dateB = new Date(b.team)
    return dateB.getTime() - dateA.getTime()
  })

  return transformedData
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CoursFormateurPage({ searchParams }: PageProps) {
  // Attendre les searchParams (Next.js 15+)
  const params = await searchParams
  const formateurId = params.formateurId as string | undefined

  // Récupérer les informations du formateur si un formateurId est fourni
  let formateurInfo = null
  if (formateurId) {
    formateurInfo = await prisma.formateur.findUnique({
      where: { id: formateurId },
      select: {
        grade: true,
        nomPrenom: true,
      },
    })
  }

  // Récupérer les données directement depuis la base de données
  const coursFormateurs = await prisma.coursFormateur.findMany({
    where: formateurId ? { formateurId } : undefined,
    include: {
      cours: true,
      formateur: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Transformer les données pour le format attendu par le composant client
  const transformedData = transformCoursFormateurs(coursFormateurs)

  return (
    <CoursFormateurClient
      initialData={transformedData}
      formateurInfo={formateurInfo}
      notoNaskhArabicClassName={notoNaskhArabic.className}
    />
  )
}

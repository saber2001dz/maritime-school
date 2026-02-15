import { ResizableTableWrapper } from "./resizable-table-wrapper"
import { prisma } from "@/lib/db"
import { verifySession } from "@/lib/dal"

export const dynamic = 'force-dynamic'

export default async function ListeFormateurPage() {
  const { role } = await verifySession()
  // Récupérer les formateurs depuis la base de données
  const formateurs = await prisma.formateur.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Transformer les données Prisma pour correspondre à l'interface Formateur
  const formateursData = formateurs.map((formateur) => ({
    id: formateur.id,
    nomPrenom: formateur.nomPrenom,
    grade: formateur.grade,
    unite: formateur.unite,
    responsabilite: formateur.responsabilite,
    telephone: formateur.telephone,
    RIB: formateur.RIB,
  }))

  return (
    <div className="bg-background py-6 md:py-10">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="pb-6 pr-29">
          <h1 className="text-2xl font-bold mb-1 text-right">قــائمــة المـكــونيـــن</h1>
          <p className="text-sm text-muted-foreground mb-6 text-right">
            استعرض وإدارة جميع المكونين بالمدرسة البحرية
          </p>
        </div>

        <div className="mb-8 md:mb-12 px-8">
          <ResizableTableWrapper formateurs={formateursData} userRole={role} />
        </div>
      </div>
    </div>
  )
}

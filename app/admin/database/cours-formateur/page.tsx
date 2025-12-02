import { prisma } from '@/lib/db'
import { CoursFormateursTableWrapper } from './cours-formateurs-table-wrapper'


async function getCoursFormateurs() {
  const coursFormateurs = await prisma.coursFormateur.findMany({
    include: {
      formateur: true,
      cours: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return coursFormateurs
}

export default async function CoursFormateursPage() {
  const coursFormateurs = await getCoursFormateurs()

  return (
    <div className="flex flex-col">
      <div className="py-6 px-8">
        <h1 className="text-2xl font-bold mb-2">Liste des Cours par Formateur</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Consultez et gérez toutes les affectations de cours aux formateurs.
        </p>
      </div>

      <div className='px-8'>
        <CoursFormateursTableWrapper
          coursFormateurs={coursFormateurs}
        />
      </div>
    </div>
  )
}

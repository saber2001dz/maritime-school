import { prisma } from '@/lib/db'
import { FormateursTableWrapper } from './formateurs-table-wrapper'


async function getFormateurs() {
  const formateurs = await prisma.formateur.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return formateurs
}

export default async function ListeFormateursPage() {
  const formateurs = await getFormateurs()

  return (
    <div className="flex flex-col">
      <div className="py-6 px-8">
        <h1 className="text-2xl font-bold mb-2">Liste des Formateurs</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Consultez et gérez tous les formateurs de l'école maritime.
        </p>
      </div>

      <div className='px-8'>
        <FormateursTableWrapper
          formateurs={formateurs}
        />
      </div>
    </div>
  )
}

import { prisma } from '@/lib/db'
import { FormationsTableWrapper } from './formations-table-wrapper'


async function getFormations() {
  const formations = await prisma.formation.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return formations
}

export default async function ListeFormationsPage() {
  const formations = await getFormations()

  return (
    <div className="flex flex-col">
      <div className="py-6 px-8">
        <h1 className="text-2xl font-bold mb-2">Liste des Formations</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Consultez et gérez toutes les formations de l'école maritime.
        </p>
      </div>

      <div className='px-8'>
        <FormationsTableWrapper
          formations={formations}
        />
      </div>
    </div>
  )
}

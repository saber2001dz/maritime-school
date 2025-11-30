import { prisma } from '@/lib/db'
import { CoursTableWrapper } from './cours-table-wrapper'

async function getCours() {
  return await prisma.cours.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export default async function ListeCoursPage() {
  const cours = await getCours()

  return (
    <div className="flex flex-col">
      <div className="py-6 px-8">
        <h1 className="text-2xl font-bold mb-2">Liste des Cours</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Consultez et gérez tous les cours de l'école maritime.
        </p>
      </div>

      <div className='px-8'>
        <CoursTableWrapper cours={cours} />
      </div>
    </div>
  )
}

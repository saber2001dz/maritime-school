import { prisma } from '@/lib/db'
import { AgentsTable } from './agents-table'

async function getAgents() {
  const agents = await prisma.agent.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return agents
}

export default async function ListeAgentsPage() {
  const agents = await getAgents()

  return (
    <div className="flex flex-col">
      <div className="py-6 px-8">
        <h1 className="text-2xl font-bold mb-2">Liste des Agents</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Consultez et gérez tous les agents de l'école maritime.
        </p>
      </div>

      <div className='px-8'>
        <AgentsTable
          agents={agents}
          enableAnimations={true}
          className='max-w-none'
        />
      </div>
    </div>
  )
}

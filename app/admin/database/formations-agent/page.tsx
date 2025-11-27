import { prisma } from '@/lib/db'
import { FormationsAgentTableWrapper } from './formations-agent-table-wrapper'

async function getAgentFormations() {
  const agentFormations = await prisma.agentFormation.findMany({
    include: {
      agent: true,
      formation: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return agentFormations
}

export default async function FormationsAgentPage() {
  const agentFormations = await getAgentFormations()

  return (
    <div className="flex flex-col">
      <div className="py-6 px-8">
        <h1 className="text-2xl font-bold mb-2">Liste des Formations Agent</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Consultez et gérez toutes les formations attribuées aux agents.
        </p>
      </div>

      <div className='px-8'>
        <FormationsAgentTableWrapper
          agentFormations={agentFormations}
        />
      </div>
    </div>
  )
}

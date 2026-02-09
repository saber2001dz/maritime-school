import { prisma } from '@/lib/db'
import { PermissionsTableWrapper } from './permissions-table-wrapper'


async function getPermissionsData() {
  // Charger les ressources depuis la DB
  const dbResources = await prisma.resource.findMany({
    orderBy: { name: "asc" },
  })

  // Charger les rôles avec leurs permissions
  const dbRoles = await prisma.role.findMany({
    include: {
      permissions: {
        include: { resource: true },
      },
    },
  })

  // Ordre personnalisé des rôles
  const roleOrder = [
    'administrateur',
    'coordinateur',
    'formateur',
    'direction',
    'agent',
  ]

  // Trier les rôles selon l'ordre personnalisé
  const sortedDbRoles = roleOrder
    .map(roleName => dbRoles.find(r => r.name === roleName))
    .filter(Boolean) as typeof dbRoles

  // Récupérer le nombre d'utilisateurs par rôle
  const userCounts = await Promise.all(
    sortedDbRoles.map(async (role) => {
      const count = await prisma.user.count({
        where: { role: role.name },
      })
      return { role: role.name, count }
    })
  )

  const userCountMap = Object.fromEntries(
    userCounts.map(({ role, count }) => [role, count])
  )

  // Transformer les ressources au format attendu par le composant
  const resources: Record<string, {
    name: string
    description: string
    actions: string[]
    actionLabels: Record<string, string>
  }> = {}

  for (const res of dbResources) {
    resources[res.name] = {
      name: res.displayName,
      description: res.description,
      actions: res.actions,
      actionLabels: (res.actionLabels as Record<string, string>) || {},
    }
  }

  // Transformer les rôles au format attendu par le composant
  const roles = sortedDbRoles.map((role) => {
    const permissions: Record<string, string[]> = {}
    for (const rp of role.permissions) {
      permissions[rp.resource.name] = rp.actions
    }
    return {
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      color: role.color,
      permissions,
      userCount: userCountMap[role.name] || 0,
    }
  })

  return { roles, resources }
}

export default async function PermissionsPage() {
  const { roles, resources } = await getPermissionsData()

  return (
    <div className="flex flex-col">
      <div className="py-6 px-8">
        <h1 className="text-2xl font-bold mb-2">Gestion des Permissions</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Consultez la matrice des permissions et les droits d'accès par rôle.
        </p>
      </div>

      <div className='px-8'>
        <PermissionsTableWrapper
          roles={roles}
          resources={resources}
        />
      </div>
    </div>
  )
}

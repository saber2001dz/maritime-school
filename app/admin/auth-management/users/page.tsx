import { prisma } from '@/lib/db'
import { UsersTableWrapper } from './users-table-wrapper'


async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      accounts: {
        select: {
          password: true
        }
      },
      sessions: {
        where: {
          expiresAt: {
            gte: new Date()
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Transformer les données pour inclure le password et le statut de session active
  return users.map(user => ({
    ...user,
    password: user.accounts[0]?.password || '********',
    hasActiveSession: user.sessions.length > 0,
    sessions: undefined // Retirer les sessions des données envoyées au client
  }))
}

async function getRolesWithCounts() {
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
  })

  const rolesWithCounts = await Promise.all(
    roles.map(async (role) => {
      const count = await prisma.user.count({
        where: { role: role.name },
      })
      return {
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        color: role.color,
        isSystem: role.isSystem,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        userCount: count,
      }
    })
  )
  return rolesWithCounts
}

export default async function UsersPage() {
  const users = await getUsers()
  const rolesWithCounts = await getRolesWithCounts()

  return (
    <div className="flex flex-col">
      <div className="py-6 px-8">
        <h1 className="text-2xl font-bold mb-2">Gestion des Utilisateurs</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Consultez et gérez tous les utilisateurs de la plateforme.
        </p>
      </div>

      <div className='px-8'>
        <UsersTableWrapper
          users={users}
          roles={rolesWithCounts}
        />
      </div>
    </div>
  )
}

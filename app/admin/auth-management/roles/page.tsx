import { prisma } from "@/lib/db"
import RolesTableWrapper from "./roles-table-wrapper"


async function getRolesWithCounts() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: { resource: true },
      },
    },
  })

  const rolesWithCounts = await Promise.all(
    roles.map(async (role) => {
      const count = await prisma.user.count({
        where: { role: role.name },
      })
      // Flatten permissions to string[] for display
      const permissionsList: string[] = []
      for (const rp of role.permissions) {
        for (const action of rp.actions) {
          permissionsList.push(`${rp.resource.displayName}: ${action}`)
        }
      }
      return {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        color: role.color,
        isSystem: role.isSystem,
        permissions: permissionsList,
        userCount: count,
      }
    })
  )

  // Custom role order: Administrateur → Service Programmation → Service Formation → Direction → Agent
  const roleOrder = [
    "administrateur",
    "coordinateur",
    "formateur",
    "direction",
    "agent",
  ]

  return rolesWithCounts.sort((a, b) => {
    const indexA = roleOrder.indexOf(a.name)
    const indexB = roleOrder.indexOf(b.name)
    // If role not in custom order, push to end
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })
}

async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { name: "asc" },
  })

  return users
}

export default async function RolesPage() {
  const rolesWithCounts = await getRolesWithCounts()
  const users = await getAllUsers()

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-2xl font-bold mb-2">Gestion des roles</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerez les roles et les permissions des utilisateurs
        </p>
      </div>

      <RolesTableWrapper roles={rolesWithCounts} users={users} />
    </div>
  )
}

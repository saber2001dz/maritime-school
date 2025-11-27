import { prisma } from "@/lib/db"
import { ROLES } from "@/lib/roles"
import RolesTableWrapper from "./roles-table-wrapper"

async function getRolesWithCounts() {
  const rolesWithCounts = await Promise.all(
    ROLES.map(async (role) => {
      const count = await prisma.user.count({
        where: { role: role.name },
      })
      return {
        ...role,
        userCount: count,
      }
    })
  )

  return rolesWithCounts
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Gestion des roles</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerez les roles et les permissions des utilisateurs
        </p>
      </div>

      <RolesTableWrapper roles={rolesWithCounts} users={users} />
    </div>
  )
}

import { prisma } from '@/lib/db'
import { PermissionsTableWrapper } from './permissions-table-wrapper'


// Définir les ressources et actions depuis Better-Auth
const resources = {
  user: {
    name: "Utilisateurs",
    description: "Gestion des comptes utilisateurs",
    actions: ["create", "list", "update", "delete", "set-role"],
    actionLabels: {
      create: "Créer",
      list: "Lister",
      update: "Modifier",
      delete: "Supprimer",
      "set-role": "Définir le rôle"
    }
  },
  agent: {
    name: "Agents",
    description: "Gestion des agents maritimes",
    actions: ["create", "edit", "delete", "view"],
    actionLabels: {
      create: "Créer",
      edit: "Modifier",
      delete: "Supprimer",
      view: "Consulter"
    }
  },
  formation: {
    name: "Formations",
    description: "Gestion des formations",
    actions: ["create", "edit", "delete", "view"],
    actionLabels: {
      create: "Créer",
      edit: "Modifier",
      delete: "Supprimer",
      view: "Consulter"
    }
  },
  session: {
    name: "Sessions",
    description: "Gestion des sessions utilisateur",
    actions: ["list", "revoke"],
    actionLabels: {
      list: "Lister",
      revoke: "Révoquer"
    }
  }
}

// Définir les rôles et leurs permissions (depuis lib/auth.ts)
const roles = [
  {
    name: "administrateur",
    displayName: "Administrateur",
    description: "Accès complet à toutes les fonctionnalités du système",
    color: "purple",
    permissions: {
      user: ["create", "list", "update", "delete", "set-role"],
      agent: ["create", "edit", "delete", "view"],
      formation: ["create", "edit", "delete", "view"],
      session: ["list", "revoke"],
    }
  },
  {
    name: "coordinateur",
    displayName: "Coordinateur",
    description: "Gestion des agents et des formations",
    color: "blue",
    permissions: {
      user: [],
      agent: ["edit", "view"],
      formation: ["edit", "view"],
      session: ["list"],
    }
  },
  {
    name: "formateur",
    displayName: "Formateur",
    description: "Consultation des agents et des formations",
    color: "green",
    permissions: {
      user: [],
      agent: ["view"],
      formation: ["view"],
      session: [],
    }
  },
  {
    name: "agent",
    displayName: "Agent",
    description: "Accès de base en lecture seule",
    color: "gray",
    permissions: {
      user: [],
      agent: ["view"],
      formation: ["view"],
      session: [],
    }
  },
]

async function getPermissionsData() {
  // Récupérer le nombre d'utilisateurs par rôle
  const userCounts = await Promise.all(
    roles.map(async (role) => {
      const count = await prisma.user.count({
        where: { role: role.name },
      })
      return {
        role: role.name,
        count
      }
    })
  )

  const userCountMap = Object.fromEntries(
    userCounts.map(({ role, count }) => [role, count])
  )

  // Enrichir les rôles avec le nombre d'utilisateurs
  const rolesWithCounts = roles.map(role => ({
    ...role,
    userCount: userCountMap[role.name] || 0
  }))

  return {
    roles: rolesWithCounts,
    resources
  }
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

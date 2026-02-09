import { prisma } from '@/lib/db'
import { UIComponentsMatrixWrapper } from './ui-components-matrix-wrapper'

async function getUIComponentsData() {
  // Get all UI components
  const components = await prisma.uIComponent.findMany({
    include: {
      permissions: {
        include: {
          role: true,
        },
      },
    },
    orderBy: [{ category: 'asc' }, { displayName: 'asc' }],
  })

  // Get all roles with custom order
  const allRoles = await prisma.role.findMany()

  // Define custom order: Administrateur - Service Programmation - Service Formation - Direction - Agent
  const roleOrder = [
    'administrateur',
    'coordinateur', // Service Programmation
    'formateur',    // Service Formation
    'direction',
    'agent',
  ]

  const roles = roleOrder
    .map(roleName => allRoles.find(r => r.name === roleName))
    .filter(Boolean) as typeof allRoles

  // Group components by category
  const componentsByCategory: Record<
    string,
    Array<{
      id: string
      name: string
      displayName: string
      description: string
      icon: string
      permissions: Record<string, boolean>
    }>
  > = {}

  for (const component of components) {
    if (!componentsByCategory[component.category]) {
      componentsByCategory[component.category] = []
    }

    // Create permissions map for this component
    const permissionsMap: Record<string, boolean> = {}
    for (const role of roles) {
      const permission = component.permissions.find(p => p.roleId === role.id)
      permissionsMap[role.id] = permission?.enabled || false
    }

    componentsByCategory[component.category].push({
      id: component.id,
      name: component.name,
      displayName: component.displayName,
      description: component.description,
      icon: component.icon,
      permissions: permissionsMap,
    })
  }

  return {
    componentsByCategory,
    roles: roles.map(r => ({
      id: r.id,
      name: r.name,
      displayName: r.displayName,
      color: r.color,
    })),
  }
}

export default async function UIComponentsPage() {
  const { componentsByCategory, roles } = await getUIComponentsData()

  return (
    <div className="flex flex-col">
      <div className="py-6 px-8">
        <h1 className="text-2xl font-bold mb-2">Gestion des Composants UI</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Gérez l'accès aux différents composants de l'interface pour chaque rôle. Les composants sont groupés par page.
        </p>
      </div>

      <div className="px-8">
        <UIComponentsMatrixWrapper
          componentsByCategory={componentsByCategory}
          roles={roles}
        />
      </div>
    </div>
  )
}

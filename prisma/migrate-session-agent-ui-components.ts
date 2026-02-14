import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NEW_COMPONENTS = [
  {
    name: 'session_agent_add_button',
    displayName: 'Bouton Ajouter Agent',
    category: 'Session Agent',
    description: 'Bouton pour ajouter un nouvel agent à la session (sous-page liste des agents)',
    icon: 'CirclePlus',
  },
  {
    name: 'session_agent_delete_button',
    displayName: 'Bouton Supprimer (Options)',
    category: 'Session Agent',
    description: 'Bouton de suppression d\'un agent dans la colonne Options de la liste des agents',
    icon: 'Trash2',
  },
  {
    name: 'session_agent_edit_button',
    displayName: 'Bouton Éditer (Options)',
    category: 'Session Agent',
    description: 'Bouton d\'édition d\'un agent dans la colonne Options de la liste des agents',
    icon: 'SquarePen',
  },
  {
    name: 'session_agent_approve_button',
    displayName: 'Bouton Approuver (Confirmation)',
    category: 'Session Agent',
    description: 'Bouton de confirmation de participation d\'un agent dans la colonne Confirmation de participation',
    icon: 'Check',
  },
  {
    name: 'session_agent_confirmation_dropdown',
    displayName: 'Dropdown Résultat (Confirmation)',
    category: 'Session Agent',
    description: 'Dropdown de la colonne Confirmation de participation pour changer le statut/résultat d\'un agent confirmé',
    icon: 'ChevronDown',
  },
]

// Permissions par rôle
const ROLE_PERMISSIONS: Record<string, string[]> = {
  administrateur: NEW_COMPONENTS.map(c => c.name),
  direction: [],
  coordinateur: NEW_COMPONENTS.map(c => c.name),
  formateur: [
    'session_agent_approve_button',
    'session_agent_confirmation_dropdown',
  ],
  agent: [],
}

async function main() {
  console.log('🔄 Migration: Session Agent UI Components')

  // Créer les nouveaux composants
  console.log('📦 Création des nouveaux composants...')
  const createdComponents: Record<string, string> = {}
  for (const component of NEW_COMPONENTS) {
    const created = await prisma.uIComponent.upsert({
      where: { name: component.name },
      update: {
        displayName: component.displayName,
        category: component.category,
        description: component.description,
        icon: component.icon,
      },
      create: component,
    })
    createdComponents[component.name] = created.id
    console.log(`  ✓ ${created.displayName}`)
  }

  // Attribuer les permissions par rôle
  console.log('🔐 Attribution des permissions...')
  const roles = await prisma.role.findMany()

  for (const role of roles) {
    const allowedComponents = ROLE_PERMISSIONS[role.name] ?? []
    for (const componentName of allowedComponents) {
      const componentId = createdComponents[componentName]
      if (!componentId) continue
      await prisma.uIComponentPermission.upsert({
        where: { roleId_componentId: { roleId: role.id, componentId } },
        update: { enabled: true },
        create: { roleId: role.id, componentId, enabled: true },
      })
    }
    console.log(`  ✓ ${role.displayName} — ${allowedComponents.length} composant(s)`)
  }

  console.log('✨ Migration Session Agent terminée avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const OLD_FORMATEUR_COMPONENTS = [
  'formateur_export_excel',
  'formateur_import_data',
  'formateur_bulk_edit',
  'formateur_print',
]

const NEW_COMPONENTS = [
  {
    name: 'formateur_search_name',
    displayName: 'Recherche Nom et Prénom',
    category: 'Formateurs',
    description: 'Champ de recherche par nom et prénom',
    icon: 'Search',
  },
  {
    name: 'formateur_sort_dropdown',
    displayName: 'Dropdown Tri',
    category: 'Formateurs',
    description: 'Bouton dropdown de tri des formateurs',
    icon: 'ArrowUpDown',
  },
  {
    name: 'formateur_filter_dropdown',
    displayName: 'Dropdown Filtrage',
    category: 'Formateurs',
    description: 'Bouton dropdown de filtrage par grade',
    icon: 'Filter',
  },
  {
    name: 'formateur_export_dropdown',
    displayName: 'Dropdown Exportation',
    category: 'Formateurs',
    description: "Bouton dropdown d'exportation (Excel, CSV, JSON)",
    icon: 'Download',
  },
  {
    name: 'formateur_add_button',
    displayName: 'Ajouter Formateur',
    category: 'Formateurs',
    description: 'Bouton pour ajouter un nouveau formateur',
    icon: 'UserPlus',
  },
  {
    name: 'formateur_action_menu',
    displayName: 'Action (menu ...)',
    category: 'Formateurs',
    description: 'Bouton dropdown d\'actions par ligne (colonne ...)',
    icon: 'MoreVertical',
  },
  {
    name: 'formateur_action_edit',
    displayName: 'Action - Modifier',
    category: 'Formateurs',
    description: "Modifier les données d'un formateur",
    icon: 'SquarePen',
  },
  {
    name: 'formateur_action_cours_list',
    displayName: 'Action - Liste des cours',
    category: 'Formateurs',
    description: "Voir la liste des cours d'un formateur",
    icon: 'GraduationCap',
  },
  {
    name: 'formateur_action_add_cours',
    displayName: 'Action - Ajouter cours',
    category: 'Formateurs',
    description: 'Ajouter un cours à un formateur',
    icon: 'CirclePlus',
  },
  {
    name: 'formateur_action_delete',
    displayName: 'Action - Supprimer',
    category: 'Formateurs',
    description: 'Supprimer un formateur',
    icon: 'Trash2',
  },
]

// Permissions par rôle pour les nouveaux composants
const ROLE_PERMISSIONS: Record<string, string[]> = {
  administrateur: NEW_COMPONENTS.map(c => c.name),
  direction: [
    'formateur_search_name',
    'formateur_filter_dropdown',
    'formateur_export_dropdown',
    'formateur_action_menu',
    'formateur_action_cours_list',
  ],
  coordinateur: NEW_COMPONENTS.map(c => c.name),
  formateur: [
    'formateur_search_name',
    'formateur_filter_dropdown',
    'formateur_action_menu',
    'formateur_action_cours_list',
  ],
  agent: [],
}

async function main() {
  console.log('🔄 Migration: Formateurs UI Components')

  // 1. Supprimer les anciens composants (cascade supprime UIComponentPermission)
  console.log('🗑️  Suppression des anciens composants Formateurs...')
  const deleted = await prisma.uIComponent.deleteMany({
    where: { name: { in: OLD_FORMATEUR_COMPONENTS } },
  })
  console.log(`  ✓ ${deleted.count} composant(s) supprimé(s)`)

  // 2. Créer les nouveaux composants
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

  // 3. Récupérer les rôles et assigner les permissions
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

  console.log('✨ Migration Formateurs terminée avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

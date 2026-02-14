import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const OLD_SESSION_COMPONENTS = [
  'session_drag_drop',
  'session_calendar_view',
  'session_export_excel',
  'session_bulk_edit',
  'session_print',
]

const NEW_COMPONENTS = [
  {
    name: 'session_search_formation',
    displayName: 'Recherche Session (mode table)',
    category: 'Session Formation',
    description: 'Champ de recherche par nom de session/formation (mode affichage table)',
    icon: 'Search',
  },
  {
    name: 'session_search_reference',
    displayName: 'Recherche par Référence (mode table)',
    category: 'Session Formation',
    description: 'Champ de recherche par référence (mode affichage table)',
    icon: 'Search',
  },
  {
    name: 'session_sort_dropdown',
    displayName: 'Dropdown Tri (mode table)',
    category: 'Session Formation',
    description: 'Bouton dropdown de tri des sessions (mode affichage table)',
    icon: 'ArrowUpDown',
  },
  {
    name: 'session_filter_dropdown',
    displayName: 'Dropdown Filtrage (mode table)',
    category: 'Session Formation',
    description: 'Bouton dropdown de filtrage des sessions (mode affichage table)',
    icon: 'Filter',
  },
  {
    name: 'session_year_filter_dropdown',
    displayName: 'Dropdown Filtrage par Année (mode table)',
    category: 'Session Formation',
    description: 'Bouton dropdown de filtrage par année (mode affichage table)',
    icon: 'CalendarDays',
  },
  {
    name: 'session_export_dropdown',
    displayName: 'Dropdown Exportation (mode table)',
    category: 'Session Formation',
    description: "Bouton dropdown d'exportation des sessions (mode affichage table)",
    icon: 'Download',
  },
  {
    name: 'session_add_button_table',
    displayName: 'Ajouter Session (mode table)',
    category: 'Session Formation',
    description: "Bouton d'ajout d'une nouvelle session en mode affichage table",
    icon: 'CirclePlus',
  },
  {
    name: 'session_add_button_planning',
    displayName: 'Ajouter Session (mode planning)',
    category: 'Session Formation',
    description: "Bouton d'ajout d'une nouvelle session en mode affichage planning/calendrier",
    icon: 'Plus',
  },
]

// Permissions par rôle
const ROLE_PERMISSIONS: Record<string, string[]> = {
  administrateur: NEW_COMPONENTS.map(c => c.name),
  direction: [
    'session_search_formation',
    'session_search_reference',
    'session_filter_dropdown',
    'session_year_filter_dropdown',
    'session_export_dropdown',
  ],
  coordinateur: NEW_COMPONENTS.map(c => c.name),
  formateur: [
    'session_search_formation',
    'session_search_reference',
    'session_filter_dropdown',
    'session_year_filter_dropdown',
    'session_add_button_planning',
  ],
  agent: [],
}

async function main() {
  console.log('🔄 Migration: Sessions → Session Formation UI Components')

  // 1. Supprimer les anciens composants
  console.log('🗑️  Suppression des anciens composants Sessions...')
  const deleted = await prisma.uIComponent.deleteMany({
    where: { name: { in: OLD_SESSION_COMPONENTS } },
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

  // 3. Attribuer les permissions par rôle
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

  console.log('✨ Migration Session Formation terminée avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

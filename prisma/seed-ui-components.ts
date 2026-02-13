import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Définition des composants UI groupés par page/section
const uiComponents = [
  // === Agents ===
  {
    name: 'agent_export_excel',
    displayName: 'Export Excel',
    category: 'Agents',
    description: 'Exporter la liste des agents au format Excel',
    icon: 'Download',
  },
  {
    name: 'agent_import_data',
    displayName: 'Import Data',
    category: 'Agents',
    description: 'Importer des agents depuis un fichier',
    icon: 'Upload',
  },
  {
    name: 'agent_bulk_edit',
    displayName: 'Édition en masse',
    category: 'Agents',
    description: 'Modifier plusieurs agents simultanément',
    icon: 'Edit',
  },
  {
    name: 'agent_advanced_filters',
    displayName: 'Filtres avancés',
    category: 'Agents',
    description: 'Utiliser les filtres avancés de recherche',
    icon: 'Filter',
  },
  {
    name: 'agent_print',
    displayName: 'Imprimer',
    category: 'Agents',
    description: 'Imprimer la liste des agents',
    icon: 'Printer',
  },

  // === Formations ===
  {
    name: 'formation_export_excel',
    displayName: 'Export Excel',
    category: 'Formations',
    description: 'Exporter la liste des formations au format Excel',
    icon: 'Download',
  },
  {
    name: 'formation_import_data',
    displayName: 'Import Data',
    category: 'Formations',
    description: 'Importer des formations depuis un fichier',
    icon: 'Upload',
  },
  {
    name: 'formation_stats',
    displayName: 'Voir statistiques',
    category: 'Formations',
    description: 'Accéder aux statistiques des formations',
    icon: 'BarChart',
  },
  {
    name: 'formation_bulk_edit',
    displayName: 'Édition en masse',
    category: 'Formations',
    description: 'Modifier plusieurs formations simultanément',
    icon: 'Edit',
  },
  {
    name: 'formation_print',
    displayName: 'Imprimer',
    category: 'Formations',
    description: 'Imprimer la liste des formations',
    icon: 'Printer',
  },

  // === Sessions ===
  {
    name: 'session_drag_drop',
    displayName: 'Drag & Drop',
    category: 'Sessions',
    description: 'Déplacer les sessions par glisser-déposer',
    icon: 'Move',
  },
  {
    name: 'session_calendar_view',
    displayName: 'Vue calendrier',
    category: 'Sessions',
    description: 'Accéder à la vue calendrier',
    icon: 'Calendar',
  },
  {
    name: 'session_export_excel',
    displayName: 'Export Excel',
    category: 'Sessions',
    description: 'Exporter les sessions au format Excel',
    icon: 'Download',
  },
  {
    name: 'session_bulk_edit',
    displayName: 'Édition en masse',
    category: 'Sessions',
    description: 'Modifier plusieurs sessions simultanément',
    icon: 'Edit',
  },
  {
    name: 'session_print',
    displayName: 'Imprimer',
    category: 'Sessions',
    description: 'Imprimer le planning des sessions',
    icon: 'Printer',
  },

  // === Formateurs ===
  {
    name: 'formateur_export_excel',
    displayName: 'Export Excel',
    category: 'Formateurs',
    description: 'Exporter la liste des formateurs au format Excel',
    icon: 'Download',
  },
  {
    name: 'formateur_import_data',
    displayName: 'Import Data',
    category: 'Formateurs',
    description: 'Importer des formateurs depuis un fichier',
    icon: 'Upload',
  },
  {
    name: 'formateur_bulk_edit',
    displayName: 'Édition en masse',
    category: 'Formateurs',
    description: 'Modifier plusieurs formateurs simultanément',
    icon: 'Edit',
  },
  {
    name: 'formateur_print',
    displayName: 'Imprimer',
    category: 'Formateurs',
    description: 'Imprimer la liste des formateurs',
    icon: 'Printer',
  },

  // === Cours ===
  {
    name: 'cours_export_excel',
    displayName: 'Export Excel',
    category: 'Cours',
    description: 'Exporter la liste des cours au format Excel',
    icon: 'Download',
  },
  {
    name: 'cours_import_data',
    displayName: 'Import Data',
    category: 'Cours',
    description: 'Importer des cours depuis un fichier',
    icon: 'Upload',
  },
  {
    name: 'cours_bulk_edit',
    displayName: 'Édition en masse',
    category: 'Cours',
    description: 'Modifier plusieurs cours simultanément',
    icon: 'Edit',
  },
  {
    name: 'cours_print',
    displayName: 'Imprimer',
    category: 'Cours',
    description: 'Imprimer la liste des cours',
    icon: 'Printer',
  },

  // === Dashboard ===
  {
    name: 'dashboard_view_stats',
    displayName: 'Voir statistiques',
    category: 'Dashboard',
    description: 'Accéder aux statistiques du dashboard',
    icon: 'BarChart',
  },
  {
    name: 'dashboard_export_reports',
    displayName: 'Export rapports',
    category: 'Dashboard',
    description: 'Exporter les rapports du dashboard',
    icon: 'FileText',
  },
  {
    name: 'dashboard_charts',
    displayName: 'Graphiques',
    category: 'Dashboard',
    description: 'Visualiser les graphiques',
    icon: 'PieChart',
  },

  // === Header ===
  {
    name: 'header_admin_settings',
    displayName: 'Paramètres admin (إعدادات)',
    category: 'Header',
    description: 'Accéder au panneau d\'administration depuis le header',
    icon: 'Settings',
  },
]

// Configuration des permissions par défaut pour chaque rôle
const defaultPermissions = {
  administrateur: [
    // Administrateur a accès à TOUT
    ...uiComponents.map(c => c.name),
  ],
  direction: [
    // Direction a accès à la visualisation et export
    'agent_export_excel',
    'agent_advanced_filters',
    'agent_print',
    'formation_export_excel',
    'formation_stats',
    'formation_print',
    'session_calendar_view',
    'session_export_excel',
    'session_print',
    'formateur_export_excel',
    'formateur_print',
    'cours_export_excel',
    'cours_print',
    'dashboard_view_stats',
    'dashboard_export_reports',
    'dashboard_charts',
  ],
  coordinateur: [
    // Coordinateur peut gérer agents, formations et sessions
    'agent_export_excel',
    'agent_import_data',
    'agent_bulk_edit',
    'agent_advanced_filters',
    'agent_print',
    'formation_export_excel',
    'formation_import_data',
    'formation_stats',
    'formation_bulk_edit',
    'formation_print',
    'session_drag_drop',
    'session_calendar_view',
    'session_export_excel',
    'session_bulk_edit',
    'session_print',
    'formateur_export_excel',
    'formateur_print',
    'cours_export_excel',
    'cours_print',
    'dashboard_view_stats',
    'dashboard_charts',
  ],
  formateur: [
    // Formateur peut voir et imprimer
    'agent_print',
    'formation_stats',
    'formation_print',
    'session_calendar_view',
    'session_print',
    'cours_export_excel',
    'cours_print',
    'dashboard_view_stats',
  ],
  agent: [
    // Agent en lecture seule
    'formation_stats',
    'session_calendar_view',
  ],
}

async function main() {
  console.log('🌱 Seeding UI Components...')

  // 1. Créer ou mettre à jour les composants UI
  console.log('📦 Creating UI Components...')
  for (const component of uiComponents) {
    await prisma.uIComponent.upsert({
      where: { name: component.name },
      update: {
        displayName: component.displayName,
        category: component.category,
        description: component.description,
        icon: component.icon,
      },
      create: component,
    })
  }
  console.log(`✅ Created ${uiComponents.length} UI components`)

  // 2. Récupérer tous les rôles
  const roles = await prisma.role.findMany()
  console.log(`👥 Found ${roles.length} roles`)

  // 3. Créer les permissions par défaut pour chaque rôle
  console.log('🔐 Setting up default permissions...')
  for (const role of roles) {
    const componentsForRole = defaultPermissions[role.name as keyof typeof defaultPermissions] || []

    for (const componentName of componentsForRole) {
      const component = await prisma.uIComponent.findUnique({
        where: { name: componentName },
      })

      if (component) {
        await prisma.uIComponentPermission.upsert({
          where: {
            roleId_componentId: {
              roleId: role.id,
              componentId: component.id,
            },
          },
          update: {
            enabled: true,
          },
          create: {
            roleId: role.id,
            componentId: component.id,
            enabled: true,
          },
        })
      }
    }

    console.log(`  ✓ Set permissions for role: ${role.displayName} (${componentsForRole.length} components)`)
  }

  console.log('✨ UI Components seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding UI components:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

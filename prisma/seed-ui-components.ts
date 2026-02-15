import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Définition des composants UI groupés par page/section
const uiComponents = [
  // === Agents ===
  {
    name: 'agent_export_excel',
    displayName: 'Exporter',
    category: 'Agents',
    description: 'Bouton d\'exportation des données',
    icon: 'Download',
  },
  {
    name: 'agent_import_data',
    displayName: 'Recherche nom prénom',
    category: 'Agents',
    description: 'Champ de recherche par nom et prénom',
    icon: 'Search',
  },
  {
    name: 'agent_bulk_edit',
    displayName: 'Trier',
    category: 'Agents',
    description: 'Bouton de tri des agents',
    icon: 'ArrowUpDown',
  },
  {
    name: 'agent_advanced_filters',
    displayName: 'Filtrer',
    category: 'Agents',
    description: 'Bouton de filtrage par catégorie',
    icon: 'Filter',
  },
  {
    name: 'agent_print',
    displayName: 'Recherche par Matricule',
    category: 'Agents',
    description: 'Champ de recherche par matricule',
    icon: 'Hash',
  },
  {
    name: 'agent_add_button',
    displayName: 'Ajouter Agent',
    category: 'Agents',
    description: 'Bouton pour ajouter un nouvel agent',
    icon: 'UserPlus',
  },
  {
    name: 'agent_action_menu',
    displayName: 'Action (menu ...)',
    category: 'Agents',
    description: 'Menu déroulant d\'actions par ligne (colonne ...)',
    icon: 'MoreVertical',
  },
  {
    name: 'agent_action_edit',
    displayName: 'Action - Modifier',
    category: 'Agents',
    description: 'Modifier les données d\'un agent',
    icon: 'SquarePen',
  },
  {
    name: 'agent_action_formations',
    displayName: 'Action - Liste formations',
    category: 'Agents',
    description: 'Voir la liste des formations d\'un agent',
    icon: 'GraduationCap',
  },
  {
    name: 'agent_action_add_formation',
    displayName: 'Action - Ajouter formation',
    category: 'Agents',
    description: 'Ajouter une formation à un agent',
    icon: 'CirclePlus',
  },
  {
    name: 'agent_action_delete',
    displayName: 'Action - Supprimer',
    category: 'Agents',
    description: 'Supprimer un agent',
    icon: 'Trash2',
  },
  {
    name: 'agent_card_edit',
    displayName: 'Card - Modifier les données agent',
    category: 'Agents',
    description: 'Carte de modification des données d\'un agent',
    icon: 'SquarePen',
  },
  {
    name: 'agent_card_edit_save',
    displayName: 'Bouton Enregistrer (Card modifier agent)',
    category: 'Agents',
    description: 'Bouton d\'enregistrement dans la carte de modification des données d\'un agent',
    icon: 'Save',
  },
  {
    name: 'agent_card_add_formation',
    displayName: 'Card - Ajouter une formation à l\'agent',
    category: 'Agents',
    description: 'Carte d\'ajout d\'une formation à un agent',
    icon: 'GraduationCap',
  },
  {
    name: 'agent_card_add_formation_save',
    displayName: 'Bouton Enregistrer (Card ajouter formation)',
    category: 'Agents',
    description: 'Bouton d\'enregistrement dans la carte d\'ajout d\'une formation à un agent',
    icon: 'Save',
  },

  // === Cours Formateur ===
  {
    name: 'cours_formateur_action_edit',
    displayName: 'Bouton Édition (colonne Options)',
    category: 'Cours Formateur',
    description: 'Bouton d\'édition dans la colonne des options de la page cours-formateur',
    icon: 'SquarePen',
  },
  {
    name: 'cours_formateur_card_edit',
    displayName: 'Card - Modifier le cours du formateur',
    category: 'Cours Formateur',
    description: 'Carte de modification d\'un cours d\'un formateur',
    icon: 'Edit',
  },
  {
    name: 'cours_formateur_card_edit_save',
    displayName: 'Bouton Enregistrer (Card modifier cours)',
    category: 'Cours Formateur',
    description: 'Bouton d\'enregistrement dans la carte de modification d\'un cours d\'un formateur',
    icon: 'Save',
  },
  {
    name: 'cours_formateur_card_edit_delete',
    displayName: 'Bouton Supprimer (Card modifier cours)',
    category: 'Cours Formateur',
    description: 'Bouton de suppression dans la carte de modification d\'un cours d\'un formateur',
    icon: 'Trash2',
  },

  // === Formation Agent ===
  {
    name: 'formation_agent_action_edit',
    displayName: 'Bouton Édition (colonne Options)',
    category: 'Formation Agent',
    description: 'Bouton d\'édition dans la colonne des options de la page formation-agent',
    icon: 'SquarePen',
  },
  {
    name: 'formation_agent_card_edit',
    displayName: 'Card - Modifier la formation de l\'agent',
    category: 'Formation Agent',
    description: 'Carte de modification d\'une formation d\'un agent',
    icon: 'Edit',
  },
  {
    name: 'formation_agent_card_edit_save',
    displayName: 'Bouton Enregistrer (Card modifier formation)',
    category: 'Formation Agent',
    description: 'Bouton d\'enregistrement dans la carte de modification d\'une formation d\'un agent',
    icon: 'Save',
  },
  {
    name: 'formation_agent_card_edit_delete',
    displayName: 'Bouton Supprimer (Card modifier formation)',
    category: 'Formation Agent',
    description: 'Bouton de suppression dans la carte de modification d\'une formation d\'un agent',
    icon: 'Trash2',
  },

  // === Formations ===
  {
    name: 'formation_add_button',
    displayName: 'Ajouter Formation',
    category: 'Formations',
    description: 'Bouton pour ajouter une nouvelle formation',
    icon: 'Plus',
  },
  {
    name: 'formation_edit_button',
    displayName: 'Editer Formation',
    category: 'Formations',
    description: 'Bouton pour modifier une formation existante',
    icon: 'Pencil',
  },
  {
    name: 'formation_card_edit',
    displayName: 'Card - Modifier les données formation',
    category: 'Formations',
    description: 'Carte de modification des données d\'une formation',
    icon: 'SquarePen',
  },
  {
    name: 'formation_card_edit_save',
    displayName: 'Bouton Enregistrer (Card modifier formation)',
    category: 'Formations',
    description: 'Bouton d\'enregistrement dans la carte de modification d\'une formation',
    icon: 'Save',
  },
  {
    name: 'formation_card_edit_delete',
    displayName: 'Bouton Supprimer (Card modifier formation)',
    category: 'Formations',
    description: 'Bouton de suppression dans la carte de modification d\'une formation',
    icon: 'Trash2',
  },

  // === Session Formation ===
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
    description: 'Bouton dropdown d\'exportation des sessions (mode affichage table)',
    icon: 'Download',
  },
  {
    name: 'session_add_button_table',
    displayName: 'Ajouter Session (mode table)',
    category: 'Session Formation',
    description: 'Bouton d\'ajout d\'une nouvelle session en mode affichage table',
    icon: 'CirclePlus',
  },
  {
    name: 'session_add_button_planning',
    displayName: 'Ajouter Session (mode planning)',
    category: 'Session Formation',
    description: 'Bouton d\'ajout d\'une nouvelle session en mode affichage planning/calendrier',
    icon: 'Plus',
  },
  {
    name: 'session_dialog_edit_planning',
    displayName: 'Dialogue Édition de session',
    category: 'Session Formation',
    description: 'Dialogue d\'édition d\'une session accessible par double-clic en mode planning',
    icon: 'SquarePen',
  },
  {
    name: 'session_dialog_edit_delete_btn',
    displayName: 'Bouton Supprimer (dialogue édition)',
    category: 'Session Formation',
    description: 'Bouton de suppression d\'une session dans le dialogue d\'édition',
    icon: 'Trash2',
  },
  {
    name: 'session_dialog_edit_save_btn',
    displayName: 'Bouton Enregistrer (dialogue édition)',
    category: 'Session Formation',
    description: 'Bouton d\'enregistrement dans le dialogue d\'édition d\'une session',
    icon: 'Save',
  },
  {
    name: 'session_dialog_add_planning',
    displayName: 'Dialogue Création de session',
    category: 'Session Formation',
    description: 'Dialogue de création d\'une nouvelle session accessible par double-clic en mode planning',
    icon: 'CirclePlus',
  },
  {
    name: 'session_dialog_add_save_btn',
    displayName: 'Bouton Enregistrer (dialogue création)',
    category: 'Session Formation',
    description: 'Bouton d\'enregistrement dans le dialogue de création d\'une session',
    icon: 'Save',
  },
  {
    name: 'session_table_action_menu',
    displayName: 'Bouton Dropdown Actions (colonne ...)',
    category: 'Session Formation',
    description: 'Bouton dropdown d\'actions par ligne (colonne ...) en mode affichage table',
    icon: 'MoreVertical',
  },
  {
    name: 'session_table_action_edit',
    displayName: 'Action - Modifier les données (mode table)',
    category: 'Session Formation',
    description: 'Modifier les données d\'une session depuis le menu dropdown de la colonne ... en mode table',
    icon: 'SquarePen',
  },
  {
    name: 'session_table_action_participants',
    displayName: 'Action - Liste des participants (mode table)',
    category: 'Session Formation',
    description: 'Accéder à la liste des participants d\'une session depuis le menu dropdown de la colonne ... en mode table',
    icon: 'Users',
  },
  {
    name: 'session_table_action_delete',
    displayName: 'Action - Supprimer (mode table)',
    category: 'Session Formation',
    description: 'Supprimer une session depuis le menu dropdown de la colonne ... en mode table',
    icon: 'Trash2',
  },

  // === Session Agent ===
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

  // === Formateurs ===
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
    description: 'Bouton dropdown d\'exportation (Excel, CSV, JSON)',
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
    description: 'Modifier les données d\'un formateur',
    icon: 'SquarePen',
  },
  {
    name: 'formateur_action_cours_list',
    displayName: 'Action - Liste des cours',
    category: 'Formateurs',
    description: 'Voir la liste des cours d\'un formateur',
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
  {
    name: 'formateur_card_edit',
    displayName: 'Card - Modifier les données formateur',
    category: 'Formateurs',
    description: 'Carte de modification des données d\'un formateur',
    icon: 'SquarePen',
  },
  {
    name: 'formateur_card_edit_save',
    displayName: 'Bouton Enregistrer (Card modifier formateur)',
    category: 'Formateurs',
    description: 'Bouton d\'enregistrement dans la carte de modification des données d\'un formateur',
    icon: 'Save',
  },
  {
    name: 'formateur_card_add_cours',
    displayName: 'Card - Ajouter un cours au formateur',
    category: 'Formateurs',
    description: 'Carte d\'ajout d\'un cours à un formateur',
    icon: 'GraduationCap',
  },
  {
    name: 'formateur_card_add_cours_save',
    displayName: 'Bouton Enregistrer (Card ajouter cours)',
    category: 'Formateurs',
    description: 'Bouton d\'enregistrement dans la carte d\'ajout d\'un cours à un formateur',
    icon: 'Save',
  },

  // === Cours ===
  {
    name: 'cours_add_button',
    displayName: 'Ajouter Cours',
    category: 'Cours',
    description: 'Bouton pour ajouter un nouveau cours',
    icon: 'Plus',
  },
  {
    name: 'cours_edit_button',
    displayName: 'Editer Cours',
    category: 'Cours',
    description: 'Bouton pour modifier un cours existant',
    icon: 'Pencil',
  },
  {
    name: 'cours_card_edit',
    displayName: 'Card - Modifier les données cours',
    category: 'Cours',
    description: 'Carte de modification des données d\'un cours',
    icon: 'SquarePen',
  },
  {
    name: 'cours_card_edit_save',
    displayName: 'Bouton Enregistrer (Card modifier cours)',
    category: 'Cours',
    description: 'Bouton d\'enregistrement dans la carte de modification d\'un cours',
    icon: 'Save',
  },
  {
    name: 'cours_card_edit_delete',
    displayName: 'Bouton Supprimer (Card modifier cours)',
    category: 'Cours',
    description: 'Bouton de suppression dans la carte de modification d\'un cours',
    icon: 'Trash2',
  },

  // === Dashboard ===
  {
    name: 'dashboard_chart_period_toggle',
    displayName: 'Groupe de toggle (Évolution des stagiaires)',
    category: 'Dashboard',
    description: 'Boutons de sélection de période (Annuel / 6 mois / 3 mois) dans le graphique d\'évolution des stagiaires',
    icon: 'ToggleLeft',
  },

  // === Header ===
  {
    name: 'header_admin_settings',
    displayName: 'Paramètres admin',
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
    'agent_action_menu',
    'agent_action_formations',
    'session_search_formation',
    'session_search_reference',
    'session_filter_dropdown',
    'session_year_filter_dropdown',
    'session_export_dropdown',
    'session_dialog_edit_planning',
    'session_dialog_edit_save_btn',
    'session_dialog_add_planning',
    'session_dialog_add_save_btn',
    'session_table_action_menu',
    'session_table_action_edit',
    'session_table_action_participants',
    'formateur_search_name',
    'formateur_filter_dropdown',
    'formateur_export_dropdown',
    'formateur_action_menu',
    'formateur_action_cours_list',
    'dashboard_chart_period_toggle',
  ],
  coordinateur: [
    // Coordinateur peut gérer agents, formations et sessions
    'agent_export_excel',
    'agent_import_data',
    'agent_bulk_edit',
    'agent_advanced_filters',
    'agent_print',
    'agent_add_button',
    'agent_action_menu',
    'agent_action_edit',
    'agent_action_formations',
    'agent_action_add_formation',
    'agent_action_delete',
    'agent_card_edit',
    'agent_card_edit_save',
    'agent_card_add_formation',
    'agent_card_add_formation_save',
    'formation_agent_action_edit',
    'formation_agent_card_edit',
    'formation_agent_card_edit_save',
    'formation_agent_card_edit_delete',
    'formation_add_button',
    'formation_edit_button',
    'formation_card_edit',
    'formation_card_edit_save',
    'formation_card_edit_delete',
    'session_search_formation',
    'session_search_reference',
    'session_sort_dropdown',
    'session_filter_dropdown',
    'session_year_filter_dropdown',
    'session_export_dropdown',
    'session_add_button_table',
    'session_add_button_planning',
    'session_dialog_edit_planning',
    'session_dialog_edit_delete_btn',
    'session_dialog_edit_save_btn',
    'session_dialog_add_planning',
    'session_dialog_add_save_btn',
    'session_table_action_menu',
    'session_table_action_edit',
    'session_table_action_participants',
    'session_table_action_delete',
    'session_agent_add_button',
    'session_agent_delete_button',
    'session_agent_edit_button',
    'session_agent_approve_button',
    'session_agent_confirmation_dropdown',
    'formateur_search_name',
    'formateur_sort_dropdown',
    'formateur_filter_dropdown',
    'formateur_export_dropdown',
    'formateur_add_button',
    'formateur_action_menu',
    'formateur_action_edit',
    'formateur_action_cours_list',
    'formateur_action_add_cours',
    'formateur_action_delete',
    'formateur_card_edit',
    'formateur_card_edit_save',
    'formateur_card_add_cours',
    'formateur_card_add_cours_save',
    'cours_formateur_action_edit',
    'cours_formateur_card_edit',
    'cours_formateur_card_edit_save',
    'cours_formateur_card_edit_delete',
    'cours_add_button',
    'cours_edit_button',
    'cours_card_edit',
    'cours_card_edit_save',
    'cours_card_edit_delete',
    'dashboard_chart_period_toggle',
  ],
  formateur: [
    // Formateur peut voir
    'agent_print',
    'session_search_formation',
    'session_search_reference',
    'session_filter_dropdown',
    'session_year_filter_dropdown',
    'session_add_button_planning',
    'session_dialog_edit_planning',
    'session_dialog_edit_save_btn',
    'session_dialog_add_planning',
    'session_dialog_add_save_btn',
    'session_table_action_menu',
    'session_table_action_participants',
    'session_agent_approve_button',
    'session_agent_confirmation_dropdown',
    'formateur_search_name',
    'formateur_filter_dropdown',
    'formateur_action_menu',
    'formateur_action_cours_list',
    'dashboard_chart_period_toggle',
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

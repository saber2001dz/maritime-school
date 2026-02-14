import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NEW_COMPONENTS = [
  // === Agents (liste-agent page) ===
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

  // === Formateurs (liste-formateur page) ===
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

  // === Formations (liste-formation page) ===
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

  // === Cours (liste-cours page) ===
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

  // === Cours Formateur (cours-formateur page) ===
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

  // === Formation Agent (formation-agent page) ===
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
]

// Permissions par rôle pour les nouveaux composants
const ROLE_PERMISSIONS: Record<string, string[]> = {
  administrateur: NEW_COMPONENTS.map(c => c.name),
  direction: [
    // Direction visualise seulement, pas de modification
  ],
  coordinateur: [
    // Coordinateur peut tout gérer
    'agent_card_edit',
    'agent_card_edit_save',
    'agent_card_add_formation',
    'agent_card_add_formation_save',
    'formation_card_edit',
    'formation_card_edit_save',
    'formation_card_edit_delete',
    'cours_card_edit',
    'cours_card_edit_save',
    'cours_card_edit_delete',
    'formateur_card_edit',
    'formateur_card_edit_save',
    'formateur_card_add_cours',
    'formateur_card_add_cours_save',
    'cours_formateur_action_edit',
    'cours_formateur_card_edit',
    'cours_formateur_card_edit_save',
    'cours_formateur_card_edit_delete',
    'formation_agent_action_edit',
    'formation_agent_card_edit',
    'formation_agent_card_edit_save',
    'formation_agent_card_edit_delete',
  ],
  formateur: [
    // Formateur peut voir mais pas modifier
  ],
  agent: [],
}

async function main() {
  console.log('🔄 Migration: Agent UI Components (Cards + Formation Agent subcategory)')

  // 1. Créer les nouveaux composants
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
    console.log(`  ✓ ${created.displayName} [${created.category}]`)
  }

  // 2. Récupérer les rôles et assigner les permissions
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

  console.log('✨ Migration Agent UI Components terminée avec succès!')
  console.log(`   → ${NEW_COMPONENTS.filter(c => c.category === 'Agents').length} composants ajoutés à la catégorie "Agents"`)
  console.log(`   → ${NEW_COMPONENTS.filter(c => c.category === 'Formation Agent').length} composants ajoutés à la nouvelle sous-catégorie "Formation Agent"`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

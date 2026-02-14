import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NEW_COMPONENTS = [
  {
    name: 'session_dialog_edit_planning',
    displayName: 'Dialogue Édition (تعديل الدورة)',
    category: 'Session Formation',
    description: 'Dialogue d\'édition d\'une session accessible par double-clic en mode planning',
    icon: 'SquarePen',
  },
  {
    name: 'session_dialog_edit_delete_btn',
    displayName: 'Bouton Supprimer (تعديل الدورة)',
    category: 'Session Formation',
    description: 'Bouton de suppression d\'une session dans le dialogue d\'édition',
    icon: 'Trash2',
  },
  {
    name: 'session_dialog_edit_save_btn',
    displayName: 'Bouton Enregistrer (تعديل الدورة)',
    category: 'Session Formation',
    description: 'Bouton d\'enregistrement dans le dialogue d\'édition d\'une session',
    icon: 'Save',
  },
  {
    name: 'session_dialog_add_planning',
    displayName: 'Dialogue Création (إنشاء الدورة)',
    category: 'Session Formation',
    description: 'Dialogue de création d\'une nouvelle session accessible par double-clic en mode planning',
    icon: 'CirclePlus',
  },
  {
    name: 'session_dialog_add_save_btn',
    displayName: 'Bouton Enregistrer (إنشاء الدورة)',
    category: 'Session Formation',
    description: 'Bouton d\'enregistrement dans le dialogue de création d\'une session',
    icon: 'Save',
  },
]

// Permissions par rôle
const ROLE_PERMISSIONS: Record<string, string[]> = {
  administrateur: NEW_COMPONENTS.map(c => c.name),
  direction: [
    'session_dialog_edit_planning',
    'session_dialog_edit_save_btn',
    'session_dialog_add_planning',
    'session_dialog_add_save_btn',
  ],
  coordinateur: NEW_COMPONENTS.map(c => c.name),
  formateur: [
    'session_dialog_edit_planning',
    'session_dialog_edit_save_btn',
    'session_dialog_add_planning',
    'session_dialog_add_save_btn',
  ],
  agent: [],
}

async function main() {
  console.log('🔄 Migration: Session Dialogues UI Components')

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

  console.log('✨ Migration Session Dialogues terminée avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

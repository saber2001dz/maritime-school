import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const OLD_DASHBOARD_COMPONENTS = [
  'dashboard_view_stats',
  'dashboard_export_reports',
  'dashboard_charts',
]

const NEW_COMPONENT = {
  name: 'dashboard_chart_period_toggle',
  displayName: 'Groupe de toggle (تطور عدد المتربصين)',
  category: 'Dashboard',
  description: 'Boutons de sélection de période (سنوي / 6 أشهر / 3 أشهر) dans le graphique d\'évolution des stagiaires',
  icon: 'ToggleLeft',
}

// Roles qui doivent avoir accès au nouveau composant
const ROLES_WITH_ACCESS = ['administrateur', 'direction', 'coordinateur', 'formateur']

async function main() {
  console.log('🔄 Migration: Dashboard UI Components')

  // 1. Supprimer les anciens composants (cascade supprime les UIComponentPermission)
  console.log('🗑️  Suppression des anciens composants Dashboard...')
  const deleted = await prisma.uIComponent.deleteMany({
    where: { name: { in: OLD_DASHBOARD_COMPONENTS } },
  })
  console.log(`  ✓ ${deleted.count} composant(s) supprimé(s)`)

  // 2. Créer le nouveau composant
  console.log('📦 Création du nouveau composant...')
  const component = await prisma.uIComponent.upsert({
    where: { name: NEW_COMPONENT.name },
    update: {
      displayName: NEW_COMPONENT.displayName,
      category: NEW_COMPONENT.category,
      description: NEW_COMPONENT.description,
      icon: NEW_COMPONENT.icon,
    },
    create: NEW_COMPONENT,
  })
  console.log(`  ✓ Composant créé : ${component.displayName} (id: ${component.id})`)

  // 3. Récupérer les rôles et assigner les permissions
  console.log('🔐 Attribution des permissions...')
  const roles = await prisma.role.findMany({
    where: { name: { in: ROLES_WITH_ACCESS } },
  })

  for (const role of roles) {
    await prisma.uIComponentPermission.upsert({
      where: {
        roleId_componentId: {
          roleId: role.id,
          componentId: component.id,
        },
      },
      update: { enabled: true },
      create: {
        roleId: role.id,
        componentId: component.id,
        enabled: true,
      },
    })
    console.log(`  ✓ Permission activée pour le rôle: ${role.displayName}`)
  }

  console.log('✨ Migration terminée avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

/**
 * Script de migration pour uniformiser les valeurs de resultat dans AgentFormation
 *
 * Anciennes valeurs → Nouvelles valeurs standardisées :
 * - "نجاح" ou "نجح" → "ناجح"
 * - "متمدرس" → "قيد التكوين"
 * - "رسب" → "راسب"
 * - "انقطع" (inchangé) → "إنقطع"
 * - vide/null → "لم يلتحق"
 *
 * Usage: npx tsx prisma/migrations/update-resultat-values.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Début de la migration des valeurs de resultat...\n')

  // Mapping des anciennes valeurs vers les nouvelles
  const mappings = [
    { old: 'نجاح', new: 'ناجح' },
    { old: 'نجح', new: 'ناجح' },
    { old: 'متمدرس', new: 'قيد التكوين' },
    { old: 'رسب', new: 'راسب' },
    { old: 'انقطع', new: 'إنقطع' },
  ]

  let totalUpdated = 0

  for (const mapping of mappings) {
    console.log(`📝 Migration: "${mapping.old}" → "${mapping.new}"`)

    const result = await prisma.agentFormation.updateMany({
      where: {
        resultat: mapping.old,
      },
      data: {
        resultat: mapping.new,
      },
    })

    console.log(`   ✓ ${result.count} enregistrement(s) mis à jour\n`)
    totalUpdated += result.count
  }

  // Mettre à jour les valeurs vides/null vers "لم يلتحق"
  console.log(`📝 Migration: null/vide → "لم يلتحق"`)
  const nullResult = await prisma.agentFormation.updateMany({
    where: {
      OR: [
        { resultat: null },
        { resultat: '' },
      ],
    },
    data: {
      resultat: 'لم يلتحق',
    },
  })
  console.log(`   ✓ ${nullResult.count} enregistrement(s) mis à jour\n`)
  totalUpdated += nullResult.count

  // Afficher un récapitulatif des valeurs actuelles
  console.log('📊 Récapitulatif des valeurs de resultat après migration:\n')

  const resultatCounts = await prisma.$queryRaw<Array<{ resultat: string; count: bigint }>>`
    SELECT resultat, COUNT(*) as count
    FROM "AgentFormation"
    GROUP BY resultat
    ORDER BY count DESC
  `

  resultatCounts.forEach((row) => {
    console.log(`   - "${row.resultat}": ${row.count} enregistrement(s)`)
  })

  console.log(`\n✅ Migration terminée ! Total: ${totalUpdated} enregistrement(s) mis à jour`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

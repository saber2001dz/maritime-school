/**
 * Script pour corriger les heures des sessions de formation existantes
 *
 * Ce script met à jour toutes les sessions de formation pour qu'elles :
 * - Commencent à 08:00 (heure de début standard des formations)
 * - Se terminent à 17:00 (heure de fin standard des formations)
 *
 * Usage: npx tsx scripts/fix-session-times.ts
 */

import { prisma } from '@/lib/db'

async function fixSessionTimes() {
  console.log('🔧 Début de la correction des heures des sessions...')

  try {
    // Récupérer toutes les sessions
    const sessions = await prisma.sessionFormation.findMany({
      select: {
        id: true,
        dateDebut: true,
        dateFin: true,
        formation: {
          select: {
            formation: true,
          }
        }
      }
    })

    console.log(`📋 ${sessions.length} sessions trouvées\n`)

    let updatedCount = 0
    let skippedCount = 0

    for (const session of sessions) {
      const dateDebut = new Date(session.dateDebut)
      const dateFin = new Date(session.dateFin)

      // Vérifier si les heures sont déjà correctes (09:00 UTC et 18:00 UTC)
      const isStartCorrect = dateDebut.getHours() === 9 && dateDebut.getMinutes() === 0
      const isEndCorrect = dateFin.getHours() === 18 && dateFin.getMinutes() === 0

      if (isStartCorrect && isEndCorrect) {
        console.log(`⏭️  Session "${session.formation.formation}" - Heures déjà correctes (09:00 UTC / 18:00 UTC)`)
        skippedCount++
        continue
      }

      // Créer les nouvelles dates avec les heures corrigées
      // Important: On stocke en UTC car la fonction convertUTCToLocalDate soustrait 1 heure
      // Pour afficher 08:00 local (GMT+1), on doit stocker 09:00 UTC
      // Pour afficher 17:00 local (GMT+1), on doit stocker 18:00 UTC
      const newDateDebut = new Date(dateDebut)
      newDateDebut.setHours(9, 0, 0, 0) // 09:00 UTC → 08:00 GMT+1

      const newDateFin = new Date(dateFin)
      newDateFin.setHours(18, 0, 0, 0) // 18:00 UTC → 17:00 GMT+1

      // Mettre à jour la session
      await prisma.sessionFormation.update({
        where: { id: session.id },
        data: {
          dateDebut: newDateDebut,
          dateFin: newDateFin,
        }
      })

      console.log(`✅ Session "${session.formation.formation}" mise à jour:`)
      console.log(`   Début: ${dateDebut.toLocaleString('fr-FR')} → ${newDateDebut.toLocaleString('fr-FR')}`)
      console.log(`   Fin:   ${dateFin.toLocaleString('fr-FR')} → ${newDateFin.toLocaleString('fr-FR')}\n`)

      updatedCount++
    }

    console.log('\n📊 Résumé:')
    console.log(`   ✅ Sessions mises à jour: ${updatedCount}`)
    console.log(`   ⏭️  Sessions déjà correctes: ${skippedCount}`)
    console.log(`   📋 Total: ${sessions.length}`)
    console.log('\n✨ Correction terminée avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de la correction des sessions:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
fixSessionTimes()

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyAllData() {
  try {
    const formations = await prisma.formation.findMany({
      orderBy: {
        formation: 'asc',
      },
    })

    console.log(`\n📊 Total formations: ${formations.length}\n`)
    console.log('═'.repeat(80))

    formations.forEach((f, index) => {
      console.log(`\n${index + 1}. ${f.formation}`)
      console.log(`   ID: ${f.id}`)
      console.log(`   Type: ${f.typeFormation}`)
      console.log(`   Spécialité: ${f.specialite || 'NULL'}`)
      console.log(`   Durée: ${f.duree || 'NULL'}`)
      console.log(`   Capacité: ${f.capaciteAbsorption || 'NULL'}`)
    })

    console.log('\n' + '═'.repeat(80))

    // Statistiques
    const withSpecialite = formations.filter(f => f.specialite !== null).length
    const withDuree = formations.filter(f => f.duree !== null).length
    const withCapacite = formations.filter(f => f.capaciteAbsorption !== null).length

    console.log('\n📈 Statistiques:')
    console.log(`   Avec spécialité: ${withSpecialite}/${formations.length}`)
    console.log(`   Avec durée: ${withDuree}/${formations.length}`)
    console.log(`   Avec capacité: ${withCapacite}/${formations.length}`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAllData()

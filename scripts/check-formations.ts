import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFormations() {
  try {
    const formations = await prisma.formation.findMany({
      take: 3,
    })

    console.log('Formations dans la base de données:')
    formations.forEach((f) => {
      console.log(`\n- Formation: ${f.formation}`)
      console.log(`  Spécialité: ${f.specialite}`)
      console.log(`  Durée: ${f.duree}`)
      console.log(`  Capacité: ${f.capaciteAbsorption}`)
      console.log(`  Type: ${f.typeFormation}`)
    })
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkFormations()

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateCapacities() {
  try {
    // Récupérer toutes les formations
    const formations = await prisma.formation.findMany()

    console.log(`Mise à jour de ${formations.length} formations...`)

    // Mettre à jour chaque formation avec une capacité aléatoire entre 20 et 30
    for (const formation of formations) {
      const randomCapacity = Math.floor(Math.random() * (30 - 20 + 1)) + 20

      await prisma.formation.update({
        where: { id: formation.id },
        data: { capaciteAbsorption: randomCapacity },
      })

      console.log(`✓ ${formation.formation}: capacité mise à jour à ${randomCapacity}`)
    }

    console.log('\n✅ Mise à jour terminée avec succès!')
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCapacities()

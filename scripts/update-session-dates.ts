import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer toutes les sessions existantes
  const sessions = await prisma.sessionFormation.findMany({
    include: {
      formation: true
    },
    orderBy: {
      dateDebut: 'asc'
    }
  })

  console.log('📋 Sessions actuelles:')
  sessions.forEach((session, index) => {
    console.log(`\n${index + 1}. ${session.formation.formation}`)
    console.log(`   Début: ${session.dateDebut}`)
    console.log(`   Fin: ${session.dateFin}`)
    console.log(`   Participants: ${session.nombreParticipants}`)
  })

  // Supprimer les anciennes sessions pour un affichage clair
  await prisma.sessionFormation.deleteMany({})

  console.log('\n\n🗑️  Anciennes sessions supprimées')
  console.log('\n📅 Création de nouvelles sessions avec dates claires...\n')

  // Récupérer les formations existantes
  const formations = await prisma.formation.findMany()

  if (formations.length === 0) {
    console.log('❌ Aucune formation trouvée dans la base de données')
    return
  }

  // Créer des sessions réparties sur décembre 2025 et janvier 2026
  const newSessions = [
    // Semaine 1 de décembre
    {
      formationId: formations[0]?.id,
      dateDebut: new Date('2025-12-08'),
      dateFin: new Date('2025-12-12'),
      nombreParticipants: 25,
      reference: 'REF-DEC-001',
    },
    // Semaine 2 de décembre
    {
      formationId: formations[1]?.id || formations[0]?.id,
      dateDebut: new Date('2025-12-15'),
      dateFin: new Date('2025-12-19'),
      nombreParticipants: 30,
      reference: 'REF-DEC-002',
    },
    // Session courte en décembre
    {
      formationId: formations[2]?.id || formations[0]?.id,
      dateDebut: new Date('2025-12-22'),
      dateFin: new Date('2025-12-24'),
      nombreParticipants: 20,
      reference: 'REF-DEC-003',
    },
    // Session qui chevauche fin d'année
    {
      formationId: formations[0]?.id,
      dateDebut: new Date('2025-12-28'),
      dateFin: new Date('2026-01-03'),
      nombreParticipants: 35,
      reference: 'REF-NYE-001',
    },
    // Semaine 1 de janvier 2026
    {
      formationId: formations[1]?.id || formations[0]?.id,
      dateDebut: new Date('2026-01-05'),
      dateFin: new Date('2026-01-09'),
      nombreParticipants: 28,
      reference: 'REF-JAN-001',
    },
    // Semaine 2 de janvier
    {
      formationId: formations[2]?.id || formations[0]?.id,
      dateDebut: new Date('2026-01-12'),
      dateFin: new Date('2026-01-16'),
      nombreParticipants: 22,
      reference: 'REF-JAN-002',
    },
    // Session longue en janvier
    {
      formationId: formations[0]?.id,
      dateDebut: new Date('2026-01-19'),
      dateFin: new Date('2026-01-30'),
      nombreParticipants: 40,
      reference: 'REF-JAN-003',
    },
    // Sessions courtes en janvier
    {
      formationId: formations[1]?.id || formations[0]?.id,
      dateDebut: new Date('2026-01-06'),
      dateFin: new Date('2026-01-08'),
      nombreParticipants: 15,
      reference: 'REF-JAN-004',
    },
    {
      formationId: formations[2]?.id || formations[0]?.id,
      dateDebut: new Date('2026-01-20'),
      dateFin: new Date('2026-01-22'),
      nombreParticipants: 18,
      reference: 'REF-JAN-005',
    },
  ]

  for (const sessionData of newSessions) {
    if (!sessionData.formationId) continue

    const session = await prisma.sessionFormation.create({
      data: sessionData,
      include: {
        formation: true
      }
    })

    console.log(`✅ Session créée: ${session.formation.formation}`)
    console.log(`   ${session.dateDebut.toLocaleDateString('fr-FR')} → ${session.dateFin.toLocaleDateString('fr-FR')}`)
    console.log(`   ${session.nombreParticipants} participants\n`)
  }

  console.log('✨ Toutes les sessions ont été créées avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  const email = 'admin@maritime.dz'
  const password = 'admin123'
  const name = 'Admin'
  const role = 'ADMIN'

  try {
    console.log('🔍 Vérification de l\'utilisateur existant...')

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    })

    if (existingUser) {
      console.log('⚠️  Utilisateur existant trouvé, suppression en cours...')

      // Supprimer les comptes associés d'abord
      await prisma.account.deleteMany({
        where: { userId: existingUser.id },
      })

      // Supprimer les sessions associées
      await prisma.session.deleteMany({
        where: { userId: existingUser.id },
      })

      // Supprimer l'utilisateur
      await prisma.user.delete({
        where: { id: existingUser.id },
      })

      console.log('✅ Utilisateur existant supprimé')
    }

    console.log('🔐 Hachage du mot de passe...')
    const hashedPassword = await hash(password, 10)

    console.log('👤 Création du nouvel utilisateur admin...')

    // Créer l'utilisateur avec le compte associé
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        emailVerified: true,
        accounts: {
          create: {
            accountId: email,
            providerId: 'credential',
            password: hashedPassword,
          },
        },
      },
      include: {
        accounts: true,
      },
    })

    console.log('✅ Utilisateur admin créé avec succès!')
    console.log('📧 Email:', email)
    console.log('🔑 Mot de passe:', password)
    console.log('👤 ID:', user.id)
    console.log('🛡️  Rôle:', user.role)
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
  .then(() => {
    console.log('\n🎉 Script terminé avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error)
    process.exit(1)
  })

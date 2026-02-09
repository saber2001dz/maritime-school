import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { DEFAULT_ROLE } from '@/lib/roles'
import { isValidRole } from '@/lib/roles-server'
import { auth } from '@/lib/auth'

// GET - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password, role, emailVerified } = body

    // Valider le rôle
    const userRole = role || DEFAULT_ROLE
    if (!isValidRole(userRole)) {
      return NextResponse.json(
        { error: `Rôle invalide: ${userRole}. Les rôles valides sont: administrateur, coordinateur, formateur, agent` },
        { status: 400 }
      )
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    // Créer l'utilisateur directement avec Prisma et Better-Auth
    // Better-Auth gère l'authentification, mais on crée l'utilisateur manuellement pour avoir plus de contrôle
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      // Créer l'utilisateur dans la base de données
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          emailVerified: emailVerified || false,
          role: userRole,
        },
      })

      // Créer le compte associé avec le mot de passe hashé
      await prisma.account.create({
        data: {
          userId: newUser.id,
          accountId: newUser.id,
          providerId: 'credential',
          password: hashedPassword,
        },
      })

      return NextResponse.json(newUser, { status: 201 })
    } catch (createError) {
      console.error('Erreur lors de la création:', createError)

      // Gérer les erreurs spécifiques
      if (createError instanceof Error) {
        if (createError.message.includes('Unique constraint')) {
          return NextResponse.json(
            { error: 'Cet email est déjà utilisé' },
            { status: 400 }
          )
        }
      }

      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

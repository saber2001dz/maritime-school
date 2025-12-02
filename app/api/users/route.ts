import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isValidRole, DEFAULT_ROLE } from '@/lib/roles'
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

    // Utiliser Better-Auth pour créer l'utilisateur
    // Cela garantit que le compte est créé correctement avec le bon format
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      })

      if (!result || !result.user) {
        return NextResponse.json(
          { error: 'Erreur lors de la création du compte' },
          { status: 400 }
        )
      }

      // Mettre à jour le rôle et emailVerified après la création
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: userRole,
          emailVerified: emailVerified || false,
        },
      })

      return NextResponse.json(updatedUser, { status: 201 })
    } catch (signUpError) {
      console.error('Erreur Better-Auth:', signUpError)
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

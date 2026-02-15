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

    // Utiliser l'API native Better-Auth pour créer l'utilisateur
    // Cela garantit le bon algorithme de hachage (scrypt)
    const signUpResponse = await auth.api.signUpEmail({
      body: {
        email,
        name,
        password,
      },
    })

    if (!signUpResponse?.user?.id) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 400 }
      )
    }

    // Supprimer la session automatiquement créée par signUpEmail
    await prisma.session.deleteMany({
      where: { userId: signUpResponse.user.id },
    })

    // Mettre à jour le rôle et emailVerified après création
    const newUser = await prisma.user.update({
      where: { id: signUpResponse.user.id },
      data: {
        role: userRole,
        emailVerified: emailVerified || false,
      },
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isValidRole, DEFAULT_ROLE } from '@/lib/roles'

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

    // Créer l'utilisateur et le compte associé avec transaction
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role: userRole,
        emailVerified: emailVerified || false,
        accounts: password ? {
          create: {
            accountId: email,
            providerId: 'credential',
            password: password, // Note: Dans une vraie application, le mot de passe devrait être hashé
          }
        } : undefined,
      },
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/dal'

// GET /api/cours/[id] - Récupérer un cours spécifique
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Vérifier l'authentification
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  try {
    const { id } = await context.params

    const cours = await prisma.cours.findUnique({
      where: { id },
    })

    if (!cours) {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(cours)
  } catch (error) {
    console.error('Erreur lors de la récupération du cours:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du cours' },
      { status: 500 }
    )
  }
}

// PUT /api/cours/[id] - Mettre à jour un cours
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Vérifier l'authentification
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  try {
    const { id } = await context.params
    const body = await request.json()
    const { titre } = body

    // Validation
    if (!titre || !titre.trim()) {
      return NextResponse.json(
        { error: 'Le champ titre est requis' },
        { status: 400 }
      )
    }

    const cours = await prisma.cours.update({
      where: { id },
      data: {
        titre: titre.trim(),
      },
    })

    return NextResponse.json(cours)
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du cours:', error)

    // Gérer l'erreur de cours non trouvé
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du cours' },
      { status: 500 }
    )
  }
}

// DELETE /api/cours/[id] - Supprimer un cours
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Vérifier l'authentification
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  try {
    const { id } = await context.params

    await prisma.cours.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Cours supprimé avec succès',
    })
  } catch (error: any) {
    console.error('Erreur lors de la suppression du cours:', error)

    // Gérer l'erreur de cours non trouvé
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression du cours' },
      { status: 500 }
    )
  }
}

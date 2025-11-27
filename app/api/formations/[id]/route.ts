import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/dal'

// GET /api/formations/[id] - Récupérer une formation par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const { id } = await params
    const formation = await prisma.formation.findUnique({
      where: { id },
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(formation)
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la formation' },
      { status: 500 }
    )
  }
}

// PUT /api/formations/[id] - Mettre à jour une formation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { typeFormation, formation, duree, specialite, capaciteAbsorption } = body

    // Validation basique
    if (!typeFormation || !formation) {
      return NextResponse.json(
        { error: 'Les champs typeFormation et formation sont requis' },
        { status: 400 }
      )
    }

    const updatedFormation = await prisma.formation.update({
      where: { id },
      data: {
        typeFormation,
        formation,
        duree: duree || null,
        specialite: specialite || null,
        capaciteAbsorption: capaciteAbsorption !== undefined ? capaciteAbsorption : null,
      },
    })

    return NextResponse.json(updatedFormation)
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la formation:', error)

    // Gérer l'erreur si la formation n'existe pas
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la formation' },
      { status: 500 }
    )
  }
}

// DELETE /api/formations/[id] - Supprimer une formation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.formation.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Formation supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la formation' },
      { status: 500 }
    )
  }
}

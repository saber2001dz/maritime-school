import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/dal'

// GET /api/formations - Récupérer toutes les formations
export async function GET() {
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const formations = await prisma.formation.findMany({
      orderBy: {
        formation: 'asc',
      },
    })

    return NextResponse.json(formations)
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des formations' },
      { status: 500 }
    )
  }
}

// POST /api/formations - Créer une nouvelle formation
export async function POST(request: NextRequest) {
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { formation, typeFormation, specialite, duree, capaciteAbsorption } = body

    // Validation basique
    if (!formation || !typeFormation) {
      return NextResponse.json(
        { error: 'Les champs formation et typeFormation sont requis' },
        { status: 400 }
      )
    }

    const newFormation = await prisma.formation.create({
      data: {
        formation,
        typeFormation,
        specialite: specialite || null,
        duree: duree || null,
        capaciteAbsorption: capaciteAbsorption || null,
      },
    })

    return NextResponse.json(newFormation, { status: 201 })
  } catch (error: any) {
    console.error('Erreur lors de la création de la formation:', error)

    return NextResponse.json(
      { error: 'Erreur lors de la création de la formation' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePermission } from '@/lib/check-permission'

// GET /api/cours - Récupérer tous les cours
export async function GET() {
  const auth = await requirePermission("cours", "view")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const cours = await prisma.cours.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(cours)
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des cours' },
      { status: 500 }
    )
  }
}

// POST /api/cours - Créer un nouveau cours
export async function POST(request: NextRequest) {
  const auth = await requirePermission("cours", "create")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const body = await request.json()
    const { titre } = body

    // Validation basique
    if (!titre || !titre.trim()) {
      return NextResponse.json(
        { error: 'Le champ titre est requis' },
        { status: 400 }
      )
    }

    const cours = await prisma.cours.create({
      data: {
        titre: titre.trim(),
      },
    })

    return NextResponse.json(cours, { status: 201 })
  } catch (error: any) {
    console.error('Erreur lors de la création du cours:', error)

    return NextResponse.json(
      { error: 'Erreur lors de la création du cours' },
      { status: 500 }
    )
  }
}

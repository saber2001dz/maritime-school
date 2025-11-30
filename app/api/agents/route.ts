import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/dal'

// GET /api/agents - Récupérer tous les agents
export async function GET() {
  // Vérifier l'authentification
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  try {
    const agents = await prisma.agent.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(agents)
  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des agents' },
      { status: 500 }
    )
  }
}

// Fonction pour déterminer la catégorie basée sur le grade
function getCategorieFromGrade(grade: string): string {
  const normalized = grade.trim()

  // ضابط سامي: عميد - عقيد - مقدم - رائد
  if (['عميد', 'عقيد', 'مقدم', 'رائد'].includes(normalized)) {
    return 'ضابط سامي'
  }

  // ضابط: ملازم - ملازم أول - نقيب
  if (['ملازم', 'ملازم أول', 'ملازم اول', 'ملازم 1', 'نقيب'].includes(normalized)) {
    return 'ضابط'
  }

  // ضابط صف: وكيل أول - وكيل - عريف أول - عريف
  if (['وكيل أول', 'وكيل اول', 'وكيل 1', 'وكيل', 'عريف أول', 'عريف اول', 'عريف 1', 'عريف'].includes(normalized)) {
    return 'ضابط صف'
  }

  // هيئة الرقباء: حرس - رقيب أول - رقيب
  if (['حرس', 'رقيب أول', 'رقيب اول', 'رقيب 1', 'رقيب'].includes(normalized)) {
    return 'هيئة الرقباء'
  }

  // Par défaut, retourner ضابط صف
  return 'ضابط صف'
}

// POST /api/agents - Créer un nouvel agent
export async function POST(request: NextRequest) {
  // Vérifier l'authentification
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { nom, prenom, grade, matricule, responsabilite, telephone } = body

    // Validation basique
    if (!nom || !prenom || !grade || !matricule) {
      return NextResponse.json(
        { error: 'Les champs nom, prenom, grade et matricule sont requis' },
        { status: 400 }
      )
    }

    // Construire le nom complet
    const nomPrenom = `${nom} ${prenom}`.trim()

    // Déterminer la catégorie automatiquement
    const categorie = getCategorieFromGrade(grade)

    // Convertir le téléphone en nombre (retirer les espaces)
    const telephoneNumber = telephone ? parseInt(telephone.replace(/\s/g, '')) : 0

    const agent = await prisma.agent.create({
      data: {
        nomPrenom,
        grade,
        matricule,
        responsabilite: responsabilite || '',
        telephone: telephoneNumber,
        categorie,
      },
    })

    return NextResponse.json(agent, { status: 201 })
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'agent:', error)

    // Gérer l'erreur de matricule unique
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'هذا رقم التسجيل موجود بالفعل' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'agent' },
      { status: 500 }
    )
  }
}

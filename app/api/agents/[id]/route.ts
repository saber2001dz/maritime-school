import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePermission } from '@/lib/check-permission'

// GET /api/agents/[id] - Récupérer un agent par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("agent", "view")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params
    const agent = await prisma.agent.findUnique({
      where: { id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(agent)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'agent:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'agent' },
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

// PUT /api/agents/[id] - Mettre à jour un agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("agent", "edit")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params
    const body = await request.json()
    const { nomPrenom, grade, matricule, responsabilite, telephone } = body

    // Validation basique
    if (!nomPrenom || !grade || !matricule) {
      return NextResponse.json(
        { error: 'Les champs nomPrenom, grade et matricule sont requis' },
        { status: 400 }
      )
    }

    // Déterminer la catégorie basée sur le grade
    const categorie = getCategorieFromGrade(grade)

    // Convertir le téléphone en nombre (retirer les espaces)
    const telephoneNumber = telephone ? parseInt(telephone.toString().replace(/\s/g, '')) : 0

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        nomPrenom,
        grade,
        matricule,
        responsabilite: responsabilite || '',
        telephone: telephoneNumber,
        categorie,
      },
    })

    return NextResponse.json(agent)
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'agent:', error)

    // Gérer l'erreur de matricule unique
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ce numéro de matricule existe déjà' },
        { status: 409 }
      )
    }

    // Gérer l'erreur si l'agent n'existe pas
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Agent non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'agent' },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id] - Supprimer un agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("agent", "delete")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params
    await prisma.agent.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Agent supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'agent:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'agent' },
      { status: 500 }
    )
  }
}

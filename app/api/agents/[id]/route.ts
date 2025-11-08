import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/agents/[id] - Récupérer un agent par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agent = await prisma.agent.findUnique({
      where: { id: parseInt(id) },
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

// PUT /api/agents/[id] - Mettre à jour un agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nom, prenom, email, telephone, poste } = body

    const agent = await prisma.agent.update({
      where: { id: parseInt(id) },
      data: {
        nom,
        prenom,
        email,
        telephone,
        poste,
      },
    })

    return NextResponse.json(agent)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'agent:', error)
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
  try {
    const { id } = await params
    await prisma.agent.delete({
      where: { id: parseInt(id) },
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

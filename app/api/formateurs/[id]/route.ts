import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/formateurs/[id] - Get a single formateur
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const formateur = await prisma.formateur.findUnique({
      where: { id },
    })

    if (!formateur) {
      return NextResponse.json(
        { error: 'Formateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(formateur)
  } catch (error) {
    console.error('Error fetching formateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du formateur' },
      { status: 500 }
    )
  }
}

// PUT /api/formateurs/[id] - Update a formateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nomPrenom, grade, unite, responsabilite, telephone, RIB } = body

    const formateur = await prisma.formateur.update({
      where: { id },
      data: {
        nomPrenom,
        grade,
        unite,
        responsabilite,
        telephone: parseInt(telephone),
        RIB,
      },
    })

    return NextResponse.json(formateur)
  } catch (error) {
    console.error('Error updating formateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du formateur' },
      { status: 500 }
    )
  }
}

// DELETE /api/formateurs/[id] - Delete a formateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.formateur.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting formateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du formateur' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { computeSessionStatus } from '@/lib/session-utils'

// GET /api/session-formations/[id] - Récupérer une session par ID
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
    const sessionFormation = await prisma.sessionFormation.findUnique({
      where: { id },
      include: {
        formation: {
          select: {
            id: true,
            formation: true,
            typeFormation: true,
            specialite: true,
            capaciteAbsorption: true,
          }
        },
        agentFormations: {
          include: {
            agent: {
              select: {
                id: true,
                nomPrenom: true,
                grade: true,
                matricule: true,
              }
            }
          }
        }
      }
    })

    if (!sessionFormation) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // Compute status
    const sessionWithStatus = {
      ...sessionFormation,
      statut: computeSessionStatus(sessionFormation.dateDebut, sessionFormation.dateFin)
    }

    return NextResponse.json({ session: sessionWithStatus })
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la session' },
      { status: 500 }
    )
  }
}

// PUT /api/session-formations/[id] - Mettre à jour une session
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
    const { formationId, dateDebut, dateFin, reference, color, nombreParticipants } = body

    // Si les dates sont fournies, valider que dateDebut < dateFin
    if (dateDebut && dateFin) {
      const dateDebutObj = new Date(dateDebut)
      const dateFinObj = new Date(dateFin)

      if (dateDebutObj >= dateFinObj) {
        return NextResponse.json(
          { error: 'La date de début doit être antérieure à la date de fin' },
          { status: 400 }
        )
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = {}
    if (formationId) updateData.formationId = formationId
    if (dateDebut) updateData.dateDebut = new Date(dateDebut)
    if (dateFin) updateData.dateFin = new Date(dateFin)
    if (reference !== undefined) updateData.reference = reference || null
    if (color !== undefined) updateData.color = color || null
    if (nombreParticipants !== undefined) updateData.nombreParticipants = nombreParticipants

    // If dates are updated, recompute status
    if (dateDebut || dateFin) {
      // Fetch current session to get existing dates if only one is being updated
      const currentSession = await prisma.sessionFormation.findUnique({
        where: { id },
        select: { dateDebut: true, dateFin: true }
      })

      if (currentSession) {
        const finalDateDebut = dateDebut ? new Date(dateDebut) : currentSession.dateDebut
        const finalDateFin = dateFin ? new Date(dateFin) : currentSession.dateFin
        updateData.statut = computeSessionStatus(finalDateDebut, finalDateFin)
      }
    }

    const updatedSession = await prisma.sessionFormation.update({
      where: { id },
      data: updateData,
      include: {
        formation: {
          select: {
            id: true,
            formation: true,
            typeFormation: true,
            specialite: true,
          }
        }
      }
    })

    // Add computed status to response
    const sessionWithStatus = {
      ...updatedSession,
      statut: computeSessionStatus(updatedSession.dateDebut, updatedSession.dateFin)
    }

    return NextResponse.json(sessionWithStatus)
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la session:', error)

    // Gérer l'erreur si la session n'existe pas
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la session' },
      { status: 500 }
    )
  }
}

// DELETE /api/session-formations/[id] - Supprimer une session
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

    // La suppression cascade vers Formation et met à null dans AgentFormation
    await prisma.sessionFormation.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Session supprimée avec succès'
    })
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la session:', error)

    // Gérer l'erreur si la session n'existe pas
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la session' },
      { status: 500 }
    )
  }
}

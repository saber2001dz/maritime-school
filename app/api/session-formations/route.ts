import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePermission } from '@/lib/check-permission'
import { computeSessionStatus } from '@/lib/session-utils'

// GET /api/session-formations - Récupérer toutes les sessions de formation
export async function GET(request: NextRequest) {
  const auth = await requirePermission("sessionFormation", "view")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { searchParams } = new URL(request.url)
    const formationId = searchParams.get('formationId')
    const dateDebut_gte = searchParams.get('dateDebut_gte')

    const whereClause: any = {}

    // Filtrer par formationId si fourni
    if (formationId) {
      whereClause.formationId = formationId
    }

    // Filtrer par date de début (après ou égale à)
    if (dateDebut_gte) {
      whereClause.dateDebut = {
        gte: new Date(dateDebut_gte)
      }
    }

    const sessions = await prisma.sessionFormation.findMany({
      where: whereClause,
      include: {
        formation: {
          select: {
            id: true,
            formation: true,
            typeFormation: true,
            specialite: true,
          }
        },
        agentFormations: {
          select: {
            id: true,
            agentId: true,
          }
        }
      },
      orderBy: {
        dateDebut: 'desc',
      },
    })

    // Compute status for each session
    const sessionsWithStatus = sessions.map(session => ({
      ...session,
      statut: computeSessionStatus(session.dateDebut, session.dateFin)
    }))

    return NextResponse.json({ sessions: sessionsWithStatus })
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sessions' },
      { status: 500 }
    )
  }
}

// POST /api/session-formations - Créer une nouvelle session de formation
export async function POST(request: NextRequest) {
  const auth = await requirePermission("sessionFormation", "create")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const body = await request.json()
    const { formationId, dateDebut, dateFin, reference, nombreParticipants, color } = body

    // Validation basique
    if (!formationId || !dateDebut || !dateFin) {
      return NextResponse.json(
        { error: 'Les champs formationId, dateDebut et dateFin sont requis' },
        { status: 400 }
      )
    }

    // Valider que dateDebut < dateFin
    const dateDebutObj = new Date(dateDebut)
    // Stocker en UTC: 09:00 UTC pour afficher 08:00 GMT+1
    dateDebutObj.setHours(9, 0, 0, 0)

    const dateFinObj = new Date(dateFin)
    // Stocker en UTC: 18:00 UTC pour afficher 17:00 GMT+1
    dateFinObj.setHours(18, 0, 0, 0)

    if (dateDebutObj >= dateFinObj) {
      return NextResponse.json(
        { error: 'La date de début doit être antérieure à la date de fin' },
        { status: 400 }
      )
    }

    // Vérifier que la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id: formationId }
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation introuvable' },
        { status: 404 }
      )
    }

    // Compute status based on dates
    const statut = computeSessionStatus(dateDebutObj, dateFinObj)

    const newSession = await prisma.sessionFormation.create({
      data: {
        formationId,
        dateDebut: dateDebutObj,
        dateFin: dateFinObj,
        reference: reference || null,
        statut,
        nombreParticipants: nombreParticipants || 0,
        color: color || null,
      },
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

    // Retourner avec le statut calculé pour cohérence avec GET
    const sessionWithStatus = {
      ...newSession,
      statut: computeSessionStatus(newSession.dateDebut, newSession.dateFin)
    }

    return NextResponse.json(sessionWithStatus, { status: 201 })
  } catch (error: any) {
    console.error('Erreur lors de la création de la session:', error)

    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    )
  }
}

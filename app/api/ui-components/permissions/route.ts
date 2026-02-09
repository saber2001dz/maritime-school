import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// PUT /api/ui-components/permissions - Toggle UI component permission
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.role !== 'administrateur') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { roleId, componentId, enabled } = body

    if (!roleId || !componentId || enabled === undefined) {
      return NextResponse.json(
        { error: 'Les champs roleId, componentId et enabled sont requis' },
        { status: 400 }
      )
    }

    // Check if permission exists
    const existingPermission = await prisma.uIComponentPermission.findUnique({
      where: {
        roleId_componentId: {
          roleId,
          componentId,
        },
      },
    })

    if (existingPermission) {
      // Update existing permission
      const updated = await prisma.uIComponentPermission.update({
        where: {
          roleId_componentId: {
            roleId,
            componentId,
          },
        },
        data: { enabled },
      })
      return NextResponse.json(updated)
    } else {
      // Create new permission
      const created = await prisma.uIComponentPermission.create({
        data: {
          roleId,
          componentId,
          enabled,
        },
      })
      return NextResponse.json(created)
    }
  } catch (error) {
    console.error('Error updating UI component permission:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la permission' },
      { status: 500 }
    )
  }
}

// GET /api/ui-components/permissions?roleId=xxx - Get permissions for a specific role
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get('roleId')

    if (!roleId) {
      return NextResponse.json(
        { error: 'Le paramètre roleId est requis' },
        { status: 400 }
      )
    }

    const permissions = await prisma.uIComponentPermission.findMany({
      where: { roleId },
      include: {
        component: true,
      },
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error('Error fetching UI component permissions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des permissions' },
      { status: 500 }
    )
  }
}

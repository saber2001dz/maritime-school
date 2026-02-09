import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// GET /api/ui-components - Get all UI components with permissions
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Get all UI components with their permissions
    const components = await prisma.uIComponent.findMany({
      include: {
        permissions: {
          include: {
            role: true,
          },
        },
      },
      orderBy: [{ category: 'asc' }, { displayName: 'asc' }],
    })

    // Get all roles
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
    })

    // Transform data to the expected format
    const componentsByCategory: Record<string, any[]> = {}

    for (const component of components) {
      if (!componentsByCategory[component.category]) {
        componentsByCategory[component.category] = []
      }

      // Create permissions map for this component
      const permissionsMap: Record<string, boolean> = {}
      for (const role of roles) {
        const permission = component.permissions.find(p => p.roleId === role.id)
        permissionsMap[role.name] = permission?.enabled || false
      }

      componentsByCategory[component.category].push({
        id: component.id,
        name: component.name,
        displayName: component.displayName,
        description: component.description,
        icon: component.icon,
        permissions: permissionsMap,
      })
    }

    return NextResponse.json({
      components: componentsByCategory,
      roles: roles.map(r => ({
        id: r.id,
        name: r.name,
        displayName: r.displayName,
        color: r.color,
      })),
    })
  } catch (error) {
    console.error('Error fetching UI components:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des composants UI' },
      { status: 500 }
    )
  }
}

// POST /api/ui-components - Create new UI component
export async function POST(request: NextRequest) {
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
    const { name, displayName, category, description, icon } = body

    if (!name || !displayName || !category) {
      return NextResponse.json(
        { error: 'Les champs name, displayName et category sont requis' },
        { status: 400 }
      )
    }

    const component = await prisma.uIComponent.create({
      data: {
        name,
        displayName,
        category,
        description: description || '',
        icon: icon || 'Square',
      },
    })

    return NextResponse.json(component)
  } catch (error) {
    console.error('Error creating UI component:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du composant UI' },
      { status: 500 }
    )
  }
}

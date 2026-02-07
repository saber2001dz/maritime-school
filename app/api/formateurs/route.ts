import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePermission } from '@/lib/check-permission'
import { Prisma } from '@prisma/client'

// GET /api/formateurs - Get all formateurs
export async function GET(request: NextRequest) {
  const auth = await requirePermission("formateur", "view")
  if (!auth.authorized) return auth.errorResponse!

  try {

    const formateurs = await prisma.formateur.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(formateurs)
  } catch (error) {
    console.error('Error fetching formateurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des formateurs' },
      { status: 500 }
    )
  }
}

// POST /api/formateurs - Create a new formateur
export async function POST(request: NextRequest) {
  const auth = await requirePermission("formateur", "create")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const body = await request.json()
    const { nomPrenom, grade, unite, responsabilite, telephone, RIB } = body

    // Validation du champ obligatoire (nomPrenom uniquement)
    if (!nomPrenom || nomPrenom.trim() === '') {
      return NextResponse.json(
        { error: 'الإسم و اللقب مطلوب' },
        { status: 400 }
      )
    }

    // Validation du RIB (20 chiffres) seulement s'il est fourni
    if (RIB && RIB.length !== 20) {
      return NextResponse.json(
        { error: 'يجب أن يكون RIB 20 رقمًا' },
        { status: 400 }
      )
    }

    // Nettoyer et valider le numéro de téléphone seulement s'il est fourni
    let telephoneNumber = 0 // Valeur par défaut si non fourni
    if (telephone && telephone.trim()) {
      const cleanedTelephone = telephone.replace(/\s/g, '')
      telephoneNumber = parseInt(cleanedTelephone)

      if (isNaN(telephoneNumber)) {
        return NextResponse.json(
          { error: 'رقم الهاتف غير صالح' },
          { status: 400 }
        )
      }
    }

    const formateur = await prisma.formateur.create({
      data: {
        nomPrenom: nomPrenom.trim(),
        grade: grade || '',
        unite: unite?.trim() || '',
        responsabilite: responsabilite?.trim() || '',
        telephone: telephoneNumber,
        RIB: RIB || '',
      },
    })

    return NextResponse.json(formateur, { status: 201 })
  } catch (error) {
    console.error('Error creating formateur:', error)

    // Gérer les erreurs de contrainte unique Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Contrainte unique violée
        const target = (error.meta?.target as string[]) || []
        if (target.includes('RIB')) {
          return NextResponse.json(
            { error: 'RIB موجود بالفعل في قاعدة البيانات' },
            { status: 409 }
          )
        }
      }
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المكون' },
      { status: 500 }
    )
  }
}

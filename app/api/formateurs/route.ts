import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { Prisma } from '@prisma/client'

// GET /api/formateurs - Get all formateurs
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifySession()
    if (!session.isAuth) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

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
  try {
    // Verify authentication
    const session = await verifySession()
    if (!session.isAuth) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nomPrenom, grade, unite, responsabilite, telephone, RIB } = body

    // Validation des champs requis
    if (!nomPrenom || !grade || !unite || !responsabilite || !telephone || !RIB) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Validation du RIB (20 chiffres)
    if (RIB.length !== 20) {
      return NextResponse.json(
        { error: 'يجب أن يكون RIB 20 رقمًا' },
        { status: 400 }
      )
    }

    // Nettoyer le numéro de téléphone (supprimer les espaces)
    const cleanedTelephone = telephone.replace(/\s/g, '')
    const telephoneNumber = parseInt(cleanedTelephone)

    if (isNaN(telephoneNumber)) {
      return NextResponse.json(
        { error: 'رقم الهاتف غير صالح' },
        { status: 400 }
      )
    }

    const formateur = await prisma.formateur.create({
      data: {
        nomPrenom: nomPrenom.trim(),
        grade,
        unite: unite.trim(),
        responsabilite: responsabilite.trim(),
        telephone: telephoneNumber,
        RIB,
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

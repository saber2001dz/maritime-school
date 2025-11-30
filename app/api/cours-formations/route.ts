import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";

// GET - Récupérer tous les CoursFormateur avec leurs cours et formateurs associés
// Supporte le filtrage par formateurId ou coursId via query params: ?formateurId=xxx ou ?coursId=xxx
export async function GET(request: NextRequest) {
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const formateurId = searchParams.get('formateurId');
    const coursId = searchParams.get('coursId');

    const coursFormateurs = await prisma.coursFormateur.findMany({
      where: {
        ...(formateurId && { formateurId }),
        ...(coursId && { coursId }),
      },
      include: {
        formateur: true,
        cours: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(coursFormateurs);
  } catch (error) {
    console.error("Erreur lors de la récupération des cours formateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des cours formateurs" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau CoursFormateur
export async function POST(request: Request) {
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const body = await request.json();
    const { formateurId, coursId, dateDebut, dateFin, nombreHeures, reference } = body;

    // Validation basique
    if (!formateurId || !coursId || !dateDebut || !dateFin || nombreHeures === undefined) {
      return NextResponse.json(
        { error: "Les champs formateurId, coursId, dateDebut, dateFin et nombreHeures sont requis" },
        { status: 400 }
      );
    }

    // Validation du nombre d'heures
    if (parseFloat(nombreHeures) <= 0) {
      return NextResponse.json(
        { error: "Le nombre d'heures doit être supérieur à 0" },
        { status: 400 }
      );
    }

    // Vérifier que le formateur et le cours existent
    const formateur = await prisma.formateur.findUnique({
      where: { id: formateurId }
    });

    if (!formateur) {
      return NextResponse.json(
        { error: "Formateur non trouvé" },
        { status: 404 }
      );
    }

    const cours = await prisma.cours.findUnique({
      where: { id: coursId }
    });

    if (!cours) {
      return NextResponse.json(
        { error: "Cours non trouvé" },
        { status: 404 }
      );
    }

    const newCoursFormateur = await prisma.coursFormateur.create({
      data: {
        formateurId,
        coursId,
        dateDebut,
        dateFin,
        nombreHeures: parseFloat(nombreHeures),
        reference: reference || null,
      },
      include: {
        formateur: true,
        cours: true,
      },
    });

    return NextResponse.json(newCoursFormateur, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du cours formateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du cours formateur" },
      { status: 500 }
    );
  }
}

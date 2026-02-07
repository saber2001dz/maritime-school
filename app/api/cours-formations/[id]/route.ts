import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/check-permission";

// GET - Récupérer un CoursFormateur par son ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("coursFormateur", "view")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params;

    const coursFormateur = await prisma.coursFormateur.findUnique({
      where: { id },
      include: {
        formateur: true,
        cours: true,
      },
    });

    if (!coursFormateur) {
      return NextResponse.json(
        { error: "Cours formateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(coursFormateur);
  } catch (error) {
    console.error("Erreur lors de la récupération du cours formateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du cours formateur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un CoursFormateur
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("coursFormateur", "edit")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params;
    const body = await request.json();
    const { coursId, dateDebut, dateFin, nombreHeures, reference } = body;

    // Validation basique
    if (!coursId || !dateDebut || !dateFin || nombreHeures === undefined) {
      return NextResponse.json(
        { error: "Les champs coursId, dateDebut, dateFin et nombreHeures sont requis" },
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

    // Vérifier que le cours formateur existe
    const existingCoursFormateur = await prisma.coursFormateur.findUnique({
      where: { id },
    });

    if (!existingCoursFormateur) {
      return NextResponse.json(
        { error: "Cours formateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le cours existe
    const cours = await prisma.cours.findUnique({
      where: { id: coursId }
    });

    if (!cours) {
      return NextResponse.json(
        { error: "Cours non trouvé" },
        { status: 404 }
      );
    }

    const updatedCoursFormateur = await prisma.coursFormateur.update({
      where: { id },
      data: {
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

    return NextResponse.json(updatedCoursFormateur);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cours formateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du cours formateur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un CoursFormateur
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("coursFormateur", "delete")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params;

    const existingCoursFormateur = await prisma.coursFormateur.findUnique({
      where: { id },
    });

    if (!existingCoursFormateur) {
      return NextResponse.json(
        { error: "Cours formateur non trouvé" },
        { status: 404 }
      );
    }

    await prisma.coursFormateur.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Cours formateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du cours formateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du cours formateur" },
      { status: 500 }
    );
  }
}

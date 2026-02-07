import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/check-permission";

// GET - Récupérer une AgentFormation par son ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("agentFormation", "view")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params;

    const agentFormation = await prisma.agentFormation.findUnique({
      where: { id },
      include: {
        formation: true,
        agent: true,
      },
    });

    if (!agentFormation) {
      return NextResponse.json(
        { error: "Formation d'agent non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(agentFormation);
  } catch (error) {
    console.error("Erreur lors de la récupération de la formation d'agent:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la formation d'agent" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une AgentFormation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("agentFormation", "edit")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params;
    const body = await request.json();
    const { sessionFormationId, dateDebut, dateFin, reference, resultat, moyenne } = body;

    // Validation basique
    if (!sessionFormationId || !dateDebut || !dateFin || moyenne === undefined) {
      return NextResponse.json(
        { error: "Les champs sessionFormationId, dateDebut, dateFin et moyenne sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que la formation d'agent existe
    const existingAgentFormation = await prisma.agentFormation.findUnique({
      where: { id },
      include: {
        sessionFormation: {
          include: {
            formation: true,
          },
        },
      },
    });

    if (!existingAgentFormation) {
      return NextResponse.json(
        { error: "Formation d'agent non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer la session de formation pour obtenir le formationId
    const sessionFormation = await prisma.sessionFormation.findUnique({
      where: { id: sessionFormationId },
      select: { formationId: true },
    });

    if (!sessionFormation) {
      return NextResponse.json(
        { error: "Session de formation non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour la formation d'agent
    const updatedAgentFormation = await prisma.agentFormation.update({
      where: { id },
      data: {
        formationId: sessionFormation.formationId,
        sessionFormationId,
        dateDebut,
        dateFin,
        reference,
        resultat,
        moyenne: parseFloat(moyenne),
      },
      include: {
        formation: true,
        agent: true,
      },
    });

    return NextResponse.json(updatedAgentFormation);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la formation d'agent:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la formation d'agent" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une AgentFormation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("agentFormation", "delete")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params;

    // Vérifier que la formation d'agent existe
    const existingAgentFormation = await prisma.agentFormation.findUnique({
      where: { id },
    });

    if (!existingAgentFormation) {
      return NextResponse.json(
        { error: "Formation d'agent non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la formation d'agent
    await prisma.agentFormation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Formation d'agent supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la formation d'agent:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la formation d'agent" },
      { status: 500 }
    );
  }
}

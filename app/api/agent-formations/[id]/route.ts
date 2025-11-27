import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";

// GET - Récupérer une AgentFormation par son ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

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
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { formationId, dateDebut, dateFin, reference, resultat, moyenne } = body;

    // Validation basique
    if (!formationId || !dateDebut || !dateFin || moyenne === undefined) {
      return NextResponse.json(
        { error: "Les champs formationId, dateDebut, dateFin et moyenne sont requis" },
        { status: 400 }
      );
    }

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

    // Mettre à jour la formation d'agent
    const updatedAgentFormation = await prisma.agentFormation.update({
      where: { id },
      data: {
        formationId,
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
  const session = await verifySession()
  if (!session.isAuth) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

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

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/check-permission";

// GET - Récupérer toutes les AgentFormation avec leurs formations associées
// Supporte le filtrage par agentId via query param: ?agentId=xxx
export async function GET(request: NextRequest) {
  const auth = await requirePermission("agentFormation", "view")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');

    const agentFormations = await prisma.agentFormation.findMany({
      where: agentId ? { agentId } : undefined,
      include: {
        formation: true, // Inclure les détails de la formation
        agent: true,     // Inclure les détails de l'agent si nécessaire
        sessionFormation: true, // Inclure la session de formation
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ agentFormations });
  } catch (error) {
    console.error("Erreur lors de la récupération des formations d'agents:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des formations d'agents" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle AgentFormation
export async function POST(request: Request) {
  const auth = await requirePermission("agentFormation", "create")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const body = await request.json();
    const { agentId, sessionFormationId, dateDebut, dateFin, reference, resultat, moyenne } = body;

    // Validation basique
    if (!agentId || !sessionFormationId || moyenne === undefined) {
      return NextResponse.json(
        { error: "Les champs agentId, sessionFormationId et moyenne sont requis" },
        { status: 400 }
      );
    }

    // Récupérer la session de formation pour obtenir le formationId
    const sessionFormation = await prisma.sessionFormation.findUnique({
      where: { id: sessionFormationId }
    });

    if (!sessionFormation) {
      return NextResponse.json(
        { error: "Session de formation introuvable" },
        { status: 404 }
      );
    }

    // Vérifier si l'agent est déjà inscrit à cette session
    const existingEnrollment = await prisma.agentFormation.findFirst({
      where: {
        agentId,
        sessionFormationId
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "المتربص مسجل بالفعل في هذه الدورة التكوينية" },
        { status: 409 } // 409 Conflict
      );
    }

    const newAgentFormation = await prisma.agentFormation.create({
      data: {
        agentId,
        formationId: sessionFormation.formationId,
        sessionFormationId,
        dateDebut: dateDebut || sessionFormation.dateDebut.toISOString().split('T')[0],
        dateFin: dateFin || sessionFormation.dateFin.toISOString().split('T')[0],
        reference,
        resultat,
        moyenne: parseFloat(moyenne),
      },
      include: {
        formation: true,
        agent: true,
        sessionFormation: true,
      },
    });

    return NextResponse.json(newAgentFormation, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la formation d'agent:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la formation d'agent" },
      { status: 500 }
    );
  }
}

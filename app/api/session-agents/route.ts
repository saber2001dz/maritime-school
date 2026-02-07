import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/check-permission";

// GET - List agents enrolled in a session (via AgentFormation)
export async function GET(request: Request) {
  const auth = await requirePermission("sessionAgent", "view")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { searchParams } = new URL(request.url);
    const sessionFormationId = searchParams.get("sessionFormationId");

    const agentFormations = await prisma.agentFormation.findMany({
      where: sessionFormationId ? { sessionFormationId } : undefined,
      include: {
        agent: {
          select: {
            nomPrenom: true,
            grade: true,
            matricule: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(agentFormations);
  } catch (error) {
    console.error("Error fetching session agents:", error);
    return NextResponse.json(
      { error: "خطأ في جلب بيانات الأعوان" },
      { status: 500 }
    );
  }
}

// POST - Add agent to session (via AgentFormation)
export async function POST(request: Request) {
  const auth = await requirePermission("sessionAgent", "create")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const body = await request.json();
    const { sessionFormationId, agentId, formationId, dateDebut, dateFin, moyenne } = body;

    // Validation
    if (!sessionFormationId || !agentId || !formationId) {
      return NextResponse.json(
        { error: "معرف الجلسة، العون والتكوين مطلوبة" },
        { status: 400 }
      );
    }

    const agentFormation = await prisma.agentFormation.create({
      data: {
        sessionFormationId,
        agentId,
        formationId,
        dateDebut: dateDebut || "",
        dateFin: dateFin || "",
        moyenne: moyenne || 0,
      },
      include: {
        agent: {
          select: {
            nomPrenom: true,
            grade: true,
            matricule: true,
          },
        },
      },
    });

    return NextResponse.json(agentFormation);
  } catch (error) {
    console.error("Error adding agent to session:", error);
    return NextResponse.json(
      { error: "خطأ في إضافة العون للجلسة" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/check-permission";

// GET - Get single agent formation by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("sessionAgent", "view")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params;

    const agentFormation = await prisma.agentFormation.findUnique({
      where: { id },
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

    if (!agentFormation) {
      return NextResponse.json(
        { error: "العون غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json(agentFormation);
  } catch (error) {
    console.error("Error fetching agent formation:", error);
    return NextResponse.json(
      { error: "خطأ في جلب بيانات العون" },
      { status: 500 }
    );
  }
}

// PUT - Update agent formation (NOTE: This updates formation data, not agent data)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("sessionAgent", "edit")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params;
    const body = await request.json();
    const { dateDebut, dateFin, moyenne, resultat, reference } = body;

    // Update only AgentFormation fields (not Agent fields)
    const agentFormation = await prisma.agentFormation.update({
      where: { id },
      data: {
        ...(dateDebut !== undefined && { dateDebut }),
        ...(dateFin !== undefined && { dateFin }),
        ...(moyenne !== undefined && { moyenne }),
        ...(resultat !== undefined && { resultat }),
        ...(reference !== undefined && { reference }),
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
    console.error("Error updating agent formation:", error);
    return NextResponse.json(
      { error: "خطأ في تحديث بيانات التكوين" },
      { status: 500 }
    );
  }
}

// DELETE - Remove agent from session (delete AgentFormation)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("sessionAgent", "delete")
  if (!auth.authorized) return auth.errorResponse!

  try {
    const { id } = await params;

    await prisma.agentFormation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "تم إزالة العون من الجلسة بنجاح" });
  } catch (error) {
    console.error("Error removing agent from session:", error);
    return NextResponse.json(
      { error: "خطأ في إزالة العون من الجلسة" },
      { status: 500 }
    );
  }
}

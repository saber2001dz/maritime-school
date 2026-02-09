import { prisma } from "@/lib/db";
import { Project } from "@/components/ui/project-data-table";
import FormationAgentClient from "@/components/formation-agent-client";
import localFont from "next/font/local";
import { getStatusVariant, getResultatLabel } from "@/lib/resultat-utils";
import { verifySession } from "@/lib/dal";

const notoNaskhArabic = localFont({
  src: "../../fonts/NotoNaskhArabic.woff2",
  display: "swap",
});

// Interface pour les données de Prisma
interface AgentFormationData {
  id: string;
  agentId: string;
  formationId: string;
  sessionFormationId: string | null;
  dateDebut: string;
  dateFin: string;
  reference: string | null;
  resultat: string | null;
  moyenne: number;
  formation: {
    id: string;
    formation: string;
  };
  agent: {
    id: string;
    nomPrenom: string;
  };
}

// Fonction pour transformer les données de Prisma vers le format Project
function transformAgentFormations(data: AgentFormationData[]): Project[] {
  const transformedData: Project[] = data.map((item) => ({
    id: item.id,
    name: item.formation.formation,
    repository: item.formation.formation, // الدورة - Nom de la formation
    team: item.dateDebut, // تاريخ البداية - Date de début
    tech: item.dateFin, // تاريخ النهاية - Date de fin
    createdAt: item.reference || "-", // المرجع - Référence
    contributors: item.moyenne.toString(), // المعدل - Moyenne
    status: {
      text: getResultatLabel(item.resultat), // النتيجة - Résultat (avec label formaté pour l'affichage)
      variant: getStatusVariant(item.resultat),
      value: item.resultat || "", // Valeur brute de la base de données pour l'édition
    },
    formationId: item.formationId, // ID de la formation pour l'édition
    sessionFormationId: item.sessionFormationId || undefined, // ID de la session de formation pour l'édition
  }));

  // Trier par date de début du plus récent au moins récent
  transformedData.sort((a, b) => {
    const dateA = new Date(a.team);
    const dateB = new Date(b.team);
    return dateB.getTime() - dateA.getTime();
  });

  return transformedData;
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FormationAgentPage({ searchParams }: PageProps) {
  const { role } = await verifySession()
  // Attendre les searchParams (Next.js 15+)
  const params = await searchParams;
  const agentId = params.agentId as string | undefined;
  const returnUrl = (params.returnUrl as string) || '/liste-agent';

  // Récupérer les informations de l'agent si un agentId est fourni
  let agentInfo = null;
  if (agentId) {
    agentInfo = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        grade: true,
        nomPrenom: true,
      },
    });
  }

  // Récupérer les données directement depuis la base de données
  const agentFormations = await prisma.agentFormation.findMany({
    where: agentId ? { agentId } : undefined,
    include: {
      formation: true,
      agent: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transformer les données pour le format attendu par le composant client
  const transformedData = transformAgentFormations(agentFormations);

  return (
    <FormationAgentClient
      data={transformedData}
      agentInfo={agentInfo}
      agentId={agentId}
      notoNaskhArabicClassName={notoNaskhArabic.className}
      returnUrl={returnUrl}
      userRole={role}
    />
  );
}

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { SquarePen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// --- TYPE DEFINITIONS ---
type StatusVariant = "success" | "inProgress" | "interrupted" | "abandoned" | "notJoined" | "pending";

export interface Project {
  id: string;
  name: string;          // Utilisé pour le numéro de ligne (#)
  repository: string;    // الدورة - Nom de la formation (formation.formation)
  team: string;          // تاريخ البداية - Date de début (dateDebut)
  tech: string;          // تاريخ النهاية - Date de fin (dateFin)
  createdAt: string;     // المرجع - Référence (reference)
  contributors: string;  // المعدل - Moyenne (moyenne)
  status: {
    text: string;        // النتيجة - Résultat (label pour l'affichage)
    variant: StatusVariant;
    value?: string;      // Valeur brute de la base de données pour l'édition
  };
  formationId?: string;  // ID de la formation pour l'édition
  sessionFormationId?: string;  // ID de la session de formation pour l'édition
}

// --- PROPS INTERFACE ---
interface ProjectDataTableProps {
  projects: Project[];
  visibleColumns: Set<keyof Project>;
  onEditClick?: (project: Project) => void;
  canEditButton?: boolean;
  customHeaders?: { key: keyof Project | 'actions'; label: string; width?: string }[];
  notoNaskhArabicClassName?: string;
}

// --- STATUS BADGE VARIANTS ---
const badgeVariants = cva("capitalize border", {
  variants: {
    variant: {
      success: "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-700",
      inProgress: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-700",
      interrupted: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-700",
      abandoned: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-700",
      notJoined: "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-700",
      pending: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-700",
    },
  },
  defaultVariants: {
    variant: "success",
  },
});

const dotVariants = cva("w-1.5 h-1.5 rounded-full", {
  variants: {
    variant: {
      success: "bg-green-600 dark:bg-green-400",
      inProgress: "bg-yellow-600 dark:bg-yellow-400",
      interrupted: "bg-red-600 dark:bg-red-400",
      abandoned: "bg-orange-600 dark:bg-orange-400",
      notJoined: "bg-cyan-600 dark:bg-cyan-400",
      pending: "bg-blue-600 dark:bg-blue-400",
    },
  },
  defaultVariants: {
    variant: "success",
  },
});

// --- MAIN COMPONENT ---
export const ProjectDataTable = ({ projects, visibleColumns, onEditClick, canEditButton = true, customHeaders, notoNaskhArabicClassName }: ProjectDataTableProps) => {
  // Animation variants for table rows
  const rowVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeInOut",
      },
    }),
  };

  const defaultHeaders: { key: keyof Project | 'actions'; label: string; width?: string }[] = [
    { key: "name", label: "#", width: "w-10" },
    { key: "repository", label: "الــــــــــدورة التـكــويـنـيــــة", width: "w-60" },
    { key: "team", label: "تــاريـخ البــدايــة", width: "w-28" },
    { key: "tech", label: "تــاريـخ النهــايـــة", width: "w-28" },
    { key: "createdAt", label: "المــرجــــــــع", width: "w-50" },
    { key: "contributors", label: "المعـــــــدل", width: "w-26" },
    { key: "status", label: "النـتـيـجــــــة", width: "w-12" },
    { key: "actions", label: "خيــــارات", width: "w-18" },
  ];

  const tableHeaders = customHeaders || defaultHeaders;

  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-blue-950/40 [&]:hover:bg-slate-100 [&]:dark:hover:bg-blue-950/40">
              {tableHeaders
                .filter((header) => header.key === 'actions' || visibleColumns.has(header.key as keyof Project))
                .map((header, index, filteredArray) => (
                  <TableHead
                    key={header.key}
                    className={`h-auto py-3 ${header.key === 'name' || header.key === 'actions' ? 'text-center' : 'text-start'} ${header.width || ''} font-semibold text-xs text-[#06407F] dark:text-foreground/90 relative ${index < filteredArray.length - 1 ? 'after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-300 dark:after:bg-zinc-600' : ''}`}
                  >
                    {header.label}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <motion.tr
                  key={project.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariants}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {visibleColumns.has("name") && <TableCell className='font-medium text-center h-14 w-12 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>{index + 1}</TableCell>}

                  {visibleColumns.has("repository") && (
                    <TableCell className='text-start h-14 w-48 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                      <span className="text-foreground" style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>{project.repository}</span>
                    </TableCell>
                  )}

                  {visibleColumns.has("team") && (
                    <TableCell className='text-start h-14 w-32 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                      <span className={notoNaskhArabicClassName}>{project.team}</span>
                    </TableCell>
                  )}
                  {visibleColumns.has("tech") && <TableCell className='text-start h-14 w-32 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>{project.tech}</TableCell>}
                  {visibleColumns.has("createdAt") && (
                    <TableCell className='text-start h-14 w-40 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                      <span style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>{project.createdAt}</span>
                    </TableCell>
                  )}
                  {visibleColumns.has("contributors") && (
                    <TableCell className='text-start h-14 w-20 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                      {project.contributors}
                    </TableCell>
                  )}

                  {visibleColumns.has("status") && (
                    <TableCell className='text-start h-14 w-32 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                      <div className={cn(badgeVariants({ variant: project.status.variant }), "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium whitespace-nowrap rounded-md")} style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>
                        <div className={cn(dotVariants({ variant: project.status.variant }))}></div>
                        {project.status.text}
                      </div>
                    </TableCell>
                  )}

                  <TableCell className="text-center h-14 w-16">
                    <div className="flex justify-center items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => canEditButton && onEditClick?.(project)}
                            disabled={!canEditButton}
                            className={`p-1.5 rounded-md transition-all duration-150 ${
                              !canEditButton
                                ? "opacity-50 cursor-not-allowed text-foreground/70"
                                : "cursor-pointer hover:bg-slate-200 text-[#06407F]/70 hover:text-[#06407F] dark:hover:bg-blue-950/50 dark:text-foreground/70 dark:hover:text-foreground"
                            }`}
                            aria-label="Modifier"
                          >
                            <SquarePen size={16} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>تعديل</span>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.size + 1} className="h-24 text-center">
                  <span className="text-muted-foreground/60" style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>لا توجد نتائج</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
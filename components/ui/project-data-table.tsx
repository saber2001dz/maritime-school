import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

// --- TYPE DEFINITIONS ---
type StatusVariant = "success" | "inProgress" | "interrupted" | "notJoined";

export interface Project {
  id: string;
  name: string;
  repository: string;
  team: string;
  tech: string;
  createdAt: string;
  contributors: string;
  status: {
    text: string;
    variant: StatusVariant;
  };
}

// --- PROPS INTERFACE ---
interface ProjectDataTableProps {
  projects: Project[];
  visibleColumns: Set<keyof Project>;
}

// --- STATUS BADGE VARIANTS ---
const badgeVariants = cva("capitalize", {
  variants: {
    variant: {
      success: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
      inProgress: "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
      interrupted: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
      notJoined: "bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400",
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
      notJoined: "bg-gray-600 dark:bg-gray-400",
    },
  },
  defaultVariants: {
    variant: "success",
  },
});

// --- MAIN COMPONENT ---
export const ProjectDataTable = ({ projects, visibleColumns }: ProjectDataTableProps) => {
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
  
  const tableHeaders: { key: keyof Project; label: string }[] = [
    { key: "name", label: "#" },
    { key: "repository", label: "الدورة" },
    { key: "team", label: "تاريخ البداية" },
    { key: "tech", label: "تاريخ النهاية" },
    { key: "createdAt", label: "المرجع" },
    { key: "contributors", label: "المعدل" },
    { key: "status", label: "النتيجة" },
  ];

  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-amber-50 dark:bg-amber-950/20 [&]:hover:bg-amber-50 [&]:dark:hover:bg-amber-950/20">
              {tableHeaders
                .filter((header) => visibleColumns.has(header.key))
                .map((header, index, filteredArray) => (
                  <TableHead
                    key={header.key}
                    className={`text-start font-semibold text-sm relative ${index < filteredArray.length - 1 ? 'after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-border' : ''}`}
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
                  {visibleColumns.has("name") && <TableCell className="font-medium text-start h-14">{index + 1}</TableCell>}

                  {visibleColumns.has("repository") && (
                    <TableCell className="text-start h-14">
                      <a
                        href={project.repository}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span className="truncate max-w-xs">{project.repository.replace('https://', '')}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </TableCell>
                  )}

                  {visibleColumns.has("team") && <TableCell className="text-start h-14">{project.team}</TableCell>}
                  {visibleColumns.has("tech") && <TableCell className="text-start h-14">{project.tech}</TableCell>}
                  {visibleColumns.has("createdAt") && <TableCell className="text-start h-14">{project.createdAt}</TableCell>}
                  {visibleColumns.has("contributors") && (
                    <TableCell className="text-start h-14">
                      {project.contributors}
                    </TableCell>
                  )}

                  {visibleColumns.has("status") && (
                    <TableCell className="text-start h-14">
                      <div className={cn(badgeVariants({ variant: project.status.variant }), "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md")} style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>
                        <div className={cn(dotVariants({ variant: project.status.variant }))}></div>
                        {project.status.text}
                      </div>
                    </TableCell>
                  )}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.size} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
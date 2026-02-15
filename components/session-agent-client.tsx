"use client"

import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronDown, CirclePlus, SquarePen, Trash2, Check, X, Loader2 } from "lucide-react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { Project } from "@/components/ui/project-data-table"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/ultra-quality-toast"
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon"
import { can } from "@/lib/permissions"
import { usePermissions } from "@/lib/permissions-context"
import { useUIPermissions } from "@/lib/ui-permissions-context"
import { canAccessUIComponent } from "@/lib/ui-permissions"
import { RESULTAT_OPTIONS } from "@/lib/resultat-utils"

interface SessionAgentClientProps {
  initialData: Project[]
  sessionInfo: {
    reference: string | null
    dateDebut: Date
    dateFin: Date
    formationId: string
    formation: { formation: string }
  } | null
  notoNaskhArabicClassName: string
  returnUrl?: string
  sessionFormationId?: string
  formationId?: string
  nombreParticipants?: number
  userRole?: string | null
  userRoleId?: string | null
}

const allColumns: (keyof Project)[] = ["name", "repository", "team", "tech", "status"]

// En-têtes personnalisés pour la page session-agent
const getSessionAgentHeaders = (isSessionFinished: boolean) => {
  const headers: { key: keyof Project | "actions" | "confirmation"; label: string; width?: string }[] = [
    { key: "name" as const, label: "ع/ر", width: "w-10" },
    { key: "repository" as const, label: "الإســم و اللـقــب", width: "w-60" },
    { key: "team" as const, label: "الـرتبـــة", width: "w-28" },
    { key: "tech" as const, label: "الــرقـــم", width: "w-28" },
    { key: "status" as const, label: "النـتـيـجــــــة", width: "w-12" },
    { key: "actions" as const, label: "خيــــارات", width: "w-18" },
  ]

  // Ajouter la colonne de confirmation en dernière position si la session n'est pas terminée
  if (!isSessionFinished) {
    headers.push({ key: "confirmation" as const, label: "تأكيد المشاركة", width: "w-28 min-w-28 max-w-28" })
  }

  return headers
}

interface Agent {
  id: string
  matricule: string
  nomPrenom: string
  grade: string
}

// Composant pour les suggestions avec portail
const SuggestionsPortal = ({
  agents,
  inputRef,
  onSelect,
  isUpdating,
  show,
  onClose,
}: {
  agents: Agent[]
  inputRef: React.RefObject<HTMLInputElement | null>
  onSelect: (agent: Agent) => void
  isUpdating: boolean
  show: boolean
  onClose: () => void
}) => {
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calcul de la position
  useEffect(() => {
    if (show && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: 256, // w-64 = 16rem = 256px
      })
    } else {
      setPosition(null)
    }
  }, [show, inputRef])

  // Fermer si clic en dehors
  useEffect(() => {
    if (!show) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [show, inputRef, onClose])

  if (!show || !position || agents.length === 0) return null

  return createPortal(
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        maxHeight: "232px", // ~4 lignes exactement
        zIndex: 9999,
      }}
      className="overflow-auto border border-border rounded-md bg-popover shadow-lg"
    >
      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => onSelect(agent)}
          disabled={isUpdating}
          className="w-full px-3 py-2 text-start hover:bg-muted/50 cursor-pointer text-sm border-b border-border last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="font-medium">{agent.matricule}</div>
          <div className="text-xs text-muted-foreground">
            {agent.nomPrenom} - {agent.grade}
          </div>
        </button>
      ))}
    </div>,
    document.body,
  )
}

// Composant Table avec ligne d'édition intégrée
interface SessionAgentTableProps {
  projects: Project[]
  visibleColumns: Set<keyof Project>
  onEditClick?: (project: Project) => void
  onDeleteClick?: (project: Project) => void
  onConfirmParticipation?: (project: Project) => void
  onChangeResultat?: (project: Project, resultat: string) => void
  customHeaders?: { key: keyof Project | "actions" | "confirmation"; label: string; width?: string }[]
  notoNaskhArabicClassName?: string
  isAddingNew: boolean
  newMatricule: string
  onMatriculeChange: (value: string) => void
  onCancelAdd: () => void
  isUpdating: boolean
  confirmingRowId: string | null
  updatingResultatRowId: string | null
  inputRef: React.RefObject<HTMLInputElement | null>
  editingRowId: string | null
  editMatricule: string
  onEditMatriculeChange: (value: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  editInputRef: React.RefObject<HTMLInputElement | null>
  nombreParticipants?: number
  isSessionFinished?: boolean
  canUseResultatDropdown?: boolean
  canUseDeleteButton?: boolean
  canUseEditButton?: boolean
}

const SessionAgentTable = ({
  projects,
  visibleColumns,
  onEditClick,
  onDeleteClick,
  onConfirmParticipation,
  onChangeResultat,
  customHeaders,
  notoNaskhArabicClassName,
  isAddingNew,
  newMatricule,
  onMatriculeChange,
  onCancelAdd,
  isUpdating,
  confirmingRowId,
  updatingResultatRowId,
  inputRef,
  editingRowId,
  editMatricule,
  onEditMatriculeChange,
  onSaveEdit,
  onCancelEdit,
  editInputRef,
  nombreParticipants = 0,
  isSessionFinished = false,
  canUseResultatDropdown = true,
  canUseDeleteButton = true,
  canUseEditButton = true,
}: SessionAgentTableProps) => {
  const mounted = true
  const [openResultatDropdown, setOpenResultatDropdown] = useState<string | null>(null)
  const [resultatDropdownPos, setResultatDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const resultatBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    if (!openResultatDropdown) {
      setResultatDropdownPos(null)
      return
    }
    const btn = resultatBtnRefs.current.get(openResultatDropdown)
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setResultatDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX + rect.width / 2,
    })
  }, [openResultatDropdown])
  const defaultHeaders: { key: keyof Project | "actions" | "confirmation"; label: string; width?: string }[] = [
    { key: "name", label: "#", width: "w-10" },
    { key: "repository", label: "الإســم و اللـقــب", width: "w-60" },
    { key: "team", label: "الـرتبـــة", width: "w-28" },
    { key: "tech", label: "الــرقـــم", width: "w-28" },
    { key: "status", label: "النـتـيـجــــــة", width: "w-12" },
    { key: "actions", label: "خيــــارات", width: "w-18" },
  ]

  const tableHeaders = customHeaders || defaultHeaders

  // Animation variants
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = !shouldReduceMotion

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  }

  const rowVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as any,
      },
    },
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-blue-950/40 hover:bg-slate-100 dark:hover:bg-blue-950/40">
              {tableHeaders.map((header, index, arr) => (
                <th
                  key={header.key}
                  className={`h-auto py-3 px-2 ${header.key === "name" || header.key === "actions" || header.key === "confirmation" ? "text-center" : "text-start"} ${header.width || ""} font-semibold text-xs text-[#06407F] dark:text-foreground/90 relative ${index < arr.length - 1 ? 'after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-300 dark:after:bg-zinc-600' : ""}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <AnimatePresence mode="wait">
            <motion.tbody
              key={`table-${projects.length}`}
              variants={shouldAnimate ? containerVariants : {}}
              initial={shouldAnimate ? "hidden" : "visible"}
              animate="visible"
            >
            {/* Lignes existantes */}
            {projects.length > 0 ? (
              projects.map((project, index) => {
                const isEditing = editingRowId === project.id
                const isOverCapacity = nombreParticipants > 0 && index >= nombreParticipants
                const isConfirmed = project.status.variant !== "pending"
                return (
                  <motion.tr
                    key={project.id}
                    variants={shouldAnimate ? rowVariants : {}}
                    className={`border-b transition-colors ${
                      isEditing
                        ? "bg-blue-50/50 dark:bg-blue-950/20"
                        : isOverCapacity
                          ? "bg-red-100/70 dark:bg-red-800/30 hover:bg-red-200/70 dark:hover:bg-red-900/35"
                          : "hover:bg-muted/50"
                    }`}
                  >
                    <td className={`font-medium text-center h-[52px] w-12 px-4 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700 ${
                      isOverCapacity
                        ? "text-red-700 dark:text-red-400"
                        : ""
                    }`}>{index + 1}</td>
                    <td className='text-start h-[52px] w-48 px-4 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                      <span className={`${
                        isOverCapacity
                          ? "text-red-700 dark:text-red-400"
                          : "text-foreground"
                      }`} style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>
                        {project.repository}
                      </span>
                    </td>
                    <td className='text-start h-[52px] w-32 px-4 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                      <span className={`${notoNaskhArabicClassName} ${
                        isOverCapacity
                          ? "text-red-700 dark:text-red-400"
                          : ""
                      }`}>{project.team}</span>
                    </td>
                    <td className={`text-start h-[52px] w-32 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700 ${isEditing ? "px-2" : "px-4"}`}>
                      {isEditing ? (
                        <input
                          ref={editInputRef as any}
                          type="text"
                          value={editMatricule}
                          onChange={(e) => onEditMatriculeChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              onSaveEdit()
                            } else if (e.key === "Escape") {
                              onCancelEdit()
                            }
                          }}
                          onFocus={(e) => e.target.select()}
                          className="text-sm w-full px-2 py-1 border-0 border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span className={`text-sm ${
                          isOverCapacity
                            ? "text-red-700 dark:text-red-400"
                            : ""
                        }`}>{project.tech}</span>
                      )}
                    </td>
                    <td className='text-start h-[52px] w-32 px-4 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium whitespace-nowrap rounded-md ${
                          project.status.variant === "success"
                            ? "bg-green-50 text-green-600 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-700"
                            : project.status.variant === "inProgress"
                              ? "bg-yellow-50 text-yellow-600 border border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-700"
                              : project.status.variant === "interrupted"
                                ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-700"
                                : project.status.variant === "abandoned"
                                  ? "bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-700"
                                  : project.status.variant === "notJoined"
                                    ? "bg-cyan-50 text-cyan-600 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-700"
                                    : "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-700"
                        }`}
                        style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            project.status.variant === "success"
                              ? "bg-green-600 dark:bg-green-400"
                              : project.status.variant === "inProgress"
                                ? "bg-yellow-600 dark:bg-yellow-400"
                                : project.status.variant === "interrupted"
                                  ? "bg-red-600 dark:bg-red-400"
                                  : project.status.variant === "abandoned"
                                    ? "bg-orange-600 dark:bg-orange-400"
                                    : project.status.variant === "notJoined"
                                      ? "bg-cyan-600 dark:bg-cyan-400"
                                      : "bg-blue-600 dark:bg-blue-400"
                          }`}
                        />
                        {project.status.text}
                      </div>
                    </td>
                    <td className={`text-center h-[52px] w-16 px-4 relative ${!isSessionFinished ? 'after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700' : ""}`}>
                      {isEditing ? (
                        <div className="flex justify-center items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={onSaveEdit}
                                disabled={isUpdating}
                                className="p-1.5 rounded-md transition-all duration-150 cursor-pointer hover:bg-green-100 text-green-600/70 hover:text-green-600 dark:text-green-500 dark:hover:bg-green-900/40 dark:hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Enregistrer"
                              >
                                <Check size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>حفظ</span>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={onCancelEdit}
                                disabled={isUpdating}
                                className="p-1.5 rounded-md transition-all duration-150 cursor-pointer hover:bg-red-100 text-red-600/70 hover:text-red-600 dark:text-red-500 dark:hover:bg-red-900/40 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Annuler"
                              >
                                <X size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>إلغاء</span>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center gap-1">
                          {/* Bouton édition - masqué si session terminée ou si confirmé, désactivé si pas de permission UI */}
                          {!isSessionFinished && !isConfirmed && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => canUseEditButton && onEditClick?.(project)}
                                  disabled={isAddingNew || !canUseEditButton}
                                  className={`p-1.5 rounded-md transition-all duration-150 ${
                                    isAddingNew || !canUseEditButton
                                      ? "opacity-50 cursor-not-allowed text-foreground/70"
                                      : "cursor-pointer hover:bg-slate-200 text-[#06407F]/70 hover:text-[#06407F] dark:text-blue-500 dark:hover:bg-blue-900/40 dark:hover:text-blue-400"
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
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => canUseDeleteButton && onDeleteClick?.(project)}
                                disabled={isAddingNew || !canUseDeleteButton}
                                className={`p-1.5 rounded-md transition-all duration-150 ${
                                  isAddingNew || !canUseDeleteButton
                                    ? "opacity-50 cursor-not-allowed text-foreground/70"
                                    : "cursor-pointer hover:bg-red-100 text-red-600/70 hover:text-red-600 dark:text-red-500 dark:hover:bg-red-900/40 dark:hover:text-red-400"
                                }`}
                                aria-label="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>حذف</span>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </td>
                    {/* Colonne de confirmation - seulement si session non terminée */}
                    {!isSessionFinished && (
                      <td className="text-center h-[52px] w-28 min-w-28 max-w-28 px-2">
                        <div className="flex items-center justify-center w-full h-full">
                          {isConfirmed ? (
                            /* Dropdown pour changer le résultat */
                            <div>
                              <button
                                ref={(el) => {
                                  if (el) resultatBtnRefs.current.set(project.id, el)
                                  else resultatBtnRefs.current.delete(project.id)
                                }}
                                onClick={() => canUseResultatDropdown && updatingResultatRowId !== project.id && setOpenResultatDropdown(openResultatDropdown === project.id ? null : project.id)}
                                disabled={updatingResultatRowId === project.id || !canUseResultatDropdown}
                                className={`flex items-center justify-between gap-1 min-w-[118px] px-2 py-2 rounded-md border transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${!canUseResultatDropdown ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${
                                  project.status.variant === "success"
                                    ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                    : project.status.variant === "inProgress"
                                      ? "border-yellow-600 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                                      : project.status.variant === "interrupted"
                                        ? "border-red-600 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                        : project.status.variant === "abandoned"
                                          ? "border-orange-600 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                                          : "border-cyan-600 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50"
                                }`}
                              >
                                {updatingResultatRowId === project.id
                                  ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                                  : <Check className="h-3.5 w-3.5 shrink-0" />
                                }
                                <span
                                  className="text-[11px] font-semibold whitespace-nowrap"
                                  style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}
                                >
                                  {RESULTAT_OPTIONS.find(o => o.value === project.status.value)?.label ?? project.status.text}
                                </span>
                                {updatingResultatRowId !== project.id && <ChevronDown className={`h-3 w-3 shrink-0 ${canUseResultatDropdown ? "opacity-60" : "invisible"}`} />}
                              </button>
                              {openResultatDropdown === project.id && resultatDropdownPos && mounted && createPortal(
                                <>
                                  <div className="fixed inset-0 z-9998" onClick={() => setOpenResultatDropdown(null)} />
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: `${resultatDropdownPos.top}px`,
                                      left: `${resultatDropdownPos.left}px`,
                                      transform: "translateX(-50%)",
                                      width: "144px",
                                      zIndex: 9999,
                                    }}
                                    className="bg-background border border-border/50 shadow-lg rounded-md"
                                  >
                                    {RESULTAT_OPTIONS.map((opt) => (
                                      <button
                                        key={opt.value}
                                        onClick={() => {
                                          onChangeResultat?.(project, opt.value)
                                          setOpenResultatDropdown(null)
                                        }}
                                        className="w-full cursor-pointer px-3 py-2 text-right text-sm hover:bg-muted/50 transition-colors first:rounded-t-md last:rounded-b-md border-b border-border/30 last:border-b-0"
                                        style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}
                                      >
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                </>,
                                document.body
                              )}
                            </div>
                          ) : (
                            /* Bouton de confirmation initial */
                            <button
                              onClick={() => onConfirmParticipation?.(project)}
                              disabled={confirmingRowId === project.id}
                              className="flex items-center justify-center gap-0.5 min-w-[118px] px-2 py-2 rounded-md border transition-all duration-200 cursor-pointer border-border bg-slate-50 hover:bg-slate-100 text-[#06407F]/80 hover:text-[#06407F] dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:text-foreground/80 dark:hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {confirmingRowId === project.id
                                ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                                : <MenuToggleIcon open={false} className="h-3.5 w-3.5" />
                              }
                              <span
                                className="text-[11px] font-semibold whitespace-nowrap"
                                style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}
                              >
                                المـوافـقــــــة
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={isSessionFinished ? 6 : 7} className="h-24 text-center">
                  <span className="text-muted-foreground/60" style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>
                    لا توجد نتائج
                  </span>
                </td>
              </tr>
            )}

            {/* Ligne en mode ajout - affichée en dernière position */}
            {isAddingNew && (
              <tr className="border-b transition-colors bg-blue-50/50 dark:bg-blue-950/20">
                <td className='font-medium text-center h-[52px] w-12 px-4 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>{projects.length + 1}</td>
                <td className='text-start h-[52px] w-48 px-4 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                  <span className="text-foreground/30" style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>
                    -
                  </span>
                </td>
                <td className='text-start h-[52px] w-32 px-4 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                  <span className={`${notoNaskhArabicClassName} text-foreground/30`}>-</span>
                </td>
                <td className='text-start h-[52px] w-32 px-2 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                  <input
                    ref={inputRef as any}
                    type="text"
                    value={newMatricule}
                    onChange={(e) => onMatriculeChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        onCancelAdd()
                      }
                    }}
                    disabled={isUpdating}
                    className="text-sm w-full px-2 py-1 border-0 border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoFocus
                  />
                </td>
                <td className='text-start h-[52px] w-32 px-4 relative after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700'>
                  <span className="text-sm text-muted-foreground/50">-</span>
                </td>
                <td className={`text-center h-[52px] w-16 px-4 relative ${!isSessionFinished ? 'after:content-[""] after:absolute after:left-0 after:top-2 after:bottom-2 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700' : ""}`}>
                  <div className="flex justify-center items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={onCancelAdd}
                          disabled={isUpdating}
                          className="p-1.5 rounded-md transition-all duration-150 cursor-pointer hover:bg-red-100 text-red-600/70 hover:text-red-600 dark:hover:bg-red-950/50 dark:text-foreground/70 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="إلغاء"
                        >
                          <X size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>إلغاء</span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </td>
                {/* Colonne de confirmation - seulement si session non terminée */}
                {!isSessionFinished && (
                  <td className="text-center h-[52px] w-28 min-w-28 max-w-28 px-2">
                    <span className="text-sm text-muted-foreground/50">-</span>
                  </td>
                )}
              </tr>
            )}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>
    </div>
  )
}

export default function SessionAgentClient({
  initialData,
  sessionInfo,
  notoNaskhArabicClassName,
  returnUrl = "/session-formation",
  sessionFormationId,
  formationId,
  nombreParticipants = 0,
  userRole,
  userRoleId,
}: SessionAgentClientProps) {
  const permissionsMap = usePermissions()
  const uiPermissionsMap = useUIPermissions()
  const canUseResultatDropdown = canAccessUIComponent(userRoleId ?? null, "session_agent_confirmation_dropdown", uiPermissionsMap)
  const canUseDeleteButton = canAccessUIComponent(userRoleId ?? null, "session_agent_delete_button", uiPermissionsMap)
  const canUseEditButton = canAccessUIComponent(userRoleId ?? null, "session_agent_edit_button", uiPermissionsMap)
  const router = useRouter()
  const { addToast } = useToast()
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Project>>(new Set(allColumns))
  const [isUpdating, setIsUpdating] = useState(false)
  const [confirmingRowId, setConfirmingRowId] = useState<string | null>(null)
  const [updatingResultatRowId, setUpdatingResultatRowId] = useState<string | null>(null)

  // Calculer si la session est terminée (date fin atteinte)
  const isSessionFinished = sessionInfo ? new Date(sessionInfo.dateFin) < new Date() : false

  // État local pour les données (synchronisé avec initialData)
  const [localData, setLocalData] = useState<Project[]>(initialData)

  // État pour la confirmation de suppression
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // État pour la nouvelle ligne en mode ajout
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newMatricule, setNewMatricule] = useState("")
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // État pour l'édition inline
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editMatricule, setEditMatricule] = useState("")
  const [originalEditMatricule, setOriginalEditMatricule] = useState("")
  const [filteredEditAgents, setFilteredEditAgents] = useState<Agent[]>([])
  const [showEditSuggestions, setShowEditSuggestions] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Synchroniser localData avec initialData quand il change
  useEffect(() => {
    setLocalData(initialData)
  }, [initialData])

  // Charger la liste des agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents")
        if (response.ok) {
          const data = await response.json()
          setAgents(data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des agents:", error)
      }
    }
    fetchAgents()
  }, [])

  // Filtrer les agents selon la saisie (mode ajout)
  useEffect(() => {
    if (newMatricule.trim()) {
      const filtered = agents.filter((agent) => agent.matricule.toLowerCase().startsWith(newMatricule.toLowerCase()))
      setFilteredAgents(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredAgents([])
      setShowSuggestions(false)
    }
  }, [newMatricule, agents])

  // Filtrer les agents selon la saisie (mode édition)
  useEffect(() => {
    // Ne montrer les suggestions que si l'utilisateur a modifié le matricule
    if (editMatricule.trim() && editMatricule !== originalEditMatricule) {
      const filtered = agents.filter((agent) => agent.matricule.toLowerCase().startsWith(editMatricule.toLowerCase()))
      setFilteredEditAgents(filtered)
      setShowEditSuggestions(filtered.length > 0)
    } else {
      setFilteredEditAgents([])
      setShowEditSuggestions(false)
    }
  }, [editMatricule, agents, originalEditMatricule])

  const handleEditClick = async (project: Project) => {
    const currentMatricule = project.tech || ""
    setEditingRowId(project.id)
    setEditMatricule(currentMatricule)
    setOriginalEditMatricule(currentMatricule)
    // Le focus et la sélection sont gérés automatiquement par l'attribut autoFocus de l'input
  }

  const handleCancelEdit = () => {
    setEditingRowId(null)
    setEditMatricule("")
    setOriginalEditMatricule("")
    setShowEditSuggestions(false)
  }

  const handleSaveEdit = async () => {
    if (!editingRowId || !sessionFormationId || !formationId || !sessionInfo) {
      console.error("Informations manquantes pour la sauvegarde")
      return
    }

    // Trouver l'agent correspondant au matricule saisi
    const selectedAgent = agents.find((agent) => agent.matricule === editMatricule)

    if (!selectedAgent) {
      addToast({
        title: "عون غير موجود",
        description: "الرجاء اختيار عون صالح من القائمة",
        variant: "warning",
      })
      return
    }

    setIsUpdating(true)

    try {
      // Supprimer l'ancien AgentFormation
      const deleteResponse = await fetch(`/api/session-agents/${editingRowId}`, {
        method: "DELETE",
      })

      if (!deleteResponse.ok) {
        const deleteResult = await deleteResponse.json()
        throw new Error(deleteResult.error || "Erreur lors de la suppression")
      }

      // Créer un nouveau AgentFormation avec le nouvel agent
      const createResponse = await fetch("/api/session-agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionFormationId,
          agentId: selectedAgent.id,
          formationId,
          dateDebut: new Date(sessionInfo.dateDebut).toISOString().split("T")[0],
          dateFin: new Date(sessionInfo.dateFin).toISOString().split("T")[0],
          moyenne: 0,
        }),
      })

      const createResult = await createResponse.json()

      if (!createResponse.ok) {
        throw new Error(createResult.error || "Erreur lors de l'ajout du nouvel agent")
      }

      // Mise à jour optimiste : remplacer la ligne modifiée immédiatement
      const updatedData = localData.map((project) => {
        if (project.id === editingRowId) {
          return {
            ...project,
            id: createResult.id || project.id,
            repository: selectedAgent.nomPrenom,
            team: selectedAgent.grade,
            tech: selectedAgent.matricule,
          }
        }
        return project
      })

      setLocalData(updatedData)
      handleCancelEdit()

      // Rafraîchir les données en arrière-plan
      router.refresh()
    } catch (err: any) {
      console.error(err)
      addToast({
        title: "خطأ في التعديل",
        description: err.message || "حدث خطأ أثناء تعديل العون",
        variant: "error",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSelectEditAgent = async (agent: Agent) => {
    if (!editingRowId || !sessionFormationId || !formationId || !sessionInfo) {
      console.error("Informations manquantes")
      return
    }

    // Vérifier si l'agent est déjà dans la table (en excluant la ligne en cours d'édition)
    const isAgentAlreadyAdded = localData.some(
      (project) => project.tech === agent.matricule && project.id !== editingRowId
    )
    if (isAgentAlreadyAdded) {
      addToast({
        title: "عون موجود بالفعل",
        description: "هـذا العـون مسجـل في هـذه الــدورة",
        variant: "warning",
      })
      // Restaurer le matricule original
      setEditMatricule(originalEditMatricule)
      setShowEditSuggestions(false)
      // Donner le focus à l'input
      setTimeout(() => {
        editInputRef.current?.focus()
        editInputRef.current?.select()
      }, 100)
      return
    }

    setIsUpdating(true)

    try {
      // Supprimer l'ancien AgentFormation
      const deleteResponse = await fetch(`/api/session-agents/${editingRowId}`, {
        method: "DELETE",
      })

      if (!deleteResponse.ok) {
        const deleteResult = await deleteResponse.json()
        throw new Error(deleteResult.error || "Erreur lors de la suppression")
      }

      // Créer un nouveau AgentFormation avec le nouvel agent
      const createResponse = await fetch("/api/session-agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionFormationId,
          agentId: agent.id,
          formationId,
          dateDebut: new Date(sessionInfo.dateDebut).toISOString().split("T")[0],
          dateFin: new Date(sessionInfo.dateFin).toISOString().split("T")[0],
          moyenne: 0,
        }),
      })

      const createResult = await createResponse.json()

      if (!createResponse.ok) {
        throw new Error(createResult.error || "Erreur lors de l'ajout du nouvel agent")
      }

      // Mise à jour optimiste : remplacer la ligne modifiée immédiatement
      const updatedData = localData.map((project) => {
        if (project.id === editingRowId) {
          return {
            ...project,
            id: createResult.id || project.id,
            repository: agent.nomPrenom,
            team: agent.grade,
            tech: agent.matricule,
          }
        }
        return project
      })

      setLocalData(updatedData)
      handleCancelEdit()

      // Rafraîchir les données en arrière-plan
      router.refresh()
    } catch (err: any) {
      console.error(err)
      addToast({
        title: "خطأ في التعديل",
        description: err.message || "حدث خطأ أثناء تعديل العون",
        variant: "error",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBackClick = () => {
    router.push(returnUrl)
  }

  const handleAddNewAgent = () => {
    setIsAddingNew(true)
    setNewMatricule("")
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleCancelAdd = () => {
    setIsAddingNew(false)
    setNewMatricule("")
    setShowSuggestions(false)
  }

  const handleSelectAgent = async (agent: Agent) => {
    if (!sessionFormationId || !formationId || !sessionInfo) {
      console.error("Informations de session manquantes")
      return
    }

    // Vérifier si l'agent est déjà dans la table
    const isAgentAlreadyAdded = localData.some((project) => project.tech === agent.matricule)
    if (isAgentAlreadyAdded) {
      addToast({
        title: "عون موجود بالفعل",
        description: "هـذا العـون مسجـل في هـذه الــدورة",
        variant: "warning",
      })
      // Vider l'input en mode ajout
      setNewMatricule("")
      setShowSuggestions(false)
      // Donner le focus à l'input
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch("/api/session-agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionFormationId,
          agentId: agent.id,
          formationId,
          dateDebut: new Date(sessionInfo.dateDebut).toISOString().split("T")[0],
          dateFin: new Date(sessionInfo.dateFin).toISOString().split("T")[0],
          moyenne: 0,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'ajout de l'agent")
      }

      // Mise à jour optimiste : ajouter la nouvelle ligne immédiatement
      const newProject: Project = {
        id: result.id || `temp-${Date.now()}`,
        name: (localData.length + 1).toString(),
        repository: agent.nomPrenom,
        team: agent.grade,
        tech: agent.matricule,
        createdAt: "",
        contributors: "",
        status: {
          text: "-",
          variant: "notJoined",
        },
        formationId: sessionFormationId || "",
      }

      setLocalData([...localData, newProject])
      handleCancelAdd()

      // Rafraîchir les données en arrière-plan
      router.refresh()
    } catch (err: any) {
      console.error(err)
      addToast({
        title: "خطأ في الإضافة",
        description: err.message || "حدث خطأ أثناء إضافة العون",
        variant: "error",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/session-agents/${projectToDelete.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la suppression")
      }

      // Mise à jour optimiste : supprimer la ligne immédiatement
      setLocalData(localData.filter((project) => project.id !== projectToDelete.id))
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)

      // Rafraîchir les données en arrière-plan
      router.refresh()
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err)
      addToast({
        title: "خطأ في الحذف",
        description: err.message || "حدث خطأ أثناء حذف العون",
        variant: "error",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setProjectToDelete(null)
  }

  // Handler pour la confirmation de participation
  const handleConfirmParticipation = async (project: Project) => {
    if (!sessionFormationId) {
      console.error("Session formation ID manquant")
      return
    }

    setConfirmingRowId(project.id)

    try {
      const response = await fetch(`/api/session-agents/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resultat: "لم يلتحق",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la confirmation")
      }

      // Mise à jour optimiste : changer le statut immédiatement
      const updatedData = localData.map((p) => {
        if (p.id === project.id) {
          return {
            ...p,
            status: {
              text: "لم يلتحق",
              variant: "notJoined" as const,
              value: "لم يلتحق",
            },
          }
        }
        return p
      })

      setLocalData(updatedData)

      // Rafraîchir les données en arrière-plan
      router.refresh()
    } catch (err: any) {
      console.error("Erreur lors de la confirmation:", err)
      addToast({
        title: "خطأ في التأكيد",
        description: err.message || "حدث خطأ أثناء تأكيد المشاركة",
        variant: "error",
      })
    } finally {
      setConfirmingRowId(null)
    }
  }

  // Handler pour changer le résultat d'une ligne confirmée
  const handleChangeResultat = async (project: Project, resultat: string) => {
    setUpdatingResultatRowId(project.id)
    try {
      const response = await fetch(`/api/session-agents/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultat }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la mise à jour")
      }

      const option = RESULTAT_OPTIONS.find(o => o.value === resultat)
      setLocalData(localData.map((p) =>
        p.id === project.id
          ? { ...p, status: { text: option?.label ?? resultat, variant: option?.variant ?? "pending", value: resultat } }
          : p
      ))

      router.refresh()
    } catch (err: any) {
      console.error(err)
      addToast({
        title: "خطأ في التحديث",
        description: err.message || "حدث خطأ أثناء تحديث النتيجة",
        variant: "error",
      })
    } finally {
      setUpdatingResultatRowId(null)
    }
  }

  return (
    <div className="bg-background py-6 md:py-12">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        <div className="mb-8 md:mb-12 pt-4">
          {/* Header avec le même style que cours-formateur */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={handleBackClick}
                className="p-1.5 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                aria-label="Retour à la liste des sessions"
              >
                <ChevronRight className="h-5 w-5 text-foreground/70 hover:text-foreground" />
              </button>
              <h1 className={`text-xl font-bold text-foreground ${notoNaskhArabicClassName}`}>
                قــائـمــة الأعـــوان
                {sessionInfo && (
                  <>
                    <span className="text-foreground/60 font-normal mr-2">: {sessionInfo.formation.formation}</span>
                    <span className="text-foreground/50 font-normal text-sm mr-2">
                      (من {new Date(sessionInfo.dateDebut).toLocaleDateString("fr-FR").split("/").join("-")} إلى{" "}
                      {new Date(sessionInfo.dateFin).toLocaleDateString("fr-FR").split("/").join("-")})
                    </span>
                  </>
                )}
              </h1>
            </div>

            {/* Indicateur de capacité et bouton ajouter - masqués si session terminée */}
            {!isSessionFinished ? (
              <div className="flex justify-between items-center gap-4">
                {/* Indicateur de capacité */}
                {nombreParticipants > 0 && (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                      localData.length > nombreParticipants
                        ? "bg-red-50/70 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
                        : "bg-blue-50/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700"
                    }`}
                    style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}
                  >
                    <span className="font-medium">
                      عــدد الأقـصى للمتربصين : {nombreParticipants}
                    </span>
                    <span className="text-foreground/50">|</span>
                    <span className="font-medium">
                      عدد الأعوان المسجلين : {localData.length}
                    </span>
                    <span className="text-foreground/50">|</span>
                    <span className="font-medium">
                      تمت الموافقة عليهم : {localData.filter(p => p.status.variant !== "pending").length}
                    </span>
                    {localData.length > nombreParticipants && (
                      <>
                        <span className="text-foreground/50">|</span>
                        <span className="font-semibold">
                          تجــاوز : + {localData.length - nombreParticipants}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Bouton ajouter nouvel agent */}
                {can(userRole, "sessionAgent", "create", permissionsMap) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleAddNewAgent}
                      disabled={isAddingNew || editingRowId !== null}
                      className="ml-1 p-2 border border-border text-sm transition-colors flex items-center justify-center rounded-md cursor-pointer bg-slate-100 text-[#06407F] hover:bg-slate-200 dark:bg-blue-950/40 dark:text-foreground/90 dark:hover:bg-blue-950/60 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="إضافة عون جديد"
                    >
                      <CirclePlus size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>إضافة عون جديد</p>
                  </TooltipContent>
                </Tooltip>
                )}
              </div>
            ) : (
              // Espacement de remplacement pour maintenir la distance avec la table
              <div className="h-6"></div>
            )}
          </div>

          {/* Table avec ligne d'édition intégrée */}
          <SessionAgentTable
            projects={localData}
            visibleColumns={visibleColumns}
            onEditClick={can(userRole, "sessionAgent", "edit", permissionsMap) ? handleEditClick : undefined}
            onDeleteClick={can(userRole, "sessionAgent", "delete", permissionsMap) ? handleDeleteClick : undefined}
            onConfirmParticipation={can(userRole, "sessionAgent", "edit", permissionsMap) ? handleConfirmParticipation : undefined}
            onChangeResultat={can(userRole, "sessionAgent", "edit", permissionsMap) ? handleChangeResultat : undefined}
            canUseResultatDropdown={canUseResultatDropdown}
            canUseDeleteButton={canUseDeleteButton}
            canUseEditButton={canUseEditButton}
            customHeaders={getSessionAgentHeaders(isSessionFinished)}
            notoNaskhArabicClassName={notoNaskhArabicClassName}
            isAddingNew={isAddingNew}
            newMatricule={newMatricule}
            onMatriculeChange={setNewMatricule}
            onCancelAdd={handleCancelAdd}
            isUpdating={isUpdating}
            confirmingRowId={confirmingRowId}
            updatingResultatRowId={updatingResultatRowId}
            inputRef={inputRef}
            editingRowId={editingRowId}
            editMatricule={editMatricule}
            onEditMatriculeChange={setEditMatricule}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            editInputRef={editInputRef}
            nombreParticipants={nombreParticipants}
            isSessionFinished={isSessionFinished}
          />

          {/* Portails de suggestions */}
          <SuggestionsPortal
            agents={filteredAgents}
            inputRef={inputRef}
            onSelect={handleSelectAgent}
            isUpdating={isUpdating}
            show={showSuggestions}
            onClose={() => setShowSuggestions(false)}
          />
          <SuggestionsPortal
            agents={filteredEditAgents}
            inputRef={editInputRef}
            onSelect={handleSelectEditAgent}
            isUpdating={isUpdating}
            show={showEditSuggestions}
            onClose={() => setShowEditSuggestions(false)}
          />
        </div>
      </div>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right" style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right block" style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
              <span className="block">هل أنت متأكد من حذف هذا العون من الدورة؟ لا يمكن التراجع عن هذا الإجراء.</span>
              {projectToDelete && (
                <span className="block mt-4 p-3 bg-muted rounded-md">
                  <span className="block font-medium">{projectToDelete.repository}</span>
                  <span className="block text-sm text-muted-foreground">
                    {projectToDelete.team} - {projectToDelete.tech}
                  </span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel
              onClick={handleCancelDelete}
              disabled={isDeleting}
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              إلغــــاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              {isDeleting ? "جاري الحذف..." : "حـــــذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

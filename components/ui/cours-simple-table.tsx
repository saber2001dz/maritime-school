"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Pencil, Plus } from "lucide-react"
import localFont from "next/font/local"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"

const notoNaskhArabic = localFont({
  src: "../../app/fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

export interface SimpleCours {
  id: string
  number: string
  titre: string
}

interface CoursSimpleTableProps {
  cours?: SimpleCours[]
  className?: string
  onEditClick?: (cours: SimpleCours) => void
  onAddNewCours?: () => void
}

export default function CoursSimpleTable({
  cours = [],
  className = "",
  onEditClick,
  onAddNewCours,
}: CoursSimpleTableProps) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {/* Header avec bouton d'ajout */}
      {onAddNewCours && (
        <div className="mb-4 flex justify-end ml-4 -mt-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onAddNewCours}
                className={`p-2 border border-border text-sm transition-colors flex items-center justify-center rounded-md cursor-pointer ${
                  mounted
                    ? isDark
                      ? "bg-blue-950/40 text-foreground/90 hover:bg-blue-950/60"
                      : "bg-slate-100 text-[#06407F] hover:bg-slate-200"
                    : "bg-muted/5 text-foreground hover:bg-muted/10"
                }`}
                aria-label="إضافة درس جديد"
              >
                <Plus size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <span className={notoNaskhArabic.className}>إضافة درس جديد</span>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Table Container - No headers, matching liste-formation style */}
      <motion.div
        className="space-y-2"
        variants={{
          hidden: { opacity: 1 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
              delayChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="visible"
      >
        {cours.map((item) => (
          <motion.div
            key={item.id}
            variants={{
              hidden: {
                opacity: 0,
                x: 50,
                scale: 0.95,
                filter: "blur(4px)",
              },
              visible: {
                opacity: 1,
                x: 0,
                scale: 1,
                filter: "blur(0px)",
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                  mass: 0.6,
                },
              },
            }}
            className="relative"
          >
            <motion.div
              className="relative bg-muted/50 border border-border/50 rounded-xl p-4 overflow-hidden"
              whileHover={{
                y: -1,
                transition: { type: "spring", stiffness: 400, damping: 25 },
              }}
            >
              {/* Gradient de fond rose/fuchsia */}
              <div
                className="absolute inset-0 bg-linear-to-l from-blue-600/12 dark:from-blue-400/12 to-transparent pointer-events-none"
                style={{
                  backgroundSize: "80% 100%",
                  backgroundPosition: "right",
                  backgroundRepeat: "no-repeat",
                }}
              />

              {/* Contenu de la ligne */}
              <div
                className="relative grid gap-4 items-center"
                style={{ gridTemplateColumns: "1fr 6fr 1fr" }}
              >
                {/* Column 1: N/O (Numero d'ordre) */}
                <div>
                  <span className="text-2xl font-bold text-muted-foreground">{item.number}</span>
                </div>

                {/* Column 2: Titre */}
                <div className="flex items-center gap-3">
                  <span className={`text-foreground font-medium ${notoNaskhArabic.className}`}>
                    {item.titre}
                  </span>
                </div>

                {/* Column 3: Action (Edit button) */}
                <div className="flex items-center justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditClick?.(item)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className={notoNaskhArabic.className}>تعديل الدرس</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}

        {/* Empty State */}
        {cours.length === 0 && (
          <div className="text-center py-12 rounded-lg bg-muted/30 text-muted-foreground">
            <p className={notoNaskhArabic.className}>لا توجد دروس متاحة</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

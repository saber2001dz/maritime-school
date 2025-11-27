"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil } from "lucide-react"
import localFont from "next/font/local"
import DialogueFormation, { type FormationData } from "@/components/dialogue-formation"
import { ToastProvider, useToast } from "@/components/ui/ultra-quality-toast"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

const notoNaskhArabic = localFont({
  src: "../../app/fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

export interface Server {
  id: string
  number: string
  serviceName: string
  specialite: string
  dueDate: string
  capaciteAbsorption: number
  status: "active" | "paused" | "inactive"
}

interface ServerManagementTableProps {
  title?: string
  servers?: Server[]
  className?: string
}

function ServerManagementTableContent({
  title = "الــــدورات التـكـــويـنـيـــة :",
  servers: initialServers = [],
  className = "",
}: ServerManagementTableProps = {}) {
  const [servers, setServers] = useState<Server[]>(initialServers)
  const [editingFormation, setEditingFormation] = useState<FormationData | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { addToast } = useToast()

  // Synchroniser les données du serveur avec l'état local
  useEffect(() => {
    setServers(initialServers)
  }, [initialServers])

  // Convertir Server en FormationData
  const serverToFormationData = (server: Server): FormationData => {
    const typeFormation =
      server.status === "active"
        ? "تكوين إختصاص"
        : server.status === "paused"
        ? "تكوين تخصصي"
        : "تكوين مستمر"

    return {
      id: server.id,
      formation: server.serviceName,
      typeFormation,
      specialite: server.specialite || null,
      duree: server.dueDate || null,
      capaciteAbsorption: server.capaciteAbsorption || null,
    }
  }

  // Convertir FormationData en status
  const getStatusFromType = (typeFormation: string): Server["status"] => {
    if (typeFormation === "تكوين إختصاص") return "active"
    if (typeFormation === "تكوين تخصصي") return "paused"
    return "inactive"
  }

  const handleEditClick = (server: Server) => {
    const formationData = serverToFormationData(server)
    setEditingFormation(formationData)
  }

  const handleSaveFormation = async (data: FormationData) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/formations/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          typeFormation: data.typeFormation,
          formation: data.formation,
          specialite: data.specialite,
          duree: data.duree,
          capaciteAbsorption: data.capaciteAbsorption,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      // Mettre à jour l'état local en convertissant FormationData en Server
      setServers((prevServers) =>
        prevServers.map((s) =>
          s.id === data.id
            ? {
                ...s,
                serviceName: data.formation,
                status: getStatusFromType(data.typeFormation),
                specialite: data.specialite || "",
                dueDate: data.duree || "",
                capaciteAbsorption: data.capaciteAbsorption || 0,
              }
            : s
        )
      )

      // Afficher le toast de succès
      addToast({
        variant: "success",
        title: "نجـاح العمليـة",
        description: "تم حفظ البيانات بنجاح",
      })

      // Fermer le dialogue
      setEditingFormation(null)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)

      // Afficher le toast d'erreur
      addToast({
        variant: "error",
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حفظ البيانات",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCloseDialog = () => {
    setEditingFormation(null)
  }

  const getCapacityBars = (capacity: number, status: Server["status"]) => {
    const maxCapacity = 50
    const filledBars = Math.round((capacity / maxCapacity) * 10)

    const getBarColor = (index: number) => {
      // Si l'index est inférieur au nombre de barres remplies, colorier la barre selon le type de formation
      if (index < filledBars) {
        switch (status) {
          case "active":
            return "bg-yellow-600/70"
          case "paused":
            return "bg-[#06417F]/70 dark:bg-blue-400/70"
          case "inactive":
            return "bg-purple-500/70"
          default:
            return "bg-foreground/60"
        }
      }

      // Barre vide pour la capacité restante
      return "bg-muted/40 border border-border/30"
    }

    return (
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className={`w-1.5 h-5 rounded-full transition-all duration-500 ${getBarColor(index)}`} />
          ))}
        </div>
        <span className="text-sm font-mono text-foreground font-medium min-w-12">50/{capacity}</span>
      </div>
    )
  }

  const getStatusBadge = (status: Server["status"]) => {
    switch (status) {
      case "active":
        return (
          <div className="px-3 py-1.5 rounded-lg bg-yellow-600/10 border border-yellow-600/30 flex items-center justify-center">
            <span className={`text-yellow-600 text-sm font-medium ${notoNaskhArabic.className}`}>تكوين إختصاص</span>
          </div>
        )
      case "paused":
        return (
          <div className="px-3 py-1.5 rounded-lg bg-[#06417F]/10 dark:bg-blue-400/10 border border-[#06417F]/30 dark:border-blue-400/30 flex items-center justify-center">
            <span className={`text-[#06417F] dark:text-blue-400 text-sm font-medium ${notoNaskhArabic.className}`}>تكوين تخصصي</span>
          </div>
        )
      case "inactive":
        return (
          <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <span className={`text-purple-500 text-sm font-medium ${notoNaskhArabic.className}`}>تكوين مستمر</span>
          </div>
        )
    }
  }

  const getStatusGradient = (status: Server["status"]) => {
    switch (status) {
      case "active":
        return "from-yellow-600/10 to-transparent"
      case "paused":
        return "from-[#06417F]/10 dark:from-blue-400/10 to-transparent"
      case "inactive":
        return "from-purple-500/10 to-transparent"
    }
  }

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${className}`}>
      <div className="relative border border-border/30 rounded-2xl p-6 bg-gray-50 dark:bg-gray-900/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff00] shadow-[0_0_8px_#00ff00,0_0_12px_#00ff00] animate-pulse" />
              <h1 className={`text-xl font-bold text-foreground ${notoNaskhArabic.className}`}>{title}</h1>
            </div>
            <div className={`text-xs text-muted-foreground ${notoNaskhArabic.className}`}>
              {servers.filter((s) => s.status === "active").length} تكـويــن إختصـاص - {"  "}
              {servers.filter((s) => s.status === "paused").length}  تكـويــن تخــصصي - {"  "}
              {servers.filter((s) => s.status === "inactive").length}  تكـويــن مسـتـمــر 
            </div>
          </div>
        </div>

        {/* Table */}
        <motion.div
          className="space-y-2"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          {/* En-têtes du tableau des formations */}
          <div
            className="grid gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider"
            style={{ gridTemplateColumns: "1fr 3fr 1.5fr 1.5fr 2.5fr 2fr 1fr" }}
          >
            <div>ع/ر</div>
            <div>الــــــدورة الـتـكــــونـيـــــة</div>
            <div>الإخـتـصـــــاص</div>
            <div>مـــدة التـكــويــن</div>
            <div>طــاقــــة الإسـتـعـــــاب</div>
            <div className="text-center">نــــوع التـكــويـــــن</div>
            <div className="text-center">خــيــــــارات</div>
          </div>

          {/* Lignes des formations */}
          {servers.map((server) => (
            <motion.div
              key={server.id}
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
                {/* Gradient de fond selon le type de formation */}
                <div
                  className={`absolute inset-0 bg-linear-to-l ${getStatusGradient(server.status)} pointer-events-none`}
                  style={{
                    backgroundSize: "30% 100%",
                    backgroundPosition: "right",
                    backgroundRepeat: "no-repeat",
                  }}
                />

                {/* Contenu de la ligne de formation */}
                <div
                  className="relative grid gap-4 items-center"
                  style={{ gridTemplateColumns: "1fr 3fr 1.5fr 1.5fr 2.5fr 2fr 1fr" }}
                >
                  {/* Numéro de la formation */}
                  <div>
                    <span className="text-2xl font-bold text-muted-foreground">{server.number}</span>
                  </div>

                  {/* Nom de la formation */}
                  <div className="flex items-center gap-3">
                    <span className={`text-foreground font-medium ${notoNaskhArabic.className}`}>
                      {server.serviceName}
                    </span>
                  </div>

                  {/* Spécialité */}
                  <div className="flex items-center gap-3">
                    <span className={`text-foreground ${notoNaskhArabic.className}`}>{server.specialite}</span>
                  </div>

                  {/* Durée de la formation */}
                  <div>
                    <span className={`text-foreground ${notoNaskhArabic.className}`}>{server.dueDate}</span>
                  </div>

                  {/* Capacité d'absorption */}
                  <div>{getCapacityBars(server.capaciteAbsorption, server.status)}</div>

                  {/* Type de formation (badge de statut) */}
                  <div>{getStatusBadge(server.status)}</div>

                  {/* Options d'édition */}
                  <div className="flex items-center justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditClick(server)
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className={notoNaskhArabic.className}>تعديل بيانات التكوين</span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dialogue d'édition de formation */}
      <AnimatePresence mode="wait">
        {editingFormation && (
          <DialogueFormation
            formation={editingFormation}
            isOpen={true}
            onClose={handleCloseDialog}
            onSave={handleSaveFormation}
            isUpdating={isUpdating}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Wrapper component that provides toast context
export function ServerManagementTable(props: ServerManagementTableProps) {
  return (
    <ToastProvider>
      <ServerManagementTableContent {...props} />
    </ToastProvider>
  )
}

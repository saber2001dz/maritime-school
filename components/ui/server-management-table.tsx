"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Pencil, X } from "lucide-react"
import localFont from "next/font/local"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NeumorphButton from "@/components/ui/neumorph-button"

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

export function ServerManagementTable({
  title = "الــــدورات التـكـــويـنـيـــة :",
  servers: initialServers = [],
  className = "",
}: ServerManagementTableProps = {}) {
  const [servers, setServers] = useState<Server[]>(initialServers)
  const [editingServer, setEditingServer] = useState<Server | null>(null)
  const [editFormData, setEditFormData] = useState<Server | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Synchroniser les données du serveur avec l'état local
  useEffect(() => {
    setServers(initialServers)
  }, [initialServers])

  const handleEditClick = (server: Server) => {
    setEditingServer(server)
    setEditFormData({ ...server })
  }

  const handleEditFormChange = (field: keyof Server, value: string | number) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value,
      })
    }
  }

  const handleSaveEdit = async () => {
    if (editFormData) {
      setEditError(null)
      setIsUpdating(true)

      try {
        const response = await fetch(`/api/formations/${editFormData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            typeFormation:
              editFormData.status === "active"
                ? "تكوين إختصاص"
                : editFormData.status === "paused"
                ? "تكوين تخصصي"
                : "تكوين مستمر",
            formation: editFormData.serviceName,
            specialite: editFormData.specialite,
            duree: editFormData.dueDate,
            capaciteAbsorption: editFormData.capaciteAbsorption,
          }),
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour")
        }

        // Mettre à jour l'état local
        setServers((prevServers) =>
          prevServers.map((s) => (s.id === editFormData.id ? editFormData : s))
        )

        // Fermer le popover
        setEditingServer(null)
        setEditFormData(null)
      } catch (error) {
        setEditError("Une erreur s'est produite lors de la sauvegarde")
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingServer(null)
    setEditFormData(null)
    setEditError(null)
  }

  const getCapacityBars = (capacity: number, status: Server["status"]) => {
    const maxCapacity = 50
    const filledBars = Math.round((capacity / maxCapacity) * 10)

    const getBarColor = (index: number) => {
      // Si l'index est inférieur au nombre de barres remplies, colorier la barre selon le type de formation
      if (index < filledBars) {
        switch (status) {
          case "active":
            return "bg-green-500/70"
          case "paused":
            return "bg-orange-500/70"
          case "inactive":
            return "bg-red-500/70"
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
          <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <span className={`text-green-400 text-sm font-medium ${notoNaskhArabic.className}`}>تكوين إختصاص</span>
          </div>
        )
      case "paused":
        return (
          <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <span className={`text-orange-500 text-sm font-medium ${notoNaskhArabic.className}`}>تكوين تخصصي</span>
          </div>
        )
      case "inactive":
        return (
          <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <span className={`text-red-400 text-sm font-medium ${notoNaskhArabic.className}`}>تكوين مستمر</span>
          </div>
        )
    }
  }

  const getStatusGradient = (status: Server["status"]) => {
    switch (status) {
      case "active":
        return "from-green-500/10 to-transparent"
      case "paused":
        return "from-orange-500/10 to-transparent"
      case "inactive":
        return "from-red-500/10 to-transparent"
    }
  }

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${className}`}>
      <div className="relative border border-border/30 rounded-2xl p-6 bg-gray-50 dark:bg-gray-900/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
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
                    <Popover
                      open={editingServer?.id === server.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleCancelEdit()
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditClick(server)
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[400px] p-4 bg-slate-50 dark:bg-slate-900 shadow-2xl"
                        align="start"
                        side="right"
                        sideOffset={8}
                        style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-lg font-semibold text-[#1071C7]" style={{ fontFamily: "inherit" }}>
                              تعديل بيانات الدورة التكوينية
                            </h3>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          {editFormData && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="serviceName">الدورة التكوينية</Label>
                                <Input
                                  id="serviceName"
                                  value={editFormData.serviceName}
                                  onChange={(e) => handleEditFormChange("serviceName", e.target.value)}
                                  className="text-right"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="specialite">الإختصاص</Label>
                                <Input
                                  id="specialite"
                                  value={editFormData.specialite}
                                  onChange={(e) => handleEditFormChange("specialite", e.target.value)}
                                  className="text-right"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="dueDate">مدة التكوين</Label>
                                <Input
                                  id="dueDate"
                                  value={editFormData.dueDate}
                                  onChange={(e) => handleEditFormChange("dueDate", e.target.value)}
                                  className="text-right"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="capaciteAbsorption">طاقة الإستعاب</Label>
                                <Input
                                  id="capaciteAbsorption"
                                  type="number"
                                  value={editFormData.capaciteAbsorption}
                                  onChange={(e) =>
                                    handleEditFormChange("capaciteAbsorption", parseInt(e.target.value) || 0)
                                  }
                                  className="text-right"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="status">نوع التكوين</Label>
                                <Select
                                  dir="rtl"
                                  value={editFormData.status}
                                  onValueChange={(value) =>
                                    handleEditFormChange("status", value as "active" | "paused" | "inactive")
                                  }
                                >
                                  <SelectTrigger
                                    className="w-full rounded"
                                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                                  >
                                    <SelectValue placeholder="اختر نوع التكوين" />
                                  </SelectTrigger>
                                  <SelectContent style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                    <SelectItem value="active" className="text-[15px]">
                                      تكوين إختصاص
                                    </SelectItem>
                                    <SelectItem value="paused" className="text-[15px]">
                                      تكوين تخصصي
                                    </SelectItem>
                                    <SelectItem value="inactive" className="text-[15px]">
                                      تكوين مستمر
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {editError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                  <p className="text-sm text-red-600 dark:text-red-400 text-center">{editError}</p>
                                </div>
                              )}

                              <div className="flex gap-2 pt-6 mt-2 border-t">
                                <NeumorphButton
                                  onClick={handleCancelEdit}
                                  intent="secondary"
                                  size="medium"
                                  className="flex-1 cursor-pointer"
                                  disabled={isUpdating}
                                >
                                  إلغـــــاء
                                </NeumorphButton>
                                <NeumorphButton
                                  onClick={handleSaveEdit}
                                  intent="primary"
                                  size="medium"
                                  className="flex-1 cursor-pointer"
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? "جاري الحفظ..." : "حـفـــــظ"}
                                </NeumorphButton>
                              </div>
                            </>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

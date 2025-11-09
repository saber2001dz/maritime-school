"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Pencil } from "lucide-react"
import localFont from "next/font/local"

const notoNaskhArabic = localFont({
  src: "../../app/fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

export interface Server {
  id: string
  number: string
  serviceName: string
  osType: "windows" | "linux" | "ubuntu"
  specialite: string
  dueDate: string
  capaciteAbsorption: number
  status: "active" | "paused" | "inactive"
}

interface ServerManagementTableProps {
  title?: string
  servers?: Server[]
  onStatusChange?: (serverId: string, newStatus: Server["status"]) => void
  className?: string
}

const defaultServers: Server[] = [
  {
    id: "1",
    number: "01",
    serviceName: "تكوين ضباط الآلات",
    osType: "windows",
    specialite: "بحري",
    dueDate: "14 Oct 2027",
    capaciteAbsorption: 40,
    status: "active",
  },
  {
    id: "2",
    number: "02",
    serviceName: "تكوين ضباط سطح",
    osType: "windows",
    specialite: "بحري",
    dueDate: "14 Oct 2027",
    capaciteAbsorption: 45,
    status: "active",
  },
  {
    id: "3",
    number: "03",
    serviceName: "تكوين تخصصي في الملاحة",
    osType: "ubuntu",
    specialite: "بحري",
    dueDate: "27 Jun 2027",
    capaciteAbsorption: 25,
    status: "paused",
  },
  {
    id: "4",
    number: "04",
    serviceName: "تكوين مستمر في السلامة البحرية",
    osType: "ubuntu",
    specialite: "عدلي",
    dueDate: "30 May 2030",
    capaciteAbsorption: 50,
    status: "inactive",
  },
  {
    id: "5",
    number: "05",
    serviceName: "تكوين إختصاص في الإدارة البحرية",
    osType: "windows",
    specialite: "إداري",
    dueDate: "15 Dec 2026",
    capaciteAbsorption: 30,
    status: "inactive",
  },
]

export function ServerManagementTable({
  title = "الــــدورات التـكـــويـنـيـــة :",
  servers: initialServers = defaultServers,
  onStatusChange,
  className = "",
}: ServerManagementTableProps = {}) {
  const [servers, setServers] = useState<Server[]>(initialServers)
  const [hoveredServer, setHoveredServer] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()

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
              onMouseEnter={() => setHoveredServer(server.id)}
              onMouseLeave={() => setHoveredServer(null)}
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
                    <motion.button
                      className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Ajouter la logique d'édition
                        console.log("Éditer la formation:", server.id)
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Pencil className="w-4 h-4 cursor-pointer" />
                    </motion.button>
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

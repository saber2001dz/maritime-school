"use client"

import { ServerManagementTable, Server } from "@/components/ui/server-management-table"
import { useEffect, useState } from "react"

// Fonction pour convertir le type de formation en status
function getStatusFromType(typeFormation: string): "active" | "paused" | "inactive" {
  switch (typeFormation) {
    case "تكوين إختصاص":
      return "active"
    case "تكوين تخصصي":
      return "paused"
    case "تكوين مستمر":
      return "inactive"
    default:
      return "active"
  }
}

export default function ListeFormation() {
  const [formations, setFormations] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    async function fetchFormations() {
      try {
        const response = await fetch("/api/formations")
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des formations")
        }
        const data = await response.json()

        // Trier les formations par ordre alphabétique (colonne formation)
        const sortedData = [...data].sort((a, b) =>
          a.formation.localeCompare(b.formation, 'ar')
        )

        // Transformer les données de la base en format Server
        const formattedFormations: Server[] = sortedData.map((formation: any, index: number) => ({
          id: formation.id,
          number: String(index + 1).padStart(2, "0"),
          serviceName: formation.formation,
          osType: "windows" as const, // Valeur par défaut
          specialite: formation.specialite || "غير محدد",
          dueDate: formation.duree || "غير محدد",
          capaciteAbsorption: formation.capaciteAbsorption || 0,
          status: getStatusFromType(formation.typeFormation),
        }))

        setFormations(formattedFormations)
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFormations()
  }, [refreshKey])

  if (loading) {
    return (
      <div className="pt-20 flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="pt-20">
      <ServerManagementTable servers={formations} />
    </div>
  )
}

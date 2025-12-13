"use client"

import { ResizableTableWrapper } from "./resizable-table-wrapper"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

interface Formateur {
  id: string
  nomPrenom: string
  grade: string
  unite: string
  responsabilite: string
  telephone: number
  RIB: string
}

export default function ListeFormateurPage() {
  const searchParams = useSearchParams()
  const [formateurs, setFormateurs] = useState<Formateur[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFormateurs = async () => {
      try {
        const response = await fetch('/api/formateurs')
        if (!response.ok) {
          throw new Error('Failed to fetch formateurs')
        }
        const data = await response.json()

        // Transform data to match interface
        const formateursData = data.map((formateur: any) => ({
          id: formateur.id,
          nomPrenom: formateur.nomPrenom,
          grade: formateur.grade,
          unite: formateur.unite,
          responsabilite: formateur.responsabilite,
          telephone: formateur.telephone,
          RIB: formateur.RIB,
        }))

        setFormateurs(formateursData)
      } catch (error) {
        console.error('Error fetching formateurs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFormateurs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-6 md:py-10">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="pb-6 pr-29">
            <h1 className="text-2xl font-bold mb-1 text-right">قــائمــة المـكــونيـــن</h1>
            <p className="text-sm text-muted-foreground mb-6 text-right">
              استعرض وإدارة جميع المكونين بالمدرسة البحرية
            </p>
          </div>
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-6 md:py-10">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="pb-6 pr-29">
          <h1 className="text-2xl font-bold mb-1 text-right">قــائمــة المـكــونيـــن</h1>
          <p className="text-sm text-muted-foreground mb-6 text-right">
            استعرض وإدارة جميع المكونين بالمدرسة البحرية
          </p>
        </div>

        <div className="mb-8 md:mb-12 px-8">
          <ResizableTableWrapper formateurs={formateurs} searchParams={searchParams} />
        </div>
      </div>
    </div>
  )
}

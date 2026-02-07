"use client"

import { useState, useEffect } from "react"
import localFont from "next/font/local"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSelectableResultatOptions } from "@/lib/resultat-utils"

const notoNaskhArabic = localFont({
  src: "../../../fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

interface AgentFormationWithRelations {
  id: string
  agentId: string
  formationId: string
  dateDebut: string
  dateFin: string
  reference?: string | null
  resultat?: string | null
  moyenne: number
  agent: {
    id: string
    nomPrenom: string
    grade: string
  }
  formation: {
    id: string
    formation: string
  }
}

interface DialogueEditAgentFormationProps {
  agentFormation: AgentFormationWithRelations | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<AgentFormationWithRelations>) => Promise<void>
}

export function DialogueEditAgentFormation({
  agentFormation,
  isOpen,
  onClose,
  onSave,
}: DialogueEditAgentFormationProps) {
  const [formationId, setFormationId] = useState("")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [reference, setReference] = useState("")
  const [resultat, setResultat] = useState("")
  const [moyenne, setMoyenne] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (agentFormation) {
      setFormationId(agentFormation.formationId)
      setDateDebut(agentFormation.dateDebut)
      setDateFin(agentFormation.dateFin)
      setReference(agentFormation.reference || "")
      setResultat(agentFormation.resultat || "none")
      setMoyenne(agentFormation.moyenne.toString())
    }
  }, [agentFormation])

  const handleMoyenneChange = (value: string) => {
    // Permet les nombres décimaux avec point
    const cleaned = value.replace(/[^\d.]/g, "")
    // Empêche plus d'un point
    const parts = cleaned.split(".")
    if (parts.length > 2) return

    const moyenneNum = parseFloat(cleaned)
    if (cleaned === "" || (moyenneNum >= 0 && moyenneNum <= 20)) {
      setMoyenne(cleaned)
    }
  }

  const handleSave = async () => {
    if (!agentFormation) return

    if (!formationId || !dateDebut || !dateFin || !moyenne) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    const moyenneNum = parseFloat(moyenne)
    if (isNaN(moyenneNum) || moyenneNum < 0 || moyenneNum > 20) {
      alert("La moyenne doit être un nombre entre 0 et 20")
      return
    }

    setIsLoading(true)
    try {
      await onSave({
        formationId,
        dateDebut,
        dateFin,
        reference: reference || null,
        resultat: resultat === "none" ? null : resultat,
        moyenne: moyenneNum,
      })
      onClose()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 gap-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className={`text-xl font-bold text-right text-[#1071c7] ${notoNaskhArabic.className}`} dir="rtl">
            تـعــديـــل بـيـــانــات التـكـويـن للمتـربــص
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          {/* Agent (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="agent" className={notoNaskhArabic.className} dir="rtl">
              المتـربــص
            </Label>
            <Input
              id="agent"
              value={agentFormation ? `${agentFormation.agent.grade} ${agentFormation.agent.nomPrenom}` : ""}
              readOnly
              disabled
              className={`bg-muted cursor-not-allowed ${notoNaskhArabic.className}`}
              dir="rtl"
            />
          </div>

          {/* Formation (Read-only for now - could be made editable) */}
          <div className="space-y-2">
            <Label htmlFor="formation" className={notoNaskhArabic.className} dir="rtl">
              التـكـويـن
            </Label>
            <Input
              id="formation"
              value={agentFormation ? agentFormation.formation.formation : ""}
              readOnly
              disabled
              className={`bg-muted cursor-not-allowed ${notoNaskhArabic.className}`}
              dir="rtl"
            />
          </div>

          {/* Dates */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="dateDebut" className={notoNaskhArabic.className} dir="rtl">
                تـاريخ الإنطـلاق
              </Label>
              <Input
                id="dateDebut"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="dateFin" className={notoNaskhArabic.className} dir="rtl">
                تـاريخ الإختـتــام
              </Label>
              <Input id="dateFin" type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} dir="ltr" />
            </div>
          </div>

          {/* Référence */}
          <div className="space-y-2">
            <Label htmlFor="reference" className={notoNaskhArabic.className} dir="rtl">
              المـرجــع
            </Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className={notoNaskhArabic.className}
              dir="rtl"
            />
          </div>

          {/* Résultat et Moyenne */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="resultat" className={notoNaskhArabic.className} dir="rtl">
                النـتـيـجــة
              </Label>
              <Select value={resultat} onValueChange={setResultat} dir="rtl">
                <SelectTrigger id="resultat" className={`w-full ${notoNaskhArabic.className}`}>
                  <SelectValue placeholder="اختر النتيجة" />
                </SelectTrigger>
                <SelectContent className={notoNaskhArabic.className}>
                  {getSelectableResultatOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-sm">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="moyenne" className={notoNaskhArabic.className} dir="rtl">
                المـعـدل (عـلــى 20)
              </Label>
              <Input
                id="moyenne"
                type="text"
                value={moyenne}
                onChange={(e) => handleMoyenneChange(e.target.value)}
                placeholder="0.00"
                className="text-right"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer ${notoNaskhArabic.className}`}
            dir="rtl"
          >
            إلـغــاء
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${notoNaskhArabic.className}`}
            dir="rtl"
          >
            {isLoading ? "جاري الحفظ..." : "سـجـل البيــانــات"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

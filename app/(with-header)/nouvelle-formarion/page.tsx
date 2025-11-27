"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import localFont from "next/font/local"
import { X } from "lucide-react"

const notoNaskhArabic = localFont({
  src: "../../fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

export default function NouvelleFormationPage() {
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    formation: "",
    typeFormation: "",
    specialite: "",
    duree: "",
    capaciteAbsorption: "",
  })
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState({
    formation: false,
    typeFormation: false,
  })

  const typesFormation = ["تكوين إختصاص", "تكوين تخصصي", "تكوين مستمر"]
  const specialites = ["بحري", "عدلي", "إداري"]

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const newErrors = {
      formation: formData.formation.trim() === "",
      typeFormation: formData.typeFormation === "",
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error)
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/formations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formation: formData.formation,
          typeFormation: formData.typeFormation,
          specialite: formData.specialite,
          duree: formData.duree,
          capaciteAbsorption: formData.capaciteAbsorption ? parseInt(formData.capaciteAbsorption) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Une erreur s'est produite")
      }

      setSuccess(true)

      // Rediriger vers la page liste formation apres 2 secondes
      setTimeout(() => {
        router.push("/liste-formation")
      }, 2000)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-white dark:bg-black p-4 pt-25">
      <motion.div
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col gap-6"
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-semibold text-center text-gray-900 dark:text-gray-100">
          {success ? "تم إنشاء التكوين بنجاح!" : "تكــويــن جـــديـــد"}
        </h2>
        <p className={`text-center text-md text-gray-500 dark:text-gray-300 -mt-3 mb-4 ${notoNaskhArabic.className}`}>
          {!success && "إملأ معلومات التكوين الجديد"}
        </p>

        <AnimatePresence>
          {!success && (
            <motion.div key="form" className="flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <Label className="text-[12px]" htmlFor="formation">
                  التـكــويــــن
                </Label>
                <div className="relative">
                  <Input
                    id="formation"
                    type="text"
                    placeholder="التكوين"
                    value={formData.formation}
                    onChange={(e) => {
                      handleChange("formation", e.target.value)
                      if (errors.formation) setErrors({ ...errors, formation: false })
                    }}
                    className={`mt-2 ${notoNaskhArabic.className} ${
                      errors.formation ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                    autoComplete="off"
                    required
                  />
                  {errors.formation && (
                    <X className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-red-500" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Label className="text-[12px]" htmlFor="typeFormation">
                  نـــــوع التـكــويــن
                </Label>
                <Select
                  dir="rtl"
                  value={formData.typeFormation}
                  onValueChange={(value) => {
                    handleChange("typeFormation", value)
                    if (errors.typeFormation) setErrors({ ...errors, typeFormation: false })
                  }}
                  required
                >
                  <SelectTrigger
                    className={`mt-2 w-full rounded ${notoNaskhArabic.className} ${
                      errors.typeFormation ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="اختر نوع التكوين" />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    {typesFormation.map((type) => (
                      <SelectItem key={type} value={type} className="text-sm">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <Label className="text-[12px]" htmlFor="specialite">
                  الإخـتـصـــــاص
                </Label>
                <Select
                  dir="rtl"
                  value={formData.specialite}
                  onValueChange={(value) => handleChange("specialite", value)}
                >
                  <SelectTrigger className={`mt-2 w-full rounded ${notoNaskhArabic.className}`}>
                    <SelectValue placeholder="اختر الإختصاص" />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    {specialites.map((spec) => (
                      <SelectItem key={spec} value={spec} className="text-sm">
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label className="text-[12px]" htmlFor="duree">
                  مـــدة التكــويـــن
                </Label>
                <div className="relative">
                  <Input
                    id="duree"
                    type="text"
                    placeholder="أدخل مدة التكوين"
                    value={formData.duree}
                    onChange={(e) => handleChange("duree", e.target.value)}
                    className={`mt-2 rounded ${notoNaskhArabic.className}`}
                    autoComplete="off"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                <Label className="text-[12px]" htmlFor="capaciteAbsorption">
                  طـاقــة الاسـتـعــاب
                </Label>
                <div className="relative">
                  <Input
                    id="capaciteAbsorption"
                    type="number"
                    placeholder="أدخل طاقة الاستعاب"
                    value={formData.capaciteAbsorption}
                    onChange={(e) => handleChange("capaciteAbsorption", e.target.value)}
                    className={`mt-2 rounded ${notoNaskhArabic.className}`}
                    autoComplete="off"
                    min="0"
                  />
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                >
                  <p className={`text-sm text-red-600 dark:text-red-400 text-center ${notoNaskhArabic.className}`}>
                    {error}
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Button
                  className="my-4 w-full rounded-1 bg-[#1071C7] hover:bg-[#0D5A9F] cursor-pointer transition-colors h-11 font-semibold"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "جاري المعالجة..." : "سجل"}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Animation */}
        {success && (
          <motion.div
            key="checkmark"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex justify-center mt-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

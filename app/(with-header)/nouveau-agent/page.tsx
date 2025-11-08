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

export default function NouveauAgentPage() {
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    nom: "",
    prenom: "",
    grade: "",
    numero: "",
    responsabilite: "",
    telephone: "",
  })
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState({
    nom: false,
    prenom: false,
    grade: false,
    numero: false,
  })

  const grades = [
    { category: "ضابط سامي", values: ["عميد", "عقيد", "مقدم", "رائد"] },
    { category: "ضابط", values: ["نقيب", "ملازم أول", "ملازم"] },
    { category: "ضابط صف", values: ["عريف أول", "عريف", "وكيل أول", "وكيل"] },
    { category: "هيئة الرقباء", values: ["رقيب أول", "رقيب", "حرس"] },
  ]

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Limit to 8 digits
    const limitedDigits = digits.slice(0, 8)

    // Format as xx xxx xxx
    if (limitedDigits.length <= 2) {
      return limitedDigits
    } else if (limitedDigits.length <= 5) {
      return `${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2)}`
    } else {
      return `${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2, 5)} ${limitedDigits.slice(5)}`
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    handleChange("telephone", formatted)
  }

  const handleNumeroChange = (value: string) => {
    // Remove all non-digit characters and limit to 5 digits
    const digits = value.replace(/\D/g, "").slice(0, 5)
    handleChange("numero", digits)
  }

  const validateForm = () => {
    const newErrors = {
      nom: formData.nom.trim() === "",
      prenom: formData.prenom.trim() === "",
      grade: formData.grade === "",
      numero: formData.numero.trim() === "",
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
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          grade: formData.grade,
          matricule: formData.numero,
          responsabilite: formData.responsabilite,
          telephone: formData.telephone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de l\'agent')
      }

      setSuccess(true)

      // Rediriger vers la page principal après 2 secondes
      setTimeout(() => {
        router.push('/principal')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <motion.div
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col gap-6"
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-semibold text-center text-gray-900 dark:text-gray-100">
          {success ? "تـم إنشـاء المتـربـص بنجـاح!" : "متــربـص جــديــد"}
        </h2>
        <p className={`text-center text-md text-gray-500 dark:text-gray-300 -mt-3 mb-4 ${notoNaskhArabic.className}`}>
          {!success && "إمــلأ معلــومــات المتـريـــص الجــديــد"}
        </p>

        <AnimatePresence>
          {!success && (
            <motion.div
              key="form"
              className="flex flex-col gap-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <Label className="text-[12px]" htmlFor="nom">
                  الإســــــم
                </Label>
                <div className="relative">
                  <Input
                    id="nom"
                    type="text"
                    placeholder="أدخل الإسم"
                    value={formData.nom}
                    onChange={(e) => {
                      handleChange("nom", e.target.value)
                      if (errors.nom) setErrors({ ...errors, nom: false })
                    }}
                    className={`mt-2 ${notoNaskhArabic.className} ${errors.nom ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    autoComplete="off"
                    required
                  />
                  {errors.nom && (
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
                <Label className="text-[12px]" htmlFor="prenom">
                  اللـقــــــب
                </Label>
                <div className="relative">
                  <Input
                    id="prenom"
                    type="text"
                    placeholder="أدخل اللقب"
                    value={formData.prenom}
                    onChange={(e) => {
                      handleChange("prenom", e.target.value)
                      if (errors.prenom) setErrors({ ...errors, prenom: false })
                    }}
                    className={`mt-2 rounded ${notoNaskhArabic.className} ${errors.prenom ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    autoComplete="off"
                    required
                  />
                  {errors.prenom && (
                    <X className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-red-500" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <Label className="text-[12px]" htmlFor="grade">
                  الــرتـبــــــة
                </Label>
                <Select
                  dir="rtl"
                  value={formData.grade}
                  onValueChange={(value) => {
                    handleChange("grade", value)
                    if (errors.grade) setErrors({ ...errors, grade: false })
                  }}
                  required
                >
                  <SelectTrigger
                    className={`mt-2 w-full rounded ${notoNaskhArabic.className} ${errors.grade ? "border-red-500 focus:ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="اختر الرتبة" />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    {grades.map((gradeGroup) => (
                      <React.Fragment key={gradeGroup.category}>
                        {gradeGroup.values.map((grade) => (
                          <SelectItem key={grade} value={grade} className="text-[15px]">
                            {grade}
                          </SelectItem>
                        ))}
                      </React.Fragment>
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
                <Label className="text-[12px]" htmlFor="numero">
                  الــرقــــــم
                </Label>
                <div className="relative">
                  <Input
                    id="numero"
                    type="text"
                    inputMode="numeric"
                    placeholder="أدخل الرقم (5 أرقام كحد أقصى)"
                    value={formData.numero}
                    onChange={(e) => {
                      handleNumeroChange(e.target.value)
                      if (errors.numero) setErrors({ ...errors, numero: false })
                    }}
                    className={`mt-2 rounded ${notoNaskhArabic.className} ${errors.numero ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    maxLength={5}
                    autoComplete="off"
                    required
                  />
                  {errors.numero && (
                    <X className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-red-500" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                <Label className="text-[12px]" htmlFor="responsabilite">
                  المســؤوليــة
                </Label>
                <Input
                  id="responsabilite"
                  type="text"
                  placeholder="أدخل المسؤولية"
                  value={formData.responsabilite}
                  onChange={(e) => handleChange("responsabilite", e.target.value)}
                  className={`mt-2 rounded ${notoNaskhArabic.className}`}
                  autoComplete="off"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Label className="text-[12px]" htmlFor="telephone">
                  رقـم الهـاتـف
                </Label>
                <Input
                  id="telephone"
                  type="text"
                  inputMode="numeric"
                  placeholder="xx xxx xxx"
                  value={formData.telephone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`mt-2 rounded ${notoNaskhArabic.className} text-right`}
                  dir="ltr"
                  autoComplete="off"
                />
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
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                <Button
                  className="my-4 w-full rounded-1 bg-[#1071C7] hover:bg-[#0D5A9F] cursor-pointer transition-colors h-11"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "جاري المعالجة..." : "ســجــل"}
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

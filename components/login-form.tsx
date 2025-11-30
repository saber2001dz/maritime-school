"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import localFont from "next/font/local"
import { useState, useRef, useEffect } from "react"
import { signIn } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/ultra-quality-toast"
import { Eye, EyeOff } from "lucide-react"

const brastine = localFont({
  src: "../app/fonts/Brastine.woff2",
  display: "swap",
})

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()
  const emailInputRef = useRef<HTMLInputElement>(null)

  // Focus sur l'input email quand il y a une erreur
  useEffect(() => {
    if (hasError && emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [hasError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation côté client pour un feedback instantané
    if (!email || !email.trim()) {
      setHasError(true)
      addToast({
        variant: "error",
        title: "خطأ في البريد الإلكتروني",
        description: "يرجى إدخال عنوان بريد إلكتروني صالح",
      })
      return
    }

    if (!password || password.length < 3) {
      setHasError(true)
      addToast({
        variant: "error",
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور قصيرة جداً",
      })
      return
    }

    setIsLoading(true)
    setHasError(false)

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setHasError(true)
        addToast({
          variant: "error",
          title: "خطأ في تسجيل الدخول",
          description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        })
        return
      }

      router.push("/liste-agent")
      router.refresh()
    } catch (error) {
      setHasError(true)
      addToast({
        variant: "error",
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ أثناء محاولة تسجيل الدخول",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
        <CardHeader className="mb-3">
          <CardTitle className={`${brastine.className} text-2xl text-center font-extrabold text-[#0D5A9F]`}>
            École Maritime
          </CardTitle>
          <Separator className="mt-6 mb-3 bg-gray-300" orientation="horizontal" />
          <CardTitle>Connectez-vous à votre compte</CardTitle>
          <CardDescription>Saisissez votre adresse e-mail et votre mot de passe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setHasError(false)
                  }}
                  disabled={isLoading}
                  className={hasError ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setHasError(false)
                    }}
                    disabled={isLoading}
                    className={cn(hasError ? "border-red-500 focus-visible:ring-red-500" : "")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Field>
                <Button
                  className="bg-[#1071C7] hover:bg-[#0D5A9F] font-bold rounded h-10 cursor-pointer transition-colors mt-3"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Login"}
                </Button>
                <FieldDescription className="text-center mb-3">
                  Vous n'avez pas de compte ? Contactez l'administrateur.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

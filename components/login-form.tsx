"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import localFont from "next/font/local"
import { useState } from "react"
import { signIn } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const brastine = localFont({
  src: "../app/fonts/Brastine.woff2",
  display: "swap",
})

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        toast.error("Erreur de connexion", {
          description: "Email ou mot de passe incorrect",
        })
        return
      }

      toast.success("Connexion réussie!")
      router.push("/principal")
      router.refresh()
    } catch (error) {
      toast.error("Erreur de connexion", {
        description: "Une erreur est survenue lors de la connexion",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
        <CardHeader className="mb-3">
          <CardTitle className={`${brastine.className} text-2xl text-center font-extrabold text-[#0D5A9F]`}>École Maritime</CardTitle>
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
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
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

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function Home() {
  // Vérifier si l'utilisateur est connecté
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Si connecté, rediriger vers la page principale
  if (session) {
    redirect('/principal')
  }

  // Sinon, rediriger vers la page de connexion
  redirect('/login')
}

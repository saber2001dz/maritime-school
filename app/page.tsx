import { redirect } from "next/navigation"

export default function Home() {
  // Rediriger automatiquement vers la page de connexion
  redirect('/login')
}

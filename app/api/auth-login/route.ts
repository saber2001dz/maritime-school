import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Utiliser l'API Better-Auth côté serveur
    const signInResponse = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    })

    if (!signInResponse) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    // Créer la réponse avec les cookies définis
    const response = NextResponse.json({
      success: true,
      user: signInResponse.user,
    })

    // Le token est directement dans la réponse
    if (signInResponse.token) {
      response.cookies.set({
        name: "better-auth.session_token",
        value: signInResponse.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 jours
      })

      console.log("Cookie défini avec succès pour:", signInResponse.user.email)
    } else {
      console.error("Pas de token dans la réponse de connexion")
    }

    return response
  } catch (error) {
    console.error("Erreur de connexion:", error)
    return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 })
  }
}

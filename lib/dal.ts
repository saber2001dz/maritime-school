import "server-only"
import { auth } from "@/lib/auth"
import { cookies } from "next/headers"
import { cache } from "react"

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("better-auth.session_token")?.value

  // Log pour déboguer en production
  if (process.env.NODE_ENV === "production") {
    console.log("Vérification session - Token présent:", !!sessionToken)
  }

  if (!sessionToken) {
    return { isAuth: false, userId: null, session: null }
  }

  try {
    const session = await auth.api.getSession({
      headers: {
        cookie: `better-auth.session_token=${sessionToken}`,
      },
    })

    if (!session) {
      if (process.env.NODE_ENV === "production") {
        console.log("Session invalide ou expirée")
      }
      return { isAuth: false, userId: null, session: null }
    }

    if (process.env.NODE_ENV === "production") {
      console.log("Session valide pour l'utilisateur:", session.user.email)
    }

    return {
      isAuth: true,
      userId: session.user.id,
      session: session,
    }
  } catch (error) {
    console.error("Session verification error:", error)
    return { isAuth: false, userId: null, session: null }
  }
})

export type SessionData = Awaited<ReturnType<typeof verifySession>>

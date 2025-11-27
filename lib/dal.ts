import "server-only"
import { auth } from "@/lib/auth"
import { cookies } from "next/headers"
import { cache } from "react"

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("better-auth.session_token")?.value

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
      return { isAuth: false, userId: null, session: null }
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

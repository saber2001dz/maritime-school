import "server-only"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cache } from "react"

export const verifySession = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
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
    return { isAuth: false, userId: null, session: null }
  }
})

export type SessionData = Awaited<ReturnType<typeof verifySession>>

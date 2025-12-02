import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("better-auth.session_token")?.value
    const allCookies = cookieStore.getAll()

    // Vérifier la session
    let session = null
    if (sessionToken) {
      try {
        session = await auth.api.getSession({
          headers: {
            cookie: `better-auth.session_token=${sessionToken}`,
          },
        })
      } catch (error) {
        console.error("Erreur lors de la récupération de session:", error)
      }
    }

    return NextResponse.json({
      hasSessionToken: !!sessionToken,
      sessionTokenLength: sessionToken?.length || 0,
      sessionValid: !!session,
      userEmail: session?.user?.email || null,
      allCookiesCount: allCookies.length,
      cookieNames: allCookies.map((c) => c.name),
      environment: process.env.NODE_ENV,
      baseUrl: process.env.BETTER_AUTH_URL,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erreur lors du test de session",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

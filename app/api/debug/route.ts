import { NextResponse } from "next/server"

export async function GET() {
  // Ne jamais exposer les secrets complets en production !
  // Ceci est juste pour déboguer temporairement

  const config = {
    hasAuthSecret: !!process.env.BETTER_AUTH_SECRET,
    authSecretLength: process.env.BETTER_AUTH_SECRET?.length || 0,
    authUrl: process.env.BETTER_AUTH_URL,
    publicAuthUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlStart: process.env.DATABASE_URL?.substring(0, 30) || "not set",
    nodeEnv: process.env.NODE_ENV,
  }

  return NextResponse.json({
    message: "Configuration check",
    config,
    warning: "Delete this endpoint before going to production!",
  })
}

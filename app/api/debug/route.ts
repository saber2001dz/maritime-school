import { NextResponse } from "next/server"

export async function GET() {
  // Ne jamais exposer les secrets complets en production !
  // Ceci est juste pour déboguer temporairement

  const authUrl = process.env.BETTER_AUTH_URL || ""
  const publicAuthUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || ""

  const config = {
    hasAuthSecret: !!process.env.BETTER_AUTH_SECRET,
    authSecretLength: process.env.BETTER_AUTH_SECRET?.length || 0,
    authUrl: authUrl,
    authUrlHasTrailingSlash: authUrl.endsWith("/"),
    publicAuthUrl: publicAuthUrl,
    publicAuthUrlHasTrailingSlash: publicAuthUrl.endsWith("/"),
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlStart: process.env.DATABASE_URL?.substring(0, 30) || "not set",
    nodeEnv: process.env.NODE_ENV,
  }

  const warnings = []
  if (authUrl.endsWith("/")) {
    warnings.push("⚠️ BETTER_AUTH_URL has trailing slash - remove it!")
  }
  if (publicAuthUrl.endsWith("/")) {
    warnings.push("⚠️ NEXT_PUBLIC_BETTER_AUTH_URL has trailing slash - remove it!")
  }

  return NextResponse.json({
    message: "Configuration check",
    config,
    warnings: warnings.length > 0 ? warnings : ["✅ All good"],
    note: "Delete this endpoint before going to production!",
  })
}

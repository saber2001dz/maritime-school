import { Cloud } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export async function DatabaseIndicator() {
  const databaseUrl = await getDatabaseUrl()
  const isNeon = databaseUrl.includes("neon.tech")

  // Extract Neon region/host for display
  let dbDetails = ""
  if (isNeon) {
    const match = databaseUrl.match(/@([^\/]+)/)
    dbDetails = match ? match[1].split('.')[0] : ""
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Badge
        variant="default"
        className="flex items-center gap-2 px-3 py-2 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Cloud className="h-4 w-4" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold">Connected to Neon Cloud</span>
          {dbDetails && (
            <span className="text-[10px] opacity-80">{dbDetails}</span>
          )}
        </div>
      </Badge>
    </div>
  )
}

async function getDatabaseUrl(): Promise<string> {
  return process.env.DATABASE_URL || ""
}

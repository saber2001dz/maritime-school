import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
      <Spinner className="size-12" />
      <p className="text-sm text-muted-foreground">Chargement en cours...</p>
    </div>
  )
}

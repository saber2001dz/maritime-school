"use client"

import { motion } from "framer-motion"

type FormattedSession = {
  id: string
  formationName: string
  dateDebut: string
  dateFin: string
  nombreParticipantsReels: number
  capaciteAbsorption: number | null
}

type SessionsListProps = {
  sessions: FormattedSession[]
}

export function SessionsList({ sessions }: SessionsListProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4 font-(family-name:--font-noto-naskh-arabic)">
        لا توجد دورات تكوينية حاليا
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <motion.div
          key={session.id}
          className="flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-sm font-medium">
            {String(index + 1).padStart(2, "0")}
          </div>
          <div className="mr-4 space-y-3 flex-1">
            <p className="text-sm font-medium leading-none font-(family-name:--font-noto-naskh-arabic)">
              {session.formationName}
            </p>
            <p className="text-xs text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">
              <span dir="ltr">{session.dateDebut}</span> إلى <span dir="ltr">{session.dateFin}</span>
            </p>
          </div>
          <div className="ml-auto text-sm tabular-nums">
            <span style={{ color: "#1071C7" }}>{session.nombreParticipantsReels}</span>
            {" / "}
            {session.capaciteAbsorption ?? "—"}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

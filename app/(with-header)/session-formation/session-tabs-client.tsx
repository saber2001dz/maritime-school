"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CalendarDays, Table } from "lucide-react"
import { ResizableSessionWrapper } from "./session-table/resizable-session-wrapper"
import { SessionPlanning } from "./session-planning/session-planning"
import { type SessionFormation } from "@/components/ui/resizable-session-table"
import { ToastProvider } from "@/components/ui/ultra-quality-toast"

interface Formation {
  id: string
  formation: string
}

interface SessionTabsClientProps {
  sessions: SessionFormation[]
  formations: Formation[]
}

export function SessionTabsClient({ sessions: initialSessions, formations }: SessionTabsClientProps) {
  // État partagé des sessions entre les deux onglets
  const [sessions, setSessions] = useState<SessionFormation[]>(initialSessions)

  const handleSessionCreated = (newSession: SessionFormation) => {
    setSessions(prev => [newSession, ...prev])
  }

  const handleSessionUpdated = (updatedSession: SessionFormation) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s))
  }

  const handleSessionDeleted = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  return (
    <ToastProvider>
      <div className="bg-background py-6 md:py-10">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="list" className="w-full" dir="rtl">
            <div className="flex items-center justify-between pb-2 mb-4">
              <div>
                <h1 className="text-2xl mb-1 font-bold text-right">قائمة الدورات التكوينية</h1>
                <p className="text-sm text-muted-foreground text-right">
                  استعرض جميع الدورات التكوينية السابقة، المخططة والجارية
                </p>
              </div>
              <TabsList>
                <TabsTrigger value="list" className="min-w-[50px] cursor-pointer">
                  <Table className="h-5 w-5 text-muted-foreground data-[state=active]:text-foreground" />
                </TabsTrigger>

                <TabsTrigger value="schedule" className="min-w-[50px] cursor-pointer">
                  <CalendarDays className="h-5 w-5 text-muted-foreground data-[state=active]:text-foreground" />
                </TabsTrigger>
              </TabsList>
            </div>

            <div>
              <TabsContent value="list">
                <ResizableSessionWrapper
                  sessions={sessions}
                  onSessionCreated={handleSessionCreated}
                  onSessionUpdated={handleSessionUpdated}
                  onSessionDeleted={handleSessionDeleted}
                />
              </TabsContent>

              <TabsContent value="schedule">
                <SessionPlanning
                  sessions={sessions}
                  formations={formations}
                  onSessionCreated={handleSessionCreated}
                  onSessionUpdated={handleSessionUpdated}
                  onSessionDeleted={handleSessionDeleted}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </ToastProvider>
  )
}

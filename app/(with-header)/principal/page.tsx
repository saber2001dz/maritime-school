import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, UserCheck, Award, BookText } from "lucide-react"
import { prisma } from "@/lib/db"
import { ChartBarDefault } from "./chart-bar"
import { SessionsList } from "./sessions-list"

export default async function PrincipalPage() {
  // Récupérer les statistiques depuis la base de données
  const [agentsCount, formateursCount, formationsCount, coursCount] = await Promise.all([
    prisma.agent.count(),
    prisma.formateur.count(),
    prisma.formation.count(),
    prisma.cours.count(),
  ])

  // Récupérer les sessions de formation en cours et à venir
  const now = new Date()

  // Sessions en cours (dateDebut <= now <= dateFin)
  const sessionsEnCours = await prisma.sessionFormation.findMany({
    where: {
      dateDebut: { lte: now },
      dateFin: { gte: now },
    },
    include: {
      formation: true,
    },
    orderBy: {
      dateDebut: 'desc',
    },
  })

  // Sessions à venir (dateDebut > now)
  const sessionsAVenir = await prisma.sessionFormation.findMany({
    where: {
      dateDebut: { gt: now },
    },
    include: {
      formation: true,
    },
    orderBy: {
      dateDebut: 'asc',
    },
    take: 5 - sessionsEnCours.length, // Compléter jusqu'à 5
  })

  // Combiner les sessions : en cours d'abord, puis à venir
  const recentSessions = [...sessionsEnCours, ...sessionsAVenir].slice(0, 5)

  // Fonction pour formater les dates au format yyyy-mm-dd
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Préparer les sessions avec les dates formatées pour le composant client
  const formattedSessions = recentSessions.map(session => ({
    id: session.id,
    formationName: session.formation.formation,
    dateDebut: formatDate(session.dateDebut),
    dateFin: formatDate(session.dateFin),
    nombreParticipants: session.nombreParticipants,
  }))

  return (
    <div className="bg-background py-6 md:py-10">
      <div className="mx-auto w-full max-w-7xl px-0">
        <div className="pb-6">
          <h1 className="text-2xl font-bold mb-1 text-right">لـوحــة المتــابـعـــة</h1>
          <p className="text-sm text-muted-foreground mb-6 text-right">
            لوحة التحكم الرئيسية لإدارة ومتابعة أنشطة المدرسة البحرية
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">إجمالي المتـربصيـن</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentsCount}</div>
              <p className="text-sm text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">
                العدد الإجمالي للمتربصين
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">إجمالي المـدرسيـن</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                  <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formateursCount}</div>
              <p className="text-sm text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">
                العدد الإجمالي للمدرسين
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">إجمالي التـربصـات التكوينيـة</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                  <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formationsCount}</div>
              <p className="text-sm text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">
                عدد التربصات التكوينية
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">إجمالي الـدروس</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                  <BookText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coursCount}</div>
              <p className="text-sm text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">عـدد الــدروس</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-7 mt-4 items-stretch">
          <div className="md:col-span-4 flex">
            <ChartBarDefault />
          </div>
          <Card className="md:col-span-3 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold">الـدورات التكوينية الأخيـرة</CardTitle>
              <CardDescription className="font-(family-name:--font-noto-naskh-arabic)">
                الــدورات التكوينيــة الخمســة الأخيــرة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionsList sessions={formattedSessions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

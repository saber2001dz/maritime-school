import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, UserCheck, Award, BookText } from "lucide-react"
import { prisma } from "@/lib/db"
import { ChartBarStacked } from "./chart-bar-stacked"
import { SessionsList } from "./sessions-list"

const ARABIC_MONTHS = [
  "جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان",
  "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
]

export default async function PrincipalPage() {
  const currentYear = new Date().getFullYear()
  const previousYear = currentYear - 1

  // Récupérer les statistiques depuis la base de données
  const [agentsCount, formateursCount, formationsCount, coursCount] = await Promise.all([
    prisma.agent.count(),
    prisma.formateur.count(),
    prisma.formation.count(),
    prisma.cours.count(),
  ])

  // Récupérer les agentFormations pour l'année en cours et l'année dernière
  const agentFormations = await prisma.agentFormation.findMany({
    where: {
      dateDebut: {
        gte: `${previousYear}-01-01`,
        lte: `${currentYear}-12-31`,
      },
    },
    select: {
      dateDebut: true,
    },
  })

  // Agréger par mois pour chaque année
  const countsByMonthYear: Record<number, Record<number, number>> = {
    [previousYear]: {},
    [currentYear]: {},
  }
  for (let m = 1; m <= 12; m++) {
    countsByMonthYear[previousYear][m] = 0
    countsByMonthYear[currentYear][m] = 0
  }

  for (const af of agentFormations) {
    const date = new Date(af.dateDebut)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    if (countsByMonthYear[year] !== undefined) {
      countsByMonthYear[year][month] = (countsByMonthYear[year][month] ?? 0) + 1
    }
  }

  const chartData = ARABIC_MONTHS.map((label, i) => ({
    month: label,
    currentYear: countsByMonthYear[currentYear][i + 1],
    previousYear: countsByMonthYear[previousYear][i + 1],
  }))

  // Récupérer les sessions de formation avec le même tri que la table principale
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Normaliser au début du jour

  // Sessions en cours (dateDebut <= now <= dateFin) - tri croissant
  const sessionsEnCours = await prisma.sessionFormation.findMany({
    where: {
      dateDebut: { lte: now },
      dateFin: { gte: now },
    },
    include: {
      formation: true,
    },
    orderBy: {
      dateDebut: 'asc',
    },
  })

  // Sessions programmées (dateDebut > now) - tri croissant (plus proche en premier)
  const sessionsProgrammees = await prisma.sessionFormation.findMany({
    where: {
      dateDebut: { gt: now },
    },
    include: {
      formation: true,
    },
    orderBy: {
      dateDebut: 'asc',
    },
  })

  // Sessions terminées (dateFin < now) - tri décroissant (plus récent en premier)
  const sessionsTerminees = await prisma.sessionFormation.findMany({
    where: {
      dateFin: { lt: now },
    },
    include: {
      formation: true,
    },
    orderBy: {
      dateDebut: 'desc',
    },
  })

  // Combiner dans l'ordre : en cours, programmées, terminées - prendre les 5 premiers
  const recentSessions = [...sessionsEnCours, ...sessionsProgrammees, ...sessionsTerminees].slice(0, 5)

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
            <ChartBarStacked chartData={chartData} currentYear={currentYear} previousYear={previousYear} />
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

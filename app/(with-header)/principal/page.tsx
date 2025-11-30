import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, UserCheck, Award, BookText } from "lucide-react"
import { prisma } from "@/lib/db"
import { ChartBarDefault } from "./chart-bar"

export default async function PrincipalPage() {
  // Récupérer les statistiques depuis la base de données
  const [agentsCount, formateursCount, formationsCount, coursCount] = await Promise.all([
    prisma.agent.count(),
    prisma.formateur.count(),
    prisma.formation.count(),
    prisma.cours.count(),
  ])

  return (
    <div className="bg-background py-6 md:py-10">
      <div className="mx-auto w-full max-w-7xl px-0">
        <div className="pb-6">
          <h1 className="text-2xl font-bold mb-1 text-right">لـوحــة المفـاتيـح</h1>
          <p className="text-sm text-muted-foreground mb-6 text-right">
            لوحة التحكم الرئيسية لإدارة ومتابعة أنشطة المدرسة البحرية
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">إجمالي المتربصين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-semibold">إجمالي المدرسين</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-semibold">إجمالي الـدورات التكوينيـة</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formationsCount}</div>
              <p className="text-sm text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">
                عدد الدورات التكوينية
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold فثءف">إجمالي الـدروس</CardTitle>
                <BookText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coursCount}</div>
              <p className="text-sm text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">عـدد الدروس</p>
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
                الدورات التكوينية خـلال ثلاث الأشهر الأخيرة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    01
                  </div>
                  <div className="mr-4 space-y-3 flex-1">
                    <p className="text-sm font-medium leading-none">الإسعافات الأولية</p>
                    <p className="text-xs text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">
                      2025-09-01 إلى 15-09-2025
                    </p>
                  </div>
                  <div className="ml-auto font-medium">25</div>
                </div>
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    02
                  </div>
                  <div className="mr-4 space-y-3 flex-1">
                    <p className="text-sm font-medium leading-none">التصرف في الجثث بالبحر</p>
                    <p className="text-xs text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">
                      2025-09-01 إلى 15-09-2025
                    </p>
                  </div>
                  <div className="ml-auto font-medium">22</div>
                </div>
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    03
                  </div>
                  <div className="mr-4 space-y-3 flex-1">
                    <p className="text-sm font-medium leading-none">المحاضر و الإجراءات العدلية</p>
                    <p className="text-xs text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">
                      2025-09-01 إلى 15-09-2025
                    </p>
                  </div>
                  <div className="ml-auto font-medium">25</div>
                </div>
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    04
                  </div>
                  <div className="mr-4 space-y-3 flex-1">
                    <p className="text-sm font-medium leading-none">درجة أولى حدود بحرية BS1</p>
                    <p className="text-xs text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">
                      2025-09-01 إلى 15-09-2025
                    </p>
                  </div>
                  <div className="ml-auto font-medium">26</div>
                </div>
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    05
                  </div>
                  <div className="mr-4 space-y-3 flex-1">
                    <p className="text-sm font-medium leading-none">قيادة و صيانة الزوارق السريعة</p>
                    <p className="text-xs text-muted-foreground font-(family-name:--font-noto-naskh-arabic)">
                      2025-09-01 إلى 15-09-2025
                    </p>
                  </div>
                  <div className="ml-auto font-medium">23</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

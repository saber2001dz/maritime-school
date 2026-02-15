import { prisma } from "@/lib/db"
import CoursTableWrapper from "./cours-table-wrapper"
import { verifySession } from "@/lib/dal"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ListeCoursPage({ searchParams }: PageProps) {
  const [{ role }] = await Promise.all([verifySession(), searchParams])

  let userRoleId: string | null = null
  if (role) {
    const roleRecord = await prisma.role.findUnique({ where: { name: role } })
    userRoleId = roleRecord?.id ?? null
  }

  // Fetch all cours from database, ordered by creation date (newest first)
  const cours = await prisma.cours.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="min-h-screen bg-background py-6 md:py-10">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="pb-10 pr-29">
          <h1 className="text-2xl font-bold mb-1 text-right">قــائمــة الـــدروس</h1>
          <p className="text-sm text-muted-foreground mb-6 text-right">
            استعرض وإدارة جميع الــدروس التكوينية
          </p>
        </div>

        <div className="mb-8 md:mb-12 px-8">
          <CoursTableWrapper cours={cours} userRole={role} userRoleId={userRoleId} />
        </div>
      </div>
    </div>
  )
}

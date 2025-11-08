import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultEmployees = [
  {
    id: "1",
    nomPrenom: "أحمد بن محمد",
    grade: "مقدم",
    matricule: "12345",
    responsabilite: "مهندس برمجيات أول",
    telephone: 55123456,
    derniereDateFormation: "2022-03-15",
    categorie: "ضابط سامي",
  },
  {
    id: "2",
    nomPrenom: "فاطمة الزهراء",
    grade: "رائد",
    matricule: "23456",
    responsabilite: "مدير التسويق",
    telephone: 55234567,
    derniereDateFormation: "2021-08-22",
    categorie: "ضابط سامي",
  },
  {
    id: "3",
    nomPrenom: "محمد الأمين",
    grade: "عريف أول",
    matricule: "34567",
    responsabilite: "مصمم تجربة المستخدم",
    telephone: 55345678,
    derniereDateFormation: "2023-01-10",
    categorie: "ضابط صف",
  },
  {
    id: "4",
    nomPrenom: "خديجة بنت علي",
    grade: "عريف",
    matricule: "45678",
    responsabilite: "قائد تقني",
    telephone: 55456789,
    derniereDateFormation: "2020-11-05",
    categorie: "ضابط صف",
  },
  {
    id: "5",
    nomPrenom: "عبد الرحمن السعيد",
    grade: "ملازم أول",
    matricule: "56789",
    responsabilite: "مدير الموارد البشرية",
    telephone: 55567890,
    derniereDateFormation: "2019-06-12",
    categorie: "ضابط",
  },
  {
    id: "6",
    nomPrenom: "نور الهدى",
    grade: "وكيل",
    matricule: "67890",
    responsabilite: "مدير المبيعات",
    telephone: 55678901,
    derniereDateFormation: "2021-02-28",
    categorie: "ضابط صف",
  },
  {
    id: "7",
    nomPrenom: "يوسف بن إبراهيم",
    grade: "وكيل أول",
    matricule: "78901",
    responsabilite: "محلل مالي",
    telephone: 55789012,
    derniereDateFormation: "2023-04-18",
    categorie: "ضابط صف",
  },
  {
    id: "8",
    nomPrenom: "سارة القاسمي",
    grade: "وكيل",
    matricule: "89012",
    responsabilite: "مهندس عمليات التطوير",
    telephone: 55890123,
    derniereDateFormation: "2022-09-14",
    categorie: "ضابط صف",
  },
  {
    id: "9",
    nomPrenom: "عمر بن الخطاب",
    grade: "عريف أول",
    matricule: "90123",
    responsabilite: "مدير المحتوى",
    telephone: 55901234,
    derniereDateFormation: "2023-07-03",
    categorie: "ضابط صف",
  },
  {
    id: "10",
    nomPrenom: "ليلى المنصوري",
    grade: "عريف",
    matricule: "10234",
    responsabilite: "مدير العمليات",
    telephone: 56012345,
    derniereDateFormation: "2021-12-01",
    categorie: "ضابط صف",
  },
  {
    id: "11",
    nomPrenom: "حسن البصري",
    grade: "وكيل",
    matricule: "11345",
    responsabilite: "مصمم منتجات",
    telephone: 56123456,
    derniereDateFormation: "2022-05-20",
    categorie: "ضابط صف",
  },
  {
    id: "12",
    nomPrenom: "مريم العلوي",
    grade: "وكيل أول",
    matricule: "12456",
    responsabilite: "مطور واجهات أمامية",
    telephone: 56234567,
    derniereDateFormation: "2023-03-08",
    categorie: "ضابط صف",
  },
  {
    id: "13",
    nomPrenom: "زياد الحسني",
    grade: "وكيل أول",
    matricule: "13567",
    responsabilite: "مسؤول حسابات",
    telephone: 56345678,
    derniereDateFormation: "2022-11-15",
    categorie: "ضابط صف",
  },
  {
    id: "14",
    nomPrenom: "إلهام الشريف",
    grade: "ملازم أول",
    matricule: "14678",
    responsabilite: "محلل مالي أول",
    telephone: 56456789,
    derniereDateFormation: "2021-04-30",
    categorie: "ضابط",
  },
  {
    id: "15",
    nomPrenom: "طارق بن زياد",
    grade: "نقيب",
    matricule: "15789",
    responsabilite: "أخصائي موارد بشرية",
    telephone: 56567890,
    derniereDateFormation: "2023-08-12",
    categorie: "ضابط",
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Supprimer tous les agents existants
  await prisma.agent.deleteMany()
  console.log('🗑️  Deleted existing agents')

  // Insérer les nouveaux agents
  for (const employee of defaultEmployees) {
    await prisma.agent.create({
      data: employee,
    })
  }

  console.log(`✅ Created ${defaultEmployees.length} agents`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

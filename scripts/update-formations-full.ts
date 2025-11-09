import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Données de spécialités et durées pour chaque formation
const formationsData: Record<string, { specialite: string; duree: string }> = {
  "درجة أولى حدود بحرية BS1": { specialite: "بحري", duree: "سنتان" },
  "درجة ثانية حدود بحرية BS2": { specialite: "بحري", duree: "سنة ونصف" },
  "درجة ثانية قيادة سفن BS2": { specialite: "بحري", duree: "سنتان" },
  "درجة ثالثة قيادة سفن BS3": { specialite: "بحري", duree: "سنة" },
  "درجة ثالثة ميكانيك السفن BS3": { specialite: "بحري", duree: "سنة" },
  "درجة ثالثة سلامة بحرية BS3": { specialite: "بحري", duree: "سنة" },
  "قيادة و صيانة الزوارق السريعة": { specialite: "بحري", duree: "6 أشهر" },
  "تشغيل الرادار": { specialite: "بحري", duree: "أسبوعان" },
  "الأمن البحري": { specialite: "عدلي", duree: "أسبوع" },
  "التصرف في الجثث بالبحر": { specialite: "عدلي", duree: "أسبوع" },
  "تفتيش السفن": { specialite: "عدلي", duree: "أسبوعان" },
  "التعامل مع المجتازين": { specialite: "عدلي", duree: "أسبوع" },
  "تدليس الوثائق": { specialite: "عدلي", duree: "أسبوع" },
  "رئيس مركز بحري": { specialite: "إداري", duree: "شهر" },
  "الإسعافات الأولية": { specialite: "بحري", duree: "أسبوع" },
  "منظومة العمل بقاعات العمليات": { specialite: "إداري", duree: "أسبوعان" },
  "المحاضر و الإجراءات العدلية": { specialite: "عدلي", duree: "أسبوعان" },
}

async function updateFormations() {
  try {
    const formations = await prisma.formation.findMany()

    console.log(`Mise à jour de ${formations.length} formations...\n`)

    for (const formation of formations) {
      const data = formationsData[formation.formation]

      if (data) {
        await prisma.formation.update({
          where: { id: formation.id },
          data: {
            specialite: data.specialite,
            duree: data.duree,
          },
        })
        console.log(`✓ ${formation.formation}`)
        console.log(`  → Spécialité: ${data.specialite}, Durée: ${data.duree}`)
      } else {
        console.log(`⚠ Formation non trouvée dans les données: ${formation.formation}`)
      }
    }

    console.log('\n✅ Mise à jour terminée avec succès!')
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateFormations()

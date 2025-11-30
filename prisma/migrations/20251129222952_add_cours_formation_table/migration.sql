-- CreateTable
CREATE TABLE "CoursFormation" (
    "id" TEXT NOT NULL,
    "formateurId" TEXT NOT NULL,
    "coursId" TEXT NOT NULL,
    "dateDebut" TEXT NOT NULL,
    "dateFin" TEXT NOT NULL,
    "nombreHeures" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoursFormation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoursFormation_formateurId_idx" ON "CoursFormation"("formateurId");

-- CreateIndex
CREATE INDEX "CoursFormation_coursId_idx" ON "CoursFormation"("coursId");

-- AddForeignKey
ALTER TABLE "CoursFormation" ADD CONSTRAINT "CoursFormation_formateurId_fkey" FOREIGN KEY ("formateurId") REFERENCES "Formateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursFormation" ADD CONSTRAINT "CoursFormation_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

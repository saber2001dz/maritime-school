-- CreateTable
CREATE TABLE "Formateur" (
    "id" TEXT NOT NULL,
    "nomPrenom" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "unite" TEXT NOT NULL,
    "responsabilite" TEXT NOT NULL,
    "telephone" INTEGER NOT NULL,
    "RIB" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Formateur_pkey" PRIMARY KEY ("id")
);

/*
  Warnings:

  - The primary key for the `Agent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `poste` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `prenom` on the `Agent` table. All the data in the column will be lost.
  - You are about to alter the column `telephone` on the `Agent` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `categorie` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `derniereDateFormation` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matricule` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomPrenom` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsabilite` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Made the column `telephone` on table `Agent` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomPrenom" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "responsabilite" TEXT NOT NULL,
    "telephone" INTEGER NOT NULL,
    "derniereDateFormation" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Agent" ("createdAt", "id", "telephone", "updatedAt") SELECT "createdAt", "id", "telephone", "updatedAt" FROM "Agent";
DROP TABLE "Agent";
ALTER TABLE "new_Agent" RENAME TO "Agent";
CREATE UNIQUE INDEX "Agent_matricule_key" ON "Agent"("matricule");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

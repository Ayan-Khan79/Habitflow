/*
  Warnings:

  - Made the column `description` on table `Habit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Habit" ALTER COLUMN "description" SET NOT NULL;

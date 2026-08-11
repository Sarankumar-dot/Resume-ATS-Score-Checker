-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "superseded_at" TIMESTAMP(3),
ADD COLUMN     "superseded_by" TEXT;

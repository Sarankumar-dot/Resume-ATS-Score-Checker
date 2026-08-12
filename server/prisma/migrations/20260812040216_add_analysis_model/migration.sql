-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "jd_text" TEXT NOT NULL,
    "match_score" INTEGER NOT NULL,
    "matched_keywords" TEXT[],
    "missing_keywords" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analyses_user_id_idx" ON "analyses"("user_id");

-- CreateIndex
CREATE INDEX "analyses_resume_id_idx" ON "analyses"("resume_id");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

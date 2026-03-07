-- CreateTable
CREATE TABLE "custom_preset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_preset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_preset_userId_idx" ON "custom_preset"("userId");

-- AddForeignKey
ALTER TABLE "custom_preset" ADD CONSTRAINT "custom_preset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "account_id" TEXT;

-- CreateIndex
CREATE INDEX "properties_account_id_idx" ON "properties"("account_id");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

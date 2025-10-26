-- CreateEnum
CREATE TYPE "PropertyDocumentType" AS ENUM ('DEED', 'TITLE', 'MORTGAGE', 'INSURANCE', 'TAX_RECORD', 'INSPECTION_REPORT', 'APPRAISAL', 'LEASE_AGREEMENT', 'REPAIR_RECEIPT', 'UTILITY_BILL', 'HOA_DOCUMENT', 'WARRANTY', 'PERMIT', 'OTHER');

-- CreateTable
CREATE TABLE "property_documents" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "document_type" "PropertyDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_by" TEXT,
    "tags" JSONB,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_documents_property_id_idx" ON "property_documents"("property_id");

-- CreateIndex
CREATE INDEX "property_documents_document_type_idx" ON "property_documents"("document_type");

-- CreateIndex
CREATE INDEX "property_documents_expiry_date_idx" ON "property_documents"("expiry_date");

-- AddForeignKey
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

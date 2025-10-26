-- CreateEnum
CREATE TYPE "PropertyIncomeType" AS ENUM ('RENT', 'LAUNDRY', 'VENDING', 'PARKING', 'PET_FEE', 'LATE_FEE', 'APPLICATION_FEE', 'OTHER');

-- CreateEnum
CREATE TYPE "IncomeFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "acquisition_costs" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "desired_cap_rate" DOUBLE PRECISION,
ADD COLUMN     "down_payment" DOUBLE PRECISION,
ADD COLUMN     "furnish_costs" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "image_urls" JSONB,
ADD COLUMN     "loan_amount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "loan_interest_rate" DOUBLE PRECISION,
ADD COLUMN     "loan_term_years" INTEGER,
ADD COLUMN     "monthly_mortgage_payment" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "number_of_units" INTEGER DEFAULT 1,
ADD COLUMN     "primary_image_url" TEXT,
ADD COLUMN     "property_management_fee_percent" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "refurbish_costs" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "vacancy_rate_percent" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "property_expense_templates" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "property_management_fee" DOUBLE PRECISION DEFAULT 0,
    "accounting_legal_fees" DOUBLE PRECISION DEFAULT 0,
    "repairs_maintenance" DOUBLE PRECISION DEFAULT 0,
    "pest_control" DOUBLE PRECISION DEFAULT 0,
    "real_estate_taxes" DOUBLE PRECISION DEFAULT 0,
    "property_insurance" DOUBLE PRECISION DEFAULT 0,
    "hoa_fees" DOUBLE PRECISION DEFAULT 0,
    "water_sewer" DOUBLE PRECISION DEFAULT 0,
    "gas_electricity" DOUBLE PRECISION DEFAULT 0,
    "garbage" DOUBLE PRECISION DEFAULT 0,
    "cable_phone_internet" DOUBLE PRECISION DEFAULT 0,
    "advertising" DOUBLE PRECISION DEFAULT 0,
    "other_expenses" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_expense_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_income" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "income_type" "PropertyIncomeType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" "IncomeFrequency" NOT NULL DEFAULT 'MONTHLY',
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_expense_templates_property_id_key" ON "property_expense_templates"("property_id");

-- CreateIndex
CREATE INDEX "property_income_property_id_idx" ON "property_income"("property_id");

-- AddForeignKey
ALTER TABLE "property_expense_templates" ADD CONSTRAINT "property_expense_templates_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_income" ADD CONSTRAINT "property_income_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OWNER', 'VIEW_ONLY', 'GUEST');

-- CreateEnum
CREATE TYPE "TaxTreatment" AS ENUM ('TAXABLE', 'TAX_DEFERRED', 'TAX_EXEMPT');

-- CreateEnum
CREATE TYPE "InvestmentCategory" AS ENUM ('EQUITY', 'FIXED_INCOME', 'REAL_ESTATE', 'ALTERNATIVE', 'BUSINESS', 'CASH', 'COMMODITY', 'CRYPTOCURRENCY');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL', 'DIVIDEND', 'DISTRIBUTION', 'REINVESTMENT', 'TRANSFER', 'CORPORATE_ACTION', 'CONTRIBUTION', 'WITHDRAWAL', 'EXPENSE', 'INCOME');

-- CreateEnum
CREATE TYPE "HoldingPeriod" AS ENUM ('SHORT_TERM', 'LONG_TERM');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'LAND', 'MULTI_FAMILY', 'MIXED_USE');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('LLC', 'PARTNERSHIP', 'S_CORP', 'C_CORP', 'SOLE_PROPRIETOR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OWNER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "institution" TEXT,
    "account_number" TEXT,
    "tax_treatment" "TaxTreatment" NOT NULL,
    "owner" TEXT,
    "beneficiaries" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "InvestmentCategory" NOT NULL,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "custom_fields" JSONB,
    "calculation_rules" JSONB,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "investment_type_id" TEXT NOT NULL,
    "symbol" TEXT,
    "name" TEXT NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost_basis_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost_basis_per_share" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unrealized_gain_loss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "position_id" TEXT,
    "transaction_type" "TransactionType" NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "settlement_date" TIMESTAMP(3),
    "shares" DOUBLE PRECISION,
    "price_per_share" DOUBLE PRECISION,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_lot_id" TEXT,
    "description" TEXT,
    "is_reconciled" BOOLEAN NOT NULL DEFAULT false,
    "imported_from" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_lots" (
    "id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "acquisition_date" TIMESTAMP(3) NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "cost_basis" DOUBLE PRECISION NOT NULL,
    "disposition_date" TIMESTAMP(3),
    "holding_period_type" "HoldingPeriod",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" BIGINT,
    "adjusted_close" DOUBLE PRECISION,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_id" TEXT,
    "property_type" "PropertyType" NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "purchase_price" DOUBLE PRECISION NOT NULL,
    "current_value" DOUBLE PRECISION NOT NULL,
    "loan_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bedrooms" INTEGER,
    "bathrooms" DOUBLE PRECISION,
    "square_feet" DOUBLE PRECISION,
    "lot_size" DOUBLE PRECISION,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "tenant_name" TEXT NOT NULL,
    "tenant_contact" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "monthly_rent" DOUBLE PRECISION NOT NULL,
    "security_deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "lease_document_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_transactions" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "vendor" TEXT,
    "receipt_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_name" TEXT NOT NULL,
    "ein" TEXT,
    "formation_date" TIMESTAMP(3) NOT NULL,
    "ownership_percentage" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_operations" (
    "id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "farm_name" TEXT NOT NULL,
    "acreage" DOUBLE PRECISION,
    "crop_type" TEXT,
    "livestock_type" TEXT,
    "series_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "budgeted_amount" DOUBLE PRECISION NOT NULL,
    "actual_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rebalancing_targets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "asset_class" TEXT NOT NULL,
    "target_percentage" DOUBLE PRECISION NOT NULL,
    "min_percentage" DOUBLE PRECISION,
    "max_percentage" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rebalancing_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "related_entity_type" TEXT NOT NULL,
    "related_entity_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "investment_types_category_idx" ON "investment_types"("category");

-- CreateIndex
CREATE INDEX "positions_account_id_idx" ON "positions"("account_id");

-- CreateIndex
CREATE INDEX "positions_symbol_idx" ON "positions"("symbol");

-- CreateIndex
CREATE INDEX "transactions_account_id_idx" ON "transactions"("account_id");

-- CreateIndex
CREATE INDEX "transactions_position_id_idx" ON "transactions"("position_id");

-- CreateIndex
CREATE INDEX "transactions_transaction_date_idx" ON "transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "tax_lots_position_id_idx" ON "tax_lots"("position_id");

-- CreateIndex
CREATE INDEX "prices_symbol_idx" ON "prices"("symbol");

-- CreateIndex
CREATE INDEX "prices_date_idx" ON "prices"("date");

-- CreateIndex
CREATE UNIQUE INDEX "prices_symbol_date_key" ON "prices"("symbol", "date");

-- CreateIndex
CREATE INDEX "properties_user_id_idx" ON "properties"("user_id");

-- CreateIndex
CREATE INDEX "properties_entity_id_idx" ON "properties"("entity_id");

-- CreateIndex
CREATE INDEX "leases_property_id_idx" ON "leases"("property_id");

-- CreateIndex
CREATE INDEX "property_transactions_property_id_idx" ON "property_transactions"("property_id");

-- CreateIndex
CREATE INDEX "property_transactions_transaction_date_idx" ON "property_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "entities_user_id_idx" ON "entities"("user_id");

-- CreateIndex
CREATE INDEX "farm_operations_entity_id_idx" ON "farm_operations"("entity_id");

-- CreateIndex
CREATE INDEX "budgets_user_id_idx" ON "budgets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_user_id_year_month_category_subcategory_key" ON "budgets"("user_id", "year", "month", "category", "subcategory");

-- CreateIndex
CREATE INDEX "rebalancing_targets_user_id_idx" ON "rebalancing_targets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rebalancing_targets_user_id_asset_class_key" ON "rebalancing_targets"("user_id", "asset_class");

-- CreateIndex
CREATE INDEX "documents_user_id_idx" ON "documents"("user_id");

-- CreateIndex
CREATE INDEX "documents_related_entity_type_related_entity_id_idx" ON "documents"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "audit_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_timestamp_idx" ON "audit_log"("timestamp");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_types" ADD CONSTRAINT "investment_types_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_investment_type_id_fkey" FOREIGN KEY ("investment_type_id") REFERENCES "investment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tax_lot_id_fkey" FOREIGN KEY ("tax_lot_id") REFERENCES "tax_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_lots" ADD CONSTRAINT "tax_lots_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_transactions" ADD CONSTRAINT "property_transactions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_operations" ADD CONSTRAINT "farm_operations_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rebalancing_targets" ADD CONSTRAINT "rebalancing_targets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

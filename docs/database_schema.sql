-- Investment Portfolio Management App - Database Schema
-- PostgreSQL Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_type VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    account_number VARCHAR(100),
    tax_treatment VARCHAR(50),
    owner VARCHAR(255),
    beneficiaries JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investment types table
CREATE TABLE investment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    custom_fields JSONB,
    calculation_rules JSONB,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions table
CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    investment_type_id INTEGER REFERENCES investment_types(id),
    symbol VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    shares DECIMAL(18, 6),
    cost_basis_total DECIMAL(18, 2),
    cost_basis_per_share DECIMAL(18, 6),
    current_price DECIMAL(18, 6),
    current_value DECIMAL(18, 2),
    unrealized_gain_loss DECIMAL(18, 2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    position_id INTEGER REFERENCES positions(id),
    transaction_type VARCHAR(50) NOT NULL,
    transaction_date DATE NOT NULL,
    settlement_date DATE,
    shares DECIMAL(18, 6),
    price_per_share DECIMAL(18, 6),
    total_amount DECIMAL(18, 2) NOT NULL,
    fees DECIMAL(18, 2) DEFAULT 0,
    tax_lot_id INTEGER,
    description TEXT,
    is_reconciled BOOLEAN DEFAULT false,
    imported_from VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax lots table
CREATE TABLE tax_lots (
    id SERIAL PRIMARY KEY,
    position_id INTEGER NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    acquisition_date DATE NOT NULL,
    shares DECIMAL(18, 6) NOT NULL,
    cost_basis DECIMAL(18, 2) NOT NULL,
    disposition_date DATE,
    holding_period_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prices table
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    open DECIMAL(18, 6),
    high DECIMAL(18, 6),
    low DECIMAL(18, 6),
    close DECIMAL(18, 6),
    volume BIGINT,
    adjusted_close DECIMAL(18, 6),
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, date)
);

-- Entities table (LLCs, partnerships, etc.)
CREATE TABLE entities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    ein VARCHAR(20),
    formation_date DATE,
    ownership_percentage DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_id INTEGER REFERENCES entities(id),
    property_type VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    purchase_date DATE,
    purchase_price DECIMAL(18, 2),
    current_value DECIMAL(18, 2),
    loan_balance DECIMAL(18, 2),
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    square_feet INTEGER,
    lot_size DECIMAL(10, 2),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leases table
CREATE TABLE leases (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_name VARCHAR(255),
    tenant_contact VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(18, 2) NOT NULL,
    security_deposit DECIMAL(18, 2),
    is_active BOOLEAN DEFAULT true,
    lease_document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property transactions table
CREATE TABLE property_transactions (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    amount DECIMAL(18, 2) NOT NULL,
    description TEXT,
    vendor VARCHAR(255),
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farm operations table
CREATE TABLE farm_operations (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER REFERENCES entities(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    acreage DECIMAL(10, 2),
    crop_type VARCHAR(100),
    livestock_type VARCHAR(100),
    series_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    budgeted_amount DECIMAL(18, 2) NOT NULL,
    actual_amount DECIMAL(18, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rebalancing targets table
CREATE TABLE rebalancing_targets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_class VARCHAR(100) NOT NULL,
    target_percentage DECIMAL(5, 2) NOT NULL,
    min_percentage DECIMAL(5, 2),
    max_percentage DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    document_type VARCHAR(100),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_positions_account_id ON positions(account_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_position_id ON transactions(position_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_tax_lots_position_id ON tax_lots(position_id);
CREATE INDEX idx_prices_symbol ON prices(symbol);
CREATE INDEX idx_prices_date ON prices(date);
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_leases_property_id ON leases(property_id);
CREATE INDEX idx_property_transactions_property_id ON property_transactions(property_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);

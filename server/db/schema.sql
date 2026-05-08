CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('viewer', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('income', 'expense')),
  category VARCHAR(80) NOT NULL,
  record_date DATE NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_records_record_date ON financial_records (record_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_financial_records_record_type ON financial_records (record_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_financial_records_category ON financial_records (category) WHERE deleted_at IS NULL;

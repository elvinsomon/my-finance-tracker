-- ============================================================================
-- MyFinanceTracker Database Initialization Script
-- ============================================================================
-- This script runs automatically when the PostgreSQL container is first created.
-- It sets up initial configuration and seed data for the application.
--
-- NOTE: The database 'financemanager' is already created by the container
-- environment variables, so we don't need to create it here.
-- ============================================================================

-- Connect to the financemanager database
\c financemanager

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable trigram similarity for better text search (useful for merchant/description matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ============================================================================
-- SEED DATA: Exchange Rates
-- ============================================================================
-- These are initial exchange rates. The application should update these regularly
-- via an external API or manual updates.
--
-- Note: The ExchangeRates table will be created by EF Core migrations,
-- so this data will be inserted later when the table exists.
-- This is just a placeholder for reference.
-- ============================================================================

-- Initial exchange rates (as of October 2024 - approximate values)
-- These will be inserted after EF Core creates the tables

-- USD to DOP: 1 USD = ~58 DOP
-- EUR to USD: 1 EUR = ~1.06 USD
-- EUR to DOP: 1 EUR = ~61.5 DOP

-- Example SQL for when tables exist:
-- INSERT INTO "ExchangeRates" ("Id", "FromCurrency", "ToCurrency", "Rate", "Date", "Source", "CreatedAt")
-- VALUES
--     (uuid_generate_v4(), 'USD', 'DOP', 58.00, CURRENT_DATE, 'Manual Entry', NOW()),
--     (uuid_generate_v4(), 'DOP', 'USD', 0.01724, CURRENT_DATE, 'Manual Entry', NOW()),
--     (uuid_generate_v4(), 'EUR', 'USD', 1.06, CURRENT_DATE, 'Manual Entry', NOW()),
--     (uuid_generate_v4(), 'USD', 'EUR', 0.9434, CURRENT_DATE, 'Manual Entry', NOW()),
--     (uuid_generate_v4(), 'EUR', 'DOP', 61.50, CURRENT_DATE, 'Manual Entry', NOW()),
--     (uuid_generate_v4(), 'DOP', 'EUR', 0.01626, CURRENT_DATE, 'Manual Entry', NOW());


-- ============================================================================
-- DATABASE CONFIGURATION
-- ============================================================================

-- Set timezone to UTC for consistency
SET timezone = 'UTC';

-- Configure some PostgreSQL settings for better performance
ALTER DATABASE financemanager SET timezone TO 'UTC';
ALTER DATABASE financemanager SET client_encoding TO 'UTF8';


-- ============================================================================
-- INFORMATION
-- ============================================================================

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'MyFinanceTracker Database Initialized Successfully';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'Database: financemanager';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, pg_trgm';
    RAISE NOTICE 'Timezone: UTC';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run EF Core migrations to create tables';
    RAISE NOTICE '2. Seed initial data (users, categories, exchange rates)';
    RAISE NOTICE '=======================================================';
END $$;

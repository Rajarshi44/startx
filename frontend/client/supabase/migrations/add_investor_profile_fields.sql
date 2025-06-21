-- Migration to add additional fields to investor_profiles table
-- Run this if you have an existing database with the old schema

-- Add new columns to investor_profiles table
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS investment_focus TEXT;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS stage_preference TEXT;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS sector_preference TEXT;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS check_size_min NUMERIC;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS check_size_max NUMERIC;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS portfolio_companies INTEGER;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS investment_criteria TEXT;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS aum NUMERIC; -- Assets Under Management
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS notable_investments TEXT; 
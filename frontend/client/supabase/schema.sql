-- User table to store authenticated users and their roles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civic_id TEXT UNIQUE NOT NULL, -- Civic Auth user ID
  email TEXT,
  name TEXT,
  wallet_address TEXT,
  role TEXT CHECK (role IN ('founder', 'jobseeker', 'investor')),
  profile_data JSONB DEFAULT '{}', -- Store additional Civic Auth profile data
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_civic_id ON users(civic_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- RLS (Row Level Security) policies - Updated for Civic Auth
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- More permissive policies for Civic Auth integration
CREATE POLICY "Allow all operations for authenticated users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  stage TEXT,
  level TEXT,
  valuation NUMERIC,
  match NUMERIC,
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON companies
  FOR ALL USING (true) WITH CHECK (true);

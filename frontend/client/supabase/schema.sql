-- User table to store authenticated users (can have multiple role profiles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civic_id TEXT UNIQUE NOT NULL, -- Civic Auth user ID
  email TEXT,
  name TEXT,
  wallet_address TEXT,
  active_roles TEXT[] DEFAULT '{}', -- Array to track which roles are active for the user
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

-- Note: Comprehensive policies will be created later in the ENABLE RLS AND CREATE POLICIES section

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update user active_roles when profiles are created/deleted
CREATE OR REPLACE FUNCTION update_user_active_roles()
RETURNS TRIGGER AS $$
DECLARE
    user_uuid UUID;
    new_roles TEXT[] := '{}';
BEGIN
    -- Get user_id from the profile table
    IF TG_OP = 'DELETE' THEN
        user_uuid := OLD.user_id;
    ELSE
        user_uuid := NEW.user_id;
    END IF;

    -- Check which profiles exist for this user
    IF EXISTS (SELECT 1 FROM founder_profiles WHERE user_id = user_uuid) THEN
        new_roles := array_append(new_roles, 'founder');
    END IF;
    
    IF EXISTS (SELECT 1 FROM investor_profiles WHERE user_id = user_uuid) THEN
        new_roles := array_append(new_roles, 'investor');
    END IF;
    
    IF EXISTS (SELECT 1 FROM jobseeker_profiles WHERE user_id = user_uuid) THEN
        new_roles := array_append(new_roles, 'jobseeker');
    END IF;

    -- Update the user's active_roles
    UPDATE users SET active_roles = new_roles WHERE id = user_uuid;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FOUNDER ROLE TABLES
-- =============================================

-- Companies table (already exists, enhanced)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  stage TEXT,
  level TEXT,
  valuation NUMERIC,
  match NUMERIC,
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);

-- Idea validations table
CREATE TABLE IF NOT EXISTS idea_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  idea_text TEXT NOT NULL,
  validation_result TEXT,
  score NUMERIC,
  perplexity_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idea_validations_user_id ON idea_validations(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_validations_company_id ON idea_validations(company_id);

-- Co-founder matching table
CREATE TABLE IF NOT EXISTS cofounder_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skills_needed TEXT[],
  experience_level TEXT,
  compatibility_score NUMERIC,
  status TEXT CHECK (status IN ('pending', 'connected', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cofounder_matches_founder ON cofounder_matches(founder_user_id);
CREATE INDEX IF NOT EXISTS idx_cofounder_matches_matched ON cofounder_matches(matched_user_id);

-- Founder profiles table
CREATE TABLE IF NOT EXISTS founder_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_count INTEGER DEFAULT 0,
  cofounders TEXT[],
  bio TEXT,
  achievements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Keep unique constraint to ensure one founder profile per user
);

CREATE INDEX IF NOT EXISTS idx_founder_profiles_user_id ON founder_profiles(user_id);

-- =============================================
-- INVESTOR ROLE TABLES
-- =============================================

-- Investor profiles table
CREATE TABLE IF NOT EXISTS investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  firm_name TEXT,
  investment_range_min NUMERIC,
  investment_range_max NUMERIC,
  preferred_stages TEXT[],
  preferred_industries TEXT[],
  preferred_sectors TEXT[],
  portfolio_size INTEGER DEFAULT 0,
  total_investments NUMERIC DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Keep unique constraint to ensure one investor profile per user
);

CREATE INDEX IF NOT EXISTS idx_investor_profiles_user_id ON investor_profiles(user_id);

-- Deal flow table
CREATE TABLE IF NOT EXISTS deal_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('new', 'reviewing', 'interested', 'due_diligence', 'invested', 'passed')) DEFAULT 'new',
  investment_amount NUMERIC,
  valuation NUMERIC,
  notes TEXT,
  meeting_scheduled TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deal_flow_investor ON deal_flow(investor_id);
CREATE INDEX IF NOT EXISTS idx_deal_flow_company ON deal_flow(company_id);
CREATE INDEX IF NOT EXISTS idx_deal_flow_status ON deal_flow(status);

-- Investment portfolio table
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  investment_amount NUMERIC NOT NULL,
  equity_percentage NUMERIC,
  investment_date DATE,
  current_valuation NUMERIC,
  status TEXT CHECK (status IN ('active', 'exited', 'written_off')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_company ON investments(company_id);

-- =============================================
-- JOBSEEKER ROLE TABLES
-- =============================================

-- Job seeker profiles table
CREATE TABLE IF NOT EXISTS jobseeker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  city TEXT,
  country TEXT DEFAULT 'India',
  date_of_birth DATE,
  gender TEXT,
  languages TEXT[],
  profile_picture_url TEXT,
  current_status TEXT,
  experience_level TEXT,
  education_level TEXT,
  university TEXT,
  graduation_year INTEGER,
  skills TEXT[],
  resume_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  interests TEXT[],
  career_goals TEXT[],
  job_types TEXT[],
  work_modes TEXT[],
  salary_expectation TEXT,
  availability TEXT,
  willing_to_relocate BOOLEAN DEFAULT false,
  bio TEXT,
  achievements TEXT[],
  certifications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Keep unique constraint to ensure one jobseeker profile per user
);

CREATE INDEX IF NOT EXISTS idx_jobseeker_profiles_user_id ON jobseeker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_jobseeker_profiles_city ON jobseeker_profiles(city);
CREATE INDEX IF NOT EXISTS idx_jobseeker_profiles_skills ON jobseeker_profiles USING GIN(skills);

-- Job postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  skills_required TEXT[],
  experience_level TEXT,
  job_type TEXT,
  work_mode TEXT,
  salary_range TEXT,
  location TEXT,
  status TEXT CHECK (status IN ('active', 'closed', 'draft')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_skills ON job_postings USING GIN(skills_required);

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jobseeker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT CHECK (status IN ('applied', 'interview', 'accepted', 'rejected', 'waitlist')) DEFAULT 'applied',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_jobseeker ON job_applications(jobseeker_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_posting ON job_applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- Interview sessions table for D-ID AI Avatar interviews
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('jobseeker', 'founder', 'investor')),
  agent_id TEXT NOT NULL, -- D-ID agent ID
  stream_id TEXT NOT NULL, -- D-ID stream ID
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL, -- Job posting being interviewed for
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  questions_asked INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 8,
  transcript TEXT, -- Full interview transcript
  analysis JSONB, -- AI analysis of the interview
  feedback TEXT, -- Summary feedback
  score NUMERIC, -- Overall interview score (0-10)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_role ON interview_sessions(role);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_at ON interview_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_job_posting ON interview_sessions(job_posting_id);

-- =============================================
-- SHARED TABLES
-- =============================================

-- Messages/Communications table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Meetings/Events table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meetings_organizer ON meetings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_meetings_participant ON meetings(participant_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON meetings(scheduled_at);

-- =============================================
-- ENABLE RLS AND CREATE POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cofounder_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobseeker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for all tables
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON companies;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON idea_validations;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON cofounder_matches;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON founder_profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON investor_profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON deal_flow;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON investments;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON jobseeker_profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON job_postings;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON job_applications;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON interview_sessions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON messages;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON meetings;

-- Create comprehensive policies for all tables
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON idea_validations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON cofounder_matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON founder_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON investor_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON deal_flow FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON investments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON jobseeker_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON job_postings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON job_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON interview_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON meetings FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- ADD TRIGGERS FOR UPDATED_AT
-- =============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_founder_profiles_updated_at ON founder_profiles;
DROP TRIGGER IF EXISTS update_investor_profiles_updated_at ON investor_profiles;
DROP TRIGGER IF EXISTS update_deal_flow_updated_at ON deal_flow;
DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
DROP TRIGGER IF EXISTS update_jobseeker_profiles_updated_at ON jobseeker_profiles;
DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
DROP TRIGGER IF EXISTS update_interview_sessions_updated_at ON interview_sessions;

-- Add updated_at triggers for all tables that need them
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_founder_profiles_updated_at BEFORE UPDATE ON founder_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investor_profiles_updated_at BEFORE UPDATE ON investor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deal_flow_updated_at BEFORE UPDATE ON deal_flow FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobseeker_profiles_updated_at BEFORE UPDATE ON jobseeker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_sessions_updated_at BEFORE UPDATE ON interview_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ADD TRIGGERS FOR ACTIVE ROLES MANAGEMENT
-- =============================================

-- Drop existing active roles management triggers if they exist
DROP TRIGGER IF EXISTS update_active_roles_founder_insert ON founder_profiles;
DROP TRIGGER IF EXISTS update_active_roles_founder_delete ON founder_profiles;
DROP TRIGGER IF EXISTS update_active_roles_investor_insert ON investor_profiles;
DROP TRIGGER IF EXISTS update_active_roles_investor_delete ON investor_profiles;
DROP TRIGGER IF EXISTS update_active_roles_jobseeker_insert ON jobseeker_profiles;
DROP TRIGGER IF EXISTS update_active_roles_jobseeker_delete ON jobseeker_profiles;

-- Triggers to automatically update user active_roles when profiles are created/deleted
CREATE TRIGGER update_active_roles_founder_insert AFTER INSERT ON founder_profiles FOR EACH ROW EXECUTE FUNCTION update_user_active_roles();
CREATE TRIGGER update_active_roles_founder_delete AFTER DELETE ON founder_profiles FOR EACH ROW EXECUTE FUNCTION update_user_active_roles();

CREATE TRIGGER update_active_roles_investor_insert AFTER INSERT ON investor_profiles FOR EACH ROW EXECUTE FUNCTION update_user_active_roles();
CREATE TRIGGER update_active_roles_investor_delete AFTER DELETE ON investor_profiles FOR EACH ROW EXECUTE FUNCTION update_user_active_roles();

CREATE TRIGGER update_active_roles_jobseeker_insert AFTER INSERT ON jobseeker_profiles FOR EACH ROW EXECUTE FUNCTION update_user_active_roles();
CREATE TRIGGER update_active_roles_jobseeker_delete AFTER DELETE ON jobseeker_profiles FOR EACH ROW EXECUTE FUNCTION update_user_active_roles();
-- Add job_posting_id to interview_sessions table
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_interview_sessions_job_posting_id ON interview_sessions(job_posting_id);

-- Update the interview_sessions table comment
COMMENT ON TABLE interview_sessions IS 'Stores AI avatar interview sessions using Tavus AI for real-time video interviews';
COMMENT ON COLUMN interview_sessions.agent_id IS 'Tavus persona ID for the AI interviewer';
COMMENT ON COLUMN interview_sessions.stream_id IS 'Tavus conversation ID for the interview session';
COMMENT ON COLUMN interview_sessions.job_posting_id IS 'Reference to the job posting this interview is for';

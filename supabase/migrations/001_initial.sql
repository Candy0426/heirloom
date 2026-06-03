-- Enable RLS
alter table auth.users enable row level security;

-- Vaults table
CREATE TABLE vaults (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  encrypted_data TEXT NOT NULL, -- AES-256 encrypted JSON
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own vaults"
  ON vaults FOR ALL
  USING (auth.uid() = user_id);

-- Assets table (optional, for structured queries on encrypted data)
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE NOT NULL,
  encrypted_blob TEXT NOT NULL, -- individual encrypted asset
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Inheritance plans
CREATE TABLE inheritance_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE NOT NULL,
  beneficiary_email TEXT NOT NULL,
  beneficiary_name TEXT,
  wait_days INTEGER NOT NULL DEFAULT 30,
  last_check_in TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active', -- active | triggered | completed
  share_part_1 TEXT NOT NULL, -- encrypted share held by platform
  share_part_2 TEXT, -- encrypted share ready to send to beneficiary
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inheritance_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own plans"
  ON inheritance_plans FOR ALL
  USING (auth.uid() = user_id);

-- Check-ins log
CREATE TABLE check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID REFERENCES inheritance_plans(id) ON DELETE CASCADE NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vaults_updated_at BEFORE UPDATE ON vaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Heirloom Database Schema
-- Run this in your Supabase SQL Editor

-- Enable RLS (Row Level Security) on all tables

-- Vaults table (stores encrypted vault data)
CREATE TABLE IF NOT EXISTS vaults (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  encrypted_data JSONB NOT NULL DEFAULT '{}',
  asset_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on vaults
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;

-- Users can only see their own vaults
CREATE POLICY "Users can view own vaults" ON vaults
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own vaults
CREATE POLICY "Users can create own vaults" ON vaults
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own vaults
CREATE POLICY "Users can update own vaults" ON vaults
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own vaults
CREATE POLICY "Users can delete own vaults" ON vaults
  FOR DELETE USING (auth.uid() = user_id);

-- Inheritance plans table
CREATE TABLE IF NOT EXISTS inheritance_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vault_id UUID REFERENCES vaults(id) ON DELETE SET NULL,
  beneficiary_email TEXT NOT NULL,
  beneficiary_name TEXT,
  wait_days INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'active',
  share2_encrypted TEXT, -- encrypted share2 for beneficiary
  last_check_in TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on inheritance_plans
ALTER TABLE inheritance_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans" ON inheritance_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans" ON inheritance_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON inheritance_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON inheritance_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Check-ins table (tracks user check-ins)
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES inheritance_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on check_ins
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own check-ins" ON check_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own check-ins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_vaults_updated_at
  BEFORE UPDATE ON vaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inheritance_plans_updated_at
  BEFORE UPDATE ON inheritance_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON inheritance_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_vault_id ON inheritance_plans(vault_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_plan_id ON check_ins(plan_id);

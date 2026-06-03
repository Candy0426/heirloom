export interface Asset {
  id?: string
  type: 'bank' | 'crypto' | 'investment' | 'insurance' | 'real_estate' | 'other'
  name: string
  institution?: string
  account_number?: string
  balance?: string
  notes?: string
  documents?: string[] // URLs to encrypted files
}

export interface Vault {
  id?: string
  user_id: string
  name: string
  encrypted_data: string // JSON.stringify(assets) encrypted
  created_at?: string
  updated_at?: string
}

export interface InheritancePlan {
  id?: string
  user_id: string
  vault_id: string
  beneficiary_email: string
  beneficiary_name: string
  wait_days: number // 30, 60, 90
  last_check_in?: string
  status: 'active' | 'triggered' | 'completed'
  share_part_1: string // part 1 of Shamir's secret (sent to platform)
  share_part_2?: string // part 2 (encrypted, ready to send to beneficiary when triggered)
  created_at?: string
}

export interface CheckIn {
  id?: string
  user_id: string
  plan_id: string
  checked_at: string
}

// Oracle Service Types

export interface Company {
  id: string
  user_id: string
  name: string
  description?: string
  industry?: string
  stage?: string
  level?: string
  valuation?: number
  match?: number
  sector?: string
  created_at: string
  updated_at: string
}

export interface DealFlow {
  id: string
  investor_id: string
  company_id: string
  status: 'new' | 'reviewing' | 'interested' | 'due_diligence' | 'invested' | 'passed'
  investment_amount?: number
  valuation?: number
  notes?: string
  meeting_scheduled?: string
  created_at: string
  updated_at: string
}

export interface CompanyData {
  name: string
  description: string
  sector: string
  stage: string
  valuation: bigint
}

export interface DealData {
  companyId: number
  dealType: string
  amount: bigint
  status: string
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  supabase: {
    connected: boolean
    url?: string
  }
  blockchain: {
    connected: boolean
    currentBlock?: number
    contractAddress?: string
    companiesOnChain?: string
  }
  sync: {
    lastSync: string
    inProgress: boolean
  }
  error?: string
}

export interface OracleResponse {
  message?: string
  error?: string
  details?: string
  timestamp: string
  health?: HealthCheck
  subscriptions?: {
    companies: boolean
    deals: boolean
  }
  endpoints?: Record<string, string>
}

export interface SyncOptions {
  batchSize?: number
  gasLimit?: number
  forceSync?: boolean
}

export interface OracleConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  rpcUrl: string
  privateKey: string
  contractAddress: string
  syncInterval?: number
  realtimeEnabled?: boolean
}

// Contract Event Types
export interface CompanyAddedEvent {
  companyId: bigint
  name: string
  sector: string
}

export interface DealAddedEvent {
  dealId: bigint
  companyId: bigint
  amount: bigint
}

export interface DataSyncCompletedEvent {
  timestamp: bigint
  companiesCount: bigint
  dealsCount: bigint
}

// API Request Types
export interface OracleActionRequest {
  action: 'sync' | 'sync-companies' | 'sync-deals' | 'sync-deal-flow' | 'start' | 'stop' | 'health' | 'setup-realtime'
  options?: SyncOptions
}

// Blockchain Company Structure (matching smart contract)
export interface BlockchainCompany {
  name: string
  description: string
  sector: string
  stage: string
  valuation: bigint
  isActive: boolean
  timestamp: bigint
}

// Blockchain Deal Structure (matching smart contract)
export interface BlockchainDeal {
  companyId: bigint
  dealType: string
  amount: bigint
  status: string
  timestamp: bigint
  isActive: boolean
} 
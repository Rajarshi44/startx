import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ethers, Contract, Wallet, JsonRpcProvider } from 'ethers'
import { 
  Company, 
  DealFlow, 
  CompanyData, 
  DealData, 
  HealthCheck,
  SyncOptions,
  CompanyAddedEvent,
  DealAddedEvent
} from '@/types/oracle'
import contractABI from '@/contractABI'

export class DealFlowOracle {
  private supabase: SupabaseClient
  private provider: JsonRpcProvider
  private wallet: Wallet
  private contract: Contract
  private contractAddress: string
  private lastSyncTimestamp: number = 0
  private syncInProgress: boolean = false

  // Contract ABI
  private readonly contractABI = contractABI

  constructor() {
    // Initialize Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Initialize blockchain connection
    this.provider = new JsonRpcProvider(process.env.RPC_URL!)
    this.wallet = new Wallet(process.env.PRIVATE_KEY!, this.provider)
    
    this.contractAddress = process.env.CONTRACT_ADDRESS!
    this.contract = new Contract(this.contractAddress, this.contractABI, this.wallet)
  }

  // Fetch data from Supabase
  async fetchCompaniesFromSupabase(): Promise<Company[]> {
    try {
      const { data: companies, error } = await this.supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log(`Fetched ${companies.length} companies from Supabase`)
      return companies
    } catch (error) {
      console.error('Error fetching companies from Supabase:', error)
      throw error
    }
  }

  async fetchDealFlowFromSupabase(): Promise<DealFlow[]> {
    try {
      const { data: deals, error } = await this.supabase
        .from('deal_flow')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log(`Fetched ${deals.length} deals from Supabase`)
      return deals
    } catch (error) {
      console.error('Error fetching deals from Supabase:', error)
      throw error
    }
  }

  // Transform Supabase data for blockchain
  private transformCompanyData(company: Company): CompanyData {
    return {
      name: company.name || '',
      description: company.description || '',
      sector: company.sector || 'Technology',
      stage: company.stage || 'Early',
      valuation: ethers.parseEther((company.valuation || 0).toString())
    }
  }

  private transformDealData(deal: DealFlow): DealData {
    return {
      companyId: 1, // You might need to map company_id to blockchain company ID
      dealType: 'Investment',
      amount: ethers.parseEther((deal.investment_amount || 0).toString()),
      status: deal.status || 'new'
    }
  }

  // Sync companies to blockchain
  async syncCompaniesToBlockchain(): Promise<void> {
    try {
      console.log('Starting company sync to blockchain...')

      const companies = await this.fetchCompaniesFromSupabase()
      const onChainCompanyCount = await this.contract.companyCount()

      console.log(`On-chain companies: ${onChainCompanyCount}, Supabase companies: ${companies.length}`)

      // If we have new companies, sync them
      if (companies.length > Number(onChainCompanyCount)) {
        const newCompanies = companies.slice(Number(onChainCompanyCount))

        if (newCompanies.length > 0) {
          console.log(`Syncing ${newCompanies.length} new companies...`)

          // Batch sync for efficiency
          const batchSize = 5 // Adjust based on gas limits
          for (let i = 0; i < newCompanies.length; i += batchSize) {
            const batch = newCompanies.slice(i, i + batchSize)
            await this.batchSyncCompanies(batch)
          }
        }
      }

      console.log('Company sync completed')
    } catch (error) {
      console.error('Error syncing companies:', error)
      throw error
    }
  }

  private async batchSyncCompanies(companies: Company[]): Promise<ethers.ContractTransactionResponse> {
    try {
      const names: string[] = []
      const descriptions: string[] = []
      const sectors: string[] = []
      const stages: string[] = []
      const valuations: bigint[] = []

      for (const company of companies) {
        const transformed = this.transformCompanyData(company)
        names.push(transformed.name)
        descriptions.push(transformed.description)
        sectors.push(transformed.sector)
        stages.push(transformed.stage)
        valuations.push(transformed.valuation)
      }

      console.log(`Executing batch sync for ${companies.length} companies...`)

      const tx = await this.contract.batchAddCompanies(
        names, descriptions, sectors, stages, valuations,
        { gasLimit: 500000 * companies.length }
      )

      console.log(`Transaction sent: ${tx.hash}`)
      const receipt = await tx.wait()
      console.log(`Batch sync confirmed in block ${receipt?.blockNumber}`)

      return tx
    } catch (error) {
      console.error('Error in batch sync:', error)
      throw error
    }
  }

  // Sync deals to blockchain
  async syncDealsToBlockchain(): Promise<void> {
    try {
      console.log('Starting deal sync to blockchain...')

      const deals = await this.fetchDealFlowFromSupabase()
      const onChainDealCount = await this.contract.dealCount()

      console.log(`On-chain deals: ${onChainDealCount}, Supabase deals: ${deals.length}`)

      if (deals.length > Number(onChainDealCount)) {
        const newDeals = deals.slice(Number(onChainDealCount))

        for (const deal of newDeals) {
          try {
            const transformed = this.transformDealData(deal)

            const tx = await this.contract.addDeal(
              transformed.companyId,
              transformed.dealType,
              transformed.amount,
              transformed.status,
              { gasLimit: 200000 }
            )

            console.log(`Deal added: ${tx.hash}`)
            await tx.wait()
          } catch (error) {
            console.error(`Error adding deal ${deal.id}:`, error)
          }
        }
      }

      console.log('Deal sync completed')
    } catch (error) {
      console.error('Error syncing deals:', error)
      throw error
    }
  }

  // Full sync process
  async performFullSync(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...')
      return
    }

    this.syncInProgress = true

    try {
      console.log('=== Starting Full Sync Process ===')
      console.log(`Timestamp: ${new Date().toISOString()}`)

      await this.syncCompaniesToBlockchain()
      await this.syncDealsToBlockchain()

      this.lastSyncTimestamp = Date.now()
      console.log('=== Full Sync Completed Successfully ===')

    } catch (error) {
      console.error('Full sync failed:', error)
      throw error
    } finally {
      this.syncInProgress = false
    }
  }

  // Real-time sync with Supabase subscriptions
  setupRealtimeSync(): { companySubscription: any; dealSubscription: any } {
    console.log('Setting up real-time sync...')

    // Listen for company changes
    const companySubscription = this.supabase
      .channel('companies-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'companies' },
        async (payload) => {
          console.log('New company detected:', payload.new)
          try {
            const transformed = this.transformCompanyData(payload.new as Company)
            const tx = await this.contract.addCompany(
              transformed.name,
              transformed.description,
              transformed.sector,
              transformed.stage,
              transformed.valuation
            )
            console.log(`Real-time company sync: ${tx.hash}`)
          } catch (error) {
            console.error('Real-time company sync failed:', error)
          }
        }
      )
      .subscribe()

    // Listen for deal changes
    const dealSubscription = this.supabase
      .channel('deal-flow-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deal_flow' },
        async (payload) => {
          console.log('New deal detected:', payload.new)
          try {
            const transformed = this.transformDealData(payload.new as DealFlow)
            const tx = await this.contract.addDeal(
              transformed.companyId,
              transformed.dealType,
              transformed.amount,
              transformed.status
            )
            console.log(`Real-time deal sync: ${tx.hash}`)
          } catch (error) {
            console.error('Real-time deal sync failed:', error)
          }
        }
      )
      .subscribe()

    return { companySubscription, dealSubscription }
  }

  // Health check
  async healthCheck(): Promise<HealthCheck> {
    try {
      // Check Supabase connection
      const { data: supabaseHealth } = await this.supabase
        .from('companies')
        .select('count')
        .limit(1)

      // Check blockchain connection
      const blockNumber = await this.provider.getBlockNumber()
      const contractCompanyCount = await this.contract.companyCount()

      const health: HealthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        supabase: {
          connected: !!supabaseHealth,
          url: process.env.SUPABASE_URL
        },
        blockchain: {
          connected: blockNumber > 0,
          currentBlock: blockNumber,
          contractAddress: this.contractAddress,
          companiesOnChain: contractCompanyCount.toString()
        },
        sync: {
          lastSync: new Date(this.lastSyncTimestamp).toISOString(),
          inProgress: this.syncInProgress
        }
      }

      console.log('Health Check:', JSON.stringify(health, null, 2))
      return health
    } catch (error) {
      console.error('Health check failed:', error)
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        supabase: { connected: false },
        blockchain: { connected: false },
        sync: {
          lastSync: new Date(this.lastSyncTimestamp).toISOString(),
          inProgress: this.syncInProgress
        }
      }
    }
  }

  // Start the oracle service
  async start(): Promise<void> {
    console.log('🚀 Starting Deal Flow Oracle Service...')

    try {
      // Initial health check
      await this.healthCheck()

      // Perform initial sync
      await this.performFullSync()

      // Setup real-time sync
      this.setupRealtimeSync()

      console.log('✅ Oracle service started successfully')
      console.log('- Real-time sync: Active')
      console.log('- Initial sync: Completed')

    } catch (error) {
      console.error('Failed to start oracle service:', error)
      throw error
    }
  }

  // Stop the oracle service
  async stop(): Promise<void> {
    console.log('Stopping Deal Flow Oracle Service...')
    // Clean up subscriptions if needed
    console.log('Oracle service stopped')
  }
}

export default DealFlowOracle 
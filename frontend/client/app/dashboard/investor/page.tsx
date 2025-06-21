/*eslint-disable*/
"use client"

import { useState, useEffect } from "react"
import { useUser } from "@civic/auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Users, Calendar, BarChart3, Target, Zap, LogOut, User, 
         Database, Activity, CheckCircle, AlertCircle, RefreshCw, Settings, Building } from "lucide-react"

import Portfolio from "@/components/sections/investor/Portfolio"
import Analytics from "@/components/sections/investor/Analytics"
import Preferences from "@/components/sections/investor/Preferences"
import { OracleDashboard } from "@/components/oracle/OracleDashboard"
import Link from "next/link"
import { useOracle } from "@/hooks/useOracle"
import { ethers } from "ethers"
import contractABI from "@/contractABI"
import { useRouter } from "next/navigation"

export default function InvestorDashboard() {
  const { user, signOut } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dealflow")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [investorProfile, setInvestorProfile] = useState<any>(null)
  const [dealFlow, setDealFlow] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [dealFlowLoading, setDealFlowLoading] = useState(false)
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firm_name: "",
    investment_focus: "",
    stage_preference: "",
    sector_preference: "",
    check_size_min: "",
    check_size_max: "",
    portfolio_companies: "",
    total_investments: "",
    bio: "",
    investment_criteria: "",
    contact_email: "",
    website: "",
    linkedin: ""
  })
  const [profileFormLoading, setProfileFormLoading] = useState(false)
  const [profileFormError, setProfileFormError] = useState<string | null>(null)

  // Oracle functionality
  const {
    health,
    isLoading: oracleLoading,
    error: oracleError,
    syncInProgress,
    getHealth,
    performSync,
    syncCompanies,
    syncDeals,
    syncDealFlow,
    syncSpecificDeal
  } = useOracle()

  // Blockchain state
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [blockchainConnected, setBlockchainConnected] = useState(false)
  const [localSyncInProgress, setLocalSyncInProgress] = useState(false)
  const [networkName, setNetworkName] = useState<string>("")
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  
  // Investment modal state
  const [showInvestmentModal, setShowInvestmentModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [investmentNotes, setInvestmentNotes] = useState('')
  const [investmentLoading, setInvestmentLoading] = useState(false)
  
  // Blockchain data state
  const [blockchainCompanies, setBlockchainCompanies] = useState<any[]>([])
  const [blockchainDeals, setBlockchainDeals] = useState<any[]>([])
  const [blockchainStats, setBlockchainStats] = useState({
    totalCompanies: 2,
    totalDeals: 0,
    totalValuation: "0",
    activeDeals: 0
  })

  // Load investor profile and data
  useEffect(() => {
    const loadInvestorData = async () => {
      if (!user?.username) return
      
      setProfileLoading(true)
      try {
        const response = await fetch(`/api/investor/profile?civicId=${user.username}`)
        if (response.ok) {
          const data = await response.json()
          setInvestorProfile(data.profile)
          setDealFlow(data.dealFlow || [])
          setInvestments(data.investments || [])
          
          if (data.profile) {
            setProfileForm({
              firm_name: data.profile.firm_name || "",
              investment_focus: data.profile.investment_focus || "",
              stage_preference: data.profile.stage_preference || "",
              sector_preference: data.profile.sector_preference || "",
              check_size_min: data.profile.check_size_min?.toString() || "",
              check_size_max: data.profile.check_size_max?.toString() || "",
              portfolio_companies: data.profile.portfolio_companies?.toString() || "",
              total_investments: data.profile.total_investments?.toString() || "",
              bio: data.profile.bio || "",
              investment_criteria: data.profile.investment_criteria || "",
              contact_email: data.profile.contact_email || "",
              website: data.profile.website || "",
              linkedin: data.profile.linkedin || ""
            })
          } else {
            setShowProfileModal(true)
          }
        }
      } catch (error) {
        console.error("Error loading investor data:", error)
        setShowProfileModal(true)
      } finally {
        setProfileLoading(false)
      }
    }

    loadInvestorData()
  }, [user?.username])

  // Load companies for deal flow
  useEffect(() => {
    const loadCompanies = async () => {
      setCompaniesLoading(true)
      try {
        const response = await fetch('/api/company')
        if (response.ok) {
          const data = await response.json()
          setCompanies(data.companies || [])
        }
      } catch (error) {
        console.error("Error loading companies:", error)
      } finally {
        setCompaniesLoading(false)
      }
    }

    loadCompanies()
  }, [])

  // Auto-refresh Oracle health status (optional - only if Oracle service is configured)
  useEffect(() => {
    // Only start health checks if Oracle service might be available
    const checkOracle = async () => {
      try {
        await getHealth()
        // If successful, set up regular health checks
        const interval = setInterval(() => {
          getHealth().catch(() => {
            // Silently ignore Oracle errors
            console.log('Oracle service not available')
          })
        }, 60000) // Check every minute

        return () => clearInterval(interval)
      } catch (error) {
        // Oracle service not available, skip health checks
        console.log('Oracle service not configured or available')
      }
    }

    checkOracle()
  }, [getHealth])

  // Initialize blockchain connection
  useEffect(() => {
    initializeBlockchain()
  }, [])

  // Fetch blockchain data when contract is connected
  useEffect(() => {
    if (contract && blockchainConnected && isCorrectNetwork) {
      fetchBlockchainData()
    }
  }, [contract, blockchainConnected, isCorrectNetwork])

  // Function to fetch blockchain companies and deals
  const fetchBlockchainData = async () => {
    if (!contract) return

    try {
      console.log("Fetching blockchain data...")
      
      // Get company count and deal count
      const [companyCount, dealCount] = await Promise.all([
        contract.companyCount(),
        contract.dealCount()
      ])

      console.log(`Found ${companyCount} companies and ${dealCount} deals on blockchain`)

      // Fetch companies from blockchain
      const companies = []
      for (let i = 1; i <= Number(companyCount); i++) {
        try {
          const company = await contract.getCompany(i)
          companies.push({
            id: i,
            name: company.name,
            description: company.description,
            sector: company.sector,
            stage: company.stage,
            valuation: ethers.formatEther(company.valuation),
            isActive: company.isActive,
            timestamp: Number(company.timestamp)
          })
        } catch (error) {
          console.error(`Error fetching company ${i}:`, error)
        }
      }
      setBlockchainCompanies(companies)

      // Fetch deals from blockchain
      const deals = []
      for (let i = 1; i <= Number(dealCount); i++) {
        try {
          const deal = await contract.getDeal(i)
          deals.push({
            id: i,
            companyId: Number(deal.companyId),
            dealType: deal.dealType,
            amount: ethers.formatEther(deal.amount),
            status: deal.status,
            timestamp: Number(deal.timestamp),
            isActive: deal.isActive
          })
        } catch (error) {
          console.error(`Error fetching deal ${i}:`, error)
        }
      }
      setBlockchainDeals(deals)

      // Update stats
      setBlockchainStats({
        totalCompanies: Number(companyCount),
        totalDeals: Number(dealCount),
        totalValuation: "0", // You can calculate this from company valuations
        activeDeals: deals.filter(deal => deal.isActive).length
      })

      console.log("Blockchain data fetched successfully")
    } catch (error) {
      console.error("Error fetching blockchain data:", error)
    }
  }

  const initializeBlockchain = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(web3Provider)

        // Check if we're on Core Blockchain Testnet
        const network = await web3Provider.getNetwork()
        const coreTestnetChainId = BigInt(1115) // Core Blockchain Testnet chain ID
        
        setNetworkName(network.chainId === coreTestnetChainId ? 'Core Blockchain Testnet' : network.name)
        setIsCorrectNetwork(network.chainId === coreTestnetChainId)

        if (network.chainId !== coreTestnetChainId) {
          try {
            // Switch to Core Blockchain Testnet
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x45b' }], // 1115 in hex
            })
          } catch (switchError: any) {
            // If Core Blockchain Testnet is not added to the wallet, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x45b',
                  chainName: 'Core Blockchain Testnet',
                  nativeCurrency: {
                    name: 'Core',
                    symbol: 'tCORE',
                    decimals: 18,
                  },
                  rpcUrls: ['https://core-testnet.drpc.org'],
                  blockExplorerUrls: ['https://scan.test.btcs.network/'],
                }],
              })
            }
          }
        }

        // Request account access
        const accounts = await web3Provider.send("eth_requestAccounts", [])
        setAccount(accounts[0])

        // Initialize contract on Core Blockchain Testnet
        const contractAddress = "0x822b78F04E6e6f2879ACbFb2162Fc4B23b48c896"
        const signer = await web3Provider.getSigner()
        const dealFlowContract = new ethers.Contract(contractAddress, contractABI, signer)
        setContract(dealFlowContract)
        setBlockchainConnected(true)

        console.log('Blockchain connected to Core Blockchain Testnet:', accounts[0])
        console.log('Network:', network.name, 'Chain ID:', network.chainId.toString())
      } else {
        throw new Error('MetaMask not found. Please install MetaMask to use blockchain features.')
      }
    } catch (error) {
      console.error('Failed to connect to Core Blockchain Testnet:', error)
      setBlockchainConnected(false)
      // You might want to show an error message to the user here
    }
  }

  // Function to show investment modal
  const showInvestmentModalForCompany = (company: any) => {
    setSelectedCompany(company)
    setInvestmentAmount('')
    setInvestmentNotes('')
    setShowInvestmentModal(true)
  }

  // Function to add company to deal flow with investment
  const addToDealFlow = async (company: any, investmentData?: any) => {
    if (!user?.username) return

    try {
      const requestBody = {
        civicId: user.username,
        companyId: company.id,
        status: 'new',
        ...investmentData
      }

      const response = await fetch('/api/investor/deal-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const data = await response.json()
        setDealFlow(prev => [{ ...data.deal, company }, ...prev])
        // Remove from companies list or mark as added
        setCompanies(prev => prev.map(c => 
          c.id === company.id ? { ...c, inDealFlow: true } : c
        ))
        return true
      }
      return false
    } catch (error) {
      console.error("Error adding to deal flow:", error)
      return false
    }
  }

  // Function to handle investment submission
  const handleInvestmentSubmit = async () => {
    if (!selectedCompany || !investmentAmount) return

    setInvestmentLoading(true)
    try {
      const investmentData = {
        investment_amount: parseFloat(investmentAmount),
        notes: investmentNotes,
        status: 'interested'
      }

      // Step 1: Fund the company on blockchain first (if connected)
      let blockchainTx = null
      if (blockchainConnected && isCorrectNetwork && contract) {
        try {
          await fundCompanyOnBlockchain(selectedCompany, parseFloat(investmentAmount))
          blockchainTx = true
        } catch (error) {
          console.error("Blockchain funding failed:", error)
          // Continue with database operations even if blockchain fails
        }
      }

      // Step 2: Save to database
      const existingDeal = dealFlow.find(d => d.company?.id === selectedCompany.id)
      
      let success = false
      if (existingDeal && existingDeal.id) {
        // Update existing deal with investment
        success = await updateDealWithInvestment(existingDeal.id, investmentData)
      } else {
        // Add new deal to pipeline
        success = await addToDealFlow(selectedCompany, investmentData) || false
      }
      
      if (success) {
        setShowInvestmentModal(false)
        setSelectedCompany(null)
        setInvestmentAmount('')
        setInvestmentNotes('')
        
        // Refresh blockchain data and mark as synced if blockchain transaction was successful
        if (blockchainTx) {
          setDealFlow(prev => prev.map(deal => 
            deal.company?.id === selectedCompany.id ? { ...deal, onChain: true } : deal
          ))
          // Refresh blockchain data to show new deals
          setTimeout(() => {
            fetchBlockchainData()
          }, 2000) // Wait 2 seconds for blockchain confirmation
        }
      }
    } catch (error) {
      console.error("Error processing investment:", error)
    } finally {
      setInvestmentLoading(false)
    }
  }

  // Function to update existing deal with investment
  const updateDealWithInvestment = async (dealId: string, investmentData: any) => {
    if (!user?.username) return false

    try {
      const response = await fetch(`/api/investor/deal-flow/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          civicId: user.username,
          ...investmentData
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Update deal flow state
        setDealFlow(prev => prev.map(deal => 
          deal.id === dealId ? { ...deal, ...investmentData } : deal
        ))
        return true
      }
      return false
    } catch (error) {
      console.error("Error updating deal:", error)
      return false
    }
  }

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.username) return

    setProfileFormLoading(true)
    setProfileFormError(null)
    
    try {
      const res = await fetch("/api/investor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: user.username,
          ...profileForm,
          check_size_min: parseFloat(profileForm.check_size_min) || null,
          check_size_max: parseFloat(profileForm.check_size_max) || null,
          portfolio_companies: parseInt(profileForm.portfolio_companies) || null,
          total_investments: parseInt(profileForm.total_investments) || null
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setProfileFormError(data.error || "Failed to save profile.")
      } else {
        const data = await res.json()
        setInvestorProfile(data.profile)
        setShowProfileModal(false)
        // Refresh the data instead of full page reload
        const response = await fetch(`/api/investor/profile?civicId=${user.username}`)
        if (response.ok) {
          const data = await response.json()
          setInvestorProfile(data.profile)
          setDealFlow(data.dealFlow || [])
          setInvestments(data.investments || [])
        }
      }
    } catch (e: any) {
      setProfileFormError(e.message || "Failed to save profile.")
    } finally {
      setProfileFormLoading(false)
    }
  }

  // Handle signout
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Function to sync specific deal to blockchain using addDeal function
  const syncDealToBlockchain = async (deal: any) => {
    if (!contract || !blockchainConnected || !isCorrectNetwork) {
      console.error("Blockchain not connected or wrong network. Please connect to Core Blockchain Testnet.")
      return
    }

    try {
      console.log("Syncing deal to blockchain:", deal)
      console.log("Contract address:", "0x822b78F04E6e6f2879ACbFb2162Fc4B23b48c896")

      // First, ensure the company exists on blockchain
      let companyId;
      if (deal.company) {
        try {
          await syncCompanyToBlockchain(deal.company)
          companyId = await contract.companyCount()
        } catch (error) {
          console.log("Using fallback company ID")
          companyId = await contract.companyCount()
        }
      } else {
        companyId = 1 // Default fallback
      }

      // Add deal to blockchain using addDeal function
      const dealAmount = ethers.parseEther((deal.investment_amount || 0).toString())
      
      const tx = await contract.addDeal(
        companyId,
        "Investment",
        dealAmount,
        deal.status || "new",
        { gasLimit: 300000 }
      )

      console.log("Deal sync transaction sent:", tx.hash)
      const receipt = await tx.wait()
      console.log("Deal synced successfully in block:", receipt.blockNumber)

      // Get the deal ID from contract
      const dealId = await contract.dealCount()
      console.log("Deal ID on blockchain:", dealId.toString())

      // Mark the deal as synced
      setDealFlow(prev => prev.map(d => 
        d.id === deal.id ? { ...d, onChain: true } : d
      ))
    } catch (error) {
      console.error("Error syncing deal to blockchain:", error)
    }
  }

  // Function to fund company on blockchain using addDeal function
  const fundCompanyOnBlockchain = async (company: any, investmentAmount: number) => {
    if (!contract || !blockchainConnected || !isCorrectNetwork) {
      console.error("Blockchain not connected or wrong network. Please connect to Core Blockchain Testnet.")
      return
    }

    try {
      console.log("Funding company on blockchain:", company, "Amount:", investmentAmount)
      console.log("Contract address:", "0x822b78F04E6e6f2879ACbFb2162Fc4B23b48c896")

      // Step 1: Ensure company exists on blockchain first by adding it
      let companyId;
      try {
        const addCompanyTx = await contract.addCompany(
          company.name || "Unknown Company",
          company.description || "No description", 
          company.industry || "Technology",
          company.stage || "Early",
          ethers.parseEther((company.valuation || 0).toString()),
          { gasLimit: 300000 }
        )
        
        console.log("Company added to blockchain:", addCompanyTx.hash)
        const companyReceipt = await addCompanyTx.wait()
        
        // Get the company ID from the contract's companyCount
        companyId = await contract.companyCount()
        console.log("Company ID on blockchain:", companyId.toString())
        
      } catch (error) {
        console.log("Company might already exist or error adding:", error)
        // Use current company count as fallback
        companyId = await contract.companyCount()
      }

      // Step 2: Add investment deal using addDeal function (this acts as funding)
      const investmentInWei = ethers.parseEther(investmentAmount.toString())
      
      console.log("Adding investment deal with:", {
        companyId: companyId.toString(),
        dealType: "Investment",
        amount: investmentInWei.toString(),
        status: "funded"
      })

      const dealTx = await contract.addDeal(
        companyId, // Use the actual company ID from blockchain
        "Investment", // Deal type
        investmentInWei, // Investment amount in Wei  
        "funded", // Status indicating this is a funded investment
        { 
          gasLimit: 350000
        }
      )

      console.log("Investment deal transaction sent:", dealTx.hash)
      console.log("Waiting for confirmation...")
      
      const receipt = await dealTx.wait()
      console.log("Investment deal confirmed in block:", receipt.blockNumber)
      console.log("Gas used:", receipt.gasUsed.toString())

      // Get the deal ID from contract
      const dealId = await contract.dealCount()
      console.log("Deal ID on blockchain:", dealId.toString())

      return dealTx
    } catch (error) {
      console.error("Error funding company on blockchain:", error)
      throw error
    }
  }

  // Function to sync company to blockchain using addCompany function
  const syncCompanyToBlockchain = async (company: any) => {
    if (!contract || !blockchainConnected || !isCorrectNetwork) {
      console.error("Blockchain not connected or wrong network. Please connect to Core Blockchain Testnet.")
      return
    }

    try {
      console.log("Syncing company to blockchain:", company)
      console.log("Contract address:", "0x822b78F04E6e6f2879ACbFb2162Fc4B23b48c896")

      const valuation = ethers.parseEther((company.valuation || 0).toString())
      
      const tx = await contract.addCompany(
        company.name || "Unknown Company",
        company.description || "No description",
        company.industry || "Technology",
        company.stage || "Early", 
        valuation,
        { gasLimit: 300000 }
      )

      console.log("Company sync transaction sent:", tx.hash)
      const receipt = await tx.wait()
      console.log("Company synced successfully in block:", receipt.blockNumber)
      
      // Get the company ID from the contract
      const companyId = await contract.companyCount()
      console.log("Company ID on blockchain:", companyId.toString())

      return tx
    } catch (error) {
      console.error("Error syncing company to blockchain:", error)
      throw error
    }
  }

  // Function to sync all companies to blockchain using batchAddCompanies
  const syncAllToBlockchain = async () => {
    if (!contract || !blockchainConnected || !isCorrectNetwork) {
      console.error("Blockchain not connected or wrong network. Please connect to Core Blockchain Testnet.")
      return
    }

    try {
      setLocalSyncInProgress(true)
      console.log("Starting batch sync to blockchain...")
      console.log("Contract address:", "0x822b78F04E6e6f2879ACbFb2162Fc4B23b48c896")

      // Use hardcoded companies data for demo
      const companiesToSync = [
        {
          name: 'TheCompany.com',
          description: 'we are a company that specialises in building sites',
          industry: 'Technology',
          stage: 'Early',
          valuation: 100
        },
        {
          name: 'debayudh and co',
          description: 'debayudh er biscuit company',
          industry: 'kando',
          stage: 'early',
          valuation: 1000000
        }
      ]
      
      if (companiesToSync.length > 0) {
        console.log(`Syncing ${companiesToSync.length} companies using batchAddCompanies...`)

        // Prepare data for batchAddCompanies function
        const names = companiesToSync.map(c => c.name)
        const descriptions = companiesToSync.map(c => c.description)
        const sectors = companiesToSync.map(c => c.industry)
        const stages = companiesToSync.map(c => c.stage)
        const valuations = companiesToSync.map(c => ethers.parseEther(c.valuation.toString()))

        console.log("Batch data:", { names, descriptions, sectors, stages, valuations: valuations.map(v => v.toString()) })

        const tx = await contract.batchAddCompanies(
          names, 
          descriptions, 
          sectors, 
          stages, 
          valuations,
          { gasLimit: 1000000 } // Higher gas limit for batch operation
        )
        
        console.log("Batch sync transaction sent:", tx.hash)
        const receipt = await tx.wait()
        console.log("Batch sync completed in block:", receipt.blockNumber)

        // Get final company count
        const totalCompanies = await contract.companyCount()
        console.log("Total companies on blockchain:", totalCompanies.toString())
      }

      // Sync any pending deals
      const dealsToSync = dealFlow.filter(deal => !deal.onChain)
      for (const deal of dealsToSync) {
        await syncDealToBlockchain(deal)
      }

      console.log("All data synced to blockchain successfully!")
    } catch (error) {
      console.error("Error syncing to blockchain:", error)
    } finally {
      setLocalSyncInProgress(false)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dealflow":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: "#f6f6f6" }}>
                Deal Flow
              </h2>
              <div className="flex items-center space-x-3">
                {/* Blockchain Status Indicators */}
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">Core Blockchain Testnet</span>
                  {account && (
                    <span className="text-xs text-green-300">
                      ({account.slice(0, 6)}...{account.slice(-4)})
                    </span>
                  )}
                </div>
                
                <Button
                  onClick={fetchBlockchainData}
                  disabled={!blockchainConnected || !isCorrectNetwork}
                  className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                
                <Button
                  onClick={syncAllToBlockchain}
                  disabled={!blockchainConnected || !isCorrectNetwork || localSyncInProgress}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  size="sm"
                >
                  <Database className={`h-4 w-4 mr-2 ${localSyncInProgress ? 'animate-spin' : ''}`} />
                  Sync All to Blockchain
                </Button>
                
                <Button
                  onClick={initializeBlockchain}
                  disabled={blockchainConnected && isCorrectNetwork}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                                        Connected to Core Testnet
                </Button>
                
                <Button className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 font-medium">
                  View All Deals
                </Button>
              </div>
            </div>

            {/* Oracle Error Alert */}
            {oracleError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Blockchain Sync Error: {oracleError}
                </AlertDescription>
              </Alert>
            )}

            {/* Network Warning Alert */}
            {blockchainConnected && !isCorrectNetwork && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Wrong Network:</strong> Please switch to Core Blockchain Testnet to sync data to blockchain.
                  Current network: {networkName}
                </AlertDescription>
              </Alert>
            )}

            {/* Wallet Connection Alert */}
            {!blockchainConnected && (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  <strong>Wallet Required:</strong> Connect your MetaMask wallet to Core Blockchain Testnet to sync deals to blockchain.
                </AlertDescription>
              </Alert>
            )}

            {/* Blockchain Status Card */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center" style={{ color: "#ffcb74" }}>
                  <Activity className="h-5 w-5 mr-2" />
                  Blockchain Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Service Status</p>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        healthy
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Companies On-Chain</p>
                    <p className="font-bold text-2xl" style={{ color: "#ffcb74" }}>
                      {blockchainStats.totalCompanies}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Deals On-Chain</p>
                    <p className="font-bold text-2xl" style={{ color: "#ffcb74" }}>
                      {blockchainStats.totalDeals}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Active Deals</p>
                    <p className="font-bold text-2xl" style={{ color: "#4ade80" }}>
                      {blockchainStats.activeDeals}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Companies Overview */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center" style={{ color: "#ffcb74" }}>
                  <Building className="h-5 w-5 mr-2" />
                                     All Companies ({companies.length + blockchainStats.totalCompanies})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {/* Companies on blockchain */}
                  {blockchainCompanies.map((company) => (
                    <div key={company.id} className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-semibold text-white">{company.name}</h4>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            <Database className="h-3 w-3 mr-1" />
                            On-Chain
                          </Badge>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            {company.sector}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => showInvestmentModalForCompany({
                              id: `blockchain-${company.id}`,
                              name: company.name,
                              description: company.description,
                              industry: company.sector,
                              stage: company.stage,
                              valuation: parseFloat(company.valuation)
                            })}
                            className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 font-medium"
                            size="sm"
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Invest in Project
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-3">{company.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Stage</p>
                          <p className="font-medium text-gray-200">{company.stage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Valuation</p>
                          <p className="font-medium" style={{ color: "#ffcb74" }}>
                            {parseFloat(company.valuation) > 0 ? `${parseFloat(company.valuation).toLocaleString()} tCORE` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Blockchain ID</p>
                          <p className="font-medium text-blue-400">#{company.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <p className={`font-medium ${company.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {company.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Off-chain companies from Supabase */}
                  {companies.map((company) => (
                    <div key={company.id} className="border border-gray-500/30 rounded-lg p-4 bg-gray-500/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-semibold text-white">{company.name}</h4>
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Off-Chain
                          </Badge>
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                            {company.industry || 'Technology'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => syncCompanyToBlockchain(company)}
                            disabled={!blockchainConnected || !isCorrectNetwork}
                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                            size="sm"
                          >
                            <Database className="h-4 w-4 mr-1" />
                            Sync to Chain
                          </Button>
                          <Button
                            onClick={() => showInvestmentModalForCompany(company)}
                            className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 font-medium"
                            size="sm"
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Invest in Project
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-3">{company.description || 'No description available'}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Stage</p>
                          <p className="font-medium text-gray-200">{company.stage || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Valuation</p>
                          <p className="font-medium" style={{ color: "#ffcb74" }}>
                            {company.valuation ? `$${company.valuation.toLocaleString()}` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Blockchain ID</p>
                          <p className="font-medium text-gray-400">Pending Sync</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <p className="font-medium text-yellow-400">Needs Sync</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Company Deals Overview */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center" style={{ color: "#ffcb74" }}>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Investment Deals on Blockchain
                </CardTitle>
              </CardHeader>
                             <CardContent>
                 <div className="space-y-4">
                   {blockchainDeals.length > 0 ? (
                     blockchainDeals.map((deal) => {
                       // Find the corresponding company for this deal
                       const company = blockchainCompanies.find(c => c.id === deal.companyId)
                       
                       return (
                         <div key={deal.id} className="border border-green-500/30 rounded-lg p-4 bg-green-500/10">
                           <div className="flex items-center justify-between mb-3">
                             <div className="flex items-center space-x-3">
                               <h4 className="text-lg font-semibold text-white">
                                 {company?.name || `Company #${deal.companyId}`}
                               </h4>
                               <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                 <Database className="h-3 w-3 mr-1" />
                                 Deal #{deal.id}
                               </Badge>
                               <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                 {deal.status}
                               </Badge>
                             </div>
                             <div className="text-right">
                               <p className="text-sm text-gray-400">Investment Amount</p>
                               <p className="text-xl font-bold text-green-400">
                                 {parseFloat(deal.amount).toLocaleString()} tCORE
                               </p>
                             </div>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             <div>
                               <p className="text-sm text-gray-400">Deal Type</p>
                               <p className="font-medium text-gray-200">{deal.dealType}</p>
                             </div>
                             <div>
                               <p className="text-sm text-gray-400">Status</p>
                               <p className="font-medium text-green-400">{deal.status}</p>
                             </div>
                             <div>
                               <p className="text-sm text-gray-400">Company Stage</p>
                               <p className="font-medium text-gray-200">{company?.stage || 'N/A'}</p>
                             </div>
                             <div>
                               <p className="text-sm text-gray-400">Blockchain</p>
                               <p className="font-medium text-blue-400">Core Testnet</p>
                             </div>
                           </div>
                           <div className="mt-3 pt-3 border-t border-gray-600">
                             <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <p className="text-sm text-gray-400">Company Description</p>
                                 <p className="text-gray-300 text-sm">{company?.description || 'N/A'}</p>
                               </div>
                               <div>
                                 <p className="text-sm text-gray-400">Date</p>
                                 <p className="text-gray-300 text-sm">
                                   {deal.timestamp ? new Date(deal.timestamp * 1000).toLocaleDateString() : 'N/A'}
                                 </p>
                               </div>
                             </div>
                           </div>
                         </div>
                       )
                     })
                   ) : (
                     <div className="text-center py-8">
                       <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                       <p className="text-gray-400 text-lg">No investment deals on blockchain yet</p>
                       <p className="text-gray-500 text-sm">Fund companies to see deals appear here</p>
                     </div>
                   )}
                 </div>
               </CardContent>
            </Card>

            {/* Current Deal Flow */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4" style={{ color: "#ffcb74" }}>
                Current Deal Flow (0)
              </h3>
              <div className="grid gap-6">
                {dealFlow.map((deal) => (
                  <Card
                    key={deal.id}
                    className="backdrop-blur-sm border hover:border-opacity-60 transition-all duration-300"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 203, 116, 0.2)",
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl" style={{ color: "#f6f6f6" }}>
                            {deal.company?.name || 'Unknown Company'}
                          </CardTitle>
                          <p className="text-gray-300 mt-1">{deal.company?.description || 'No description available'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`${
                              deal.status === "interested"
                                ? "bg-red-500/20 text-red-400"
                                : deal.status === "new"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {deal.status}
                          </Badge>
                          {/* Blockchain sync indicator */}
                          {deal.onChain && (
                            <Badge className="bg-blue-500/20 text-blue-400">
                              <Database className="h-3 w-3 mr-1" />
                              On-Chain
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Industry</p>
                          <p className="font-medium" style={{ color: "#ffcb74" }}>
                            {deal.company?.industry || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Stage</p>
                          <p className="font-medium text-gray-200">{deal.company?.stage || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Valuation</p>
                          <p className="font-medium text-gray-200">
                            {deal.company?.valuation ? `$${deal.company.valuation.toLocaleString()}` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Investment</p>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium" style={{ color: "#4ade80" }}>
                              {deal.investment_amount ? `$${deal.investment_amount.toLocaleString()}` : 'TBD'}
                            </p>
                            {deal.investment_amount && deal.onChain && (
                              <Badge className="bg-green-500/20 text-green-400 text-xs">
                                Funded
                              </Badge>
                            )}
                            {deal.investment_amount && !deal.onChain && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {deal.notes && (
                        <p className="text-sm text-gray-300 mb-4">Notes: {deal.notes}</p>
                      )}
                      <div className="flex space-x-3">
                        <Button
                          size="sm"
                          className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
                          variant="outline"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        
                        {/* Blockchain Sync Button */}
                        <Button
                          size="sm"
                          onClick={() => syncDealToBlockchain(deal)}
                          disabled={!blockchainConnected || !isCorrectNetwork || localSyncInProgress}
                          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all duration-300"
                        >
                          <Database className={`w-4 h-4 mr-2 ${localSyncInProgress ? 'animate-spin' : ''}`} />
                          {deal.onChain ? 'Re-sync to Core' : 'Sync to Core'}
                        </Button>

                        {!deal.investment_amount && (
                          <Button
                            size="sm"
                            onClick={() => showInvestmentModalForCompany(deal.company)}
                            className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                          >
                            <Target className="w-4 h-4 mr-2" />
                            Fund Project
                          </Button>
                        )}

                        {deal.investment_amount && !deal.onChain && blockchainConnected && isCorrectNetwork && (
                          <Button
                            size="sm"
                            onClick={() => fundCompanyOnBlockchain(deal.company, deal.investment_amount)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-300"
                          >
                            <Target className="w-4 h-4 mr-2" />
                            Fund on Blockchain
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          className="text-white hover:opacity-90 transition-all duration-300"
                          style={{ backgroundColor: "#111111" }}
                        >
                          Schedule Meeting
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {dealFlow.length === 0 && (
                  <Card
                    className="backdrop-blur-sm border text-center py-12"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 203, 116, 0.2)",
                    }}
                  >
                    <CardContent>
                      <p className="text-gray-400">No deals in your pipeline yet. Browse companies below to get started.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Available Companies */}
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: "#ffcb74" }}>
                Available Companies
              </h3>
              {companiesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffcb74]"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {[
                    {
                      id: '1',
                      name: 'TheCompany.com',
                      description: 'we are a company that specialises in building sites',
                      industry: 'Technology',
                      stage: 'Early',
                      valuation: 100,
                      onChain: false
                    },
                    {
                      id: '2', 
                      name: 'debayudh and co',
                      description: 'debayudh er biscuit company',
                      industry: 'kando',
                      stage: 'early',
                      valuation: 1000000,
                      onChain: false
                    }
                  ].map((company) => (
                    <Card
                      key={company.id}
                      className="backdrop-blur-sm border hover:border-opacity-60 transition-all duration-300"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        borderColor: "rgba(255, 203, 116, 0.1)",
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold mb-2" style={{ color: "#f6f6f6" }}>
                              {company.name}
                            </h4>
                            <p className="text-gray-300 text-sm mb-3">{company.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>{company.industry}</span>
                              <span>•</span>
                              <span>{company.stage}</span>
                              <span>•</span>
                              <span>${company.valuation.toLocaleString()}</span>
                            </div>
                          </div>
                          <Button
                            size="lg"
                            onClick={() => showInvestmentModalForCompany(company)}
                            className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 font-semibold px-6 py-2"
                          >
                            Invest in Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                </div>
              )}
            </div>
          </div>
        )
      case "portfolio":
        return <Portfolio />
      case "analytics":
        return <Analytics />
      case "preferences":
        return <Preferences />
      case "oracle":
        return <OracleDashboard />
      default:
        return <div>Select a tab</div>
    }
  }

  return (
    <div className="min-h-screen bg-black" style={{ color: "#f6f6f6" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "rgba(255, 203, 116, 0.2)" }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
                <span style={{ color: "#f6f6f6" }}>Startup</span>
                <span style={{ color: "#ffcb74" }}>Hub</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#f6f6f6" }}>
                  Investor Dashboard
                </h1>
                <p className="text-gray-300">Discover and invest in promising startups</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                className="px-3 py-1"
                style={{
                  backgroundColor: "rgba(255, 203, 116, 0.2)",
                  color: "#ffcb74",
                  border: "1px solid rgba(255, 203, 116, 0.3)",
                }}
              >
                Investor Portal
              </Badge>
              <Link href="/dashboard/investor/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300 mr-2"
                >
                  <User className="w-4 h-4 mr-2" />
                  {investorProfile ? 'View Profile' : 'Create Profile'}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileModal(true)}
                className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300 mr-2"
              >
                <User className="w-4 h-4 mr-2" />
                Quick Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Navigation */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setActiveTab("dealflow")}
                  className={`w-full flex items-center justify-start px-3 py-2 rounded-md transition-all duration-300 ${
                    activeTab === "dealflow"
                      ? "bg-[#ffcb74] text-black"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Deal Flow
                </button>
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className={`w-full flex items-center justify-start px-3 py-2 rounded-md transition-all duration-300 ${
                    activeTab === "portfolio"
                      ? "bg-[#ffcb74] text-black"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Portfolio
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center justify-start px-3 py-2 rounded-md transition-all duration-300 ${
                    activeTab === "analytics"
                      ? "bg-[#ffcb74] text-black"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`w-full flex items-center justify-start px-3 py-2 rounded-md transition-all duration-300 ${
                    activeTab === "preferences"
                      ? "bg-[#ffcb74] text-black"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Preferences
                </button>
                <button
                  onClick={() => setActiveTab("oracle")}
                  className={`w-full flex items-center justify-start px-3 py-2 rounded-md transition-all duration-300 ${
                    activeTab === "oracle"
                      ? "bg-[#ffcb74] text-black"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Oracle Dashboard
                </button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">New Deals</span>
                  <span className="font-bold text-xl" style={{ color: "#ffcb74" }}>
                    0
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Total Pipeline</span>
                  <span className="font-bold text-xl" style={{ color: "#ffcb74" }}>
                    0
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Companies Available</span>
                  <span className="font-bold text-xl" style={{ color: "#ffcb74" }}>
                    2
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">On-Chain Companies</span>
                  <span className="font-bold text-xl" style={{ color: "#4ade80" }}>
                    2
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Investments</span>
                  <span className="font-bold text-xl" style={{ color: "#ffcb74" }}>
                    0
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Investor Profile */}
            {investorProfile && (
              <Card
                className="backdrop-blur-sm border"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 203, 116, 0.2)",
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Firm</p>
                    <p className="font-medium text-gray-200">{investorProfile.firm_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Focus</p>
                    <p className="font-medium text-gray-200">{investorProfile.investment_focus || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Check Size</p>
                    <p className="font-medium text-gray-200">
                      ${investorProfile.check_size_min?.toLocaleString() || '0'} - ${investorProfile.check_size_max?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Portfolio</p>
                    <p className="font-medium" style={{ color: "#ffcb74" }}>
                      {investorProfile.portfolio_companies || 0} companies
                    </p>
                  </div>
                  {investorProfile.stage_preference && (
                    <div>
                      <p className="text-sm text-gray-400">Stage Preference</p>
                      <p className="font-medium text-gray-200">{investorProfile.stage_preference}</p>
                    </div>
                  )}
                  {investorProfile.location && (
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="font-medium text-gray-200">{investorProfile.location}</p>
                    </div>
                  )}
                  {investorProfile.aum && (
                    <div>
                      <p className="text-sm text-gray-400">AUM</p>
                      <p className="font-medium" style={{ color: "#4ade80" }}>
                        ${investorProfile.aum?.toLocaleString() || '0'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Trending Sectors */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                  Trending Sectors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { sector: "AI/ML", growth: "+15%", color: "#4ade80" },
                    { sector: "Climate Tech", growth: "+12%", color: "#4ade80" },
                    { sector: "Web3", growth: "-5%", color: "#ef4444" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{item.sector}</span>
                      <span className="text-sm font-medium" style={{ color: item.color }}>
                        {item.growth}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 mt-1" style={{ color: "#3b82f6" }} />
                    <div>
                      <div className="text-sm font-medium text-gray-200">FlowAI Pitch</div>
                      <div className="text-xs text-gray-400">Tomorrow, 2:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 mt-1" style={{ color: "#8b5cf6" }} />
                    <div>
                      <div className="text-sm font-medium text-gray-200">VC Meetup</div>
                      <div className="text-xs text-gray-400">Friday, 6:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 mt-1" style={{ color: "#10b981" }} />
                    <div>
                      <div className="text-sm font-medium text-gray-200">Portfolio Review</div>
                      <div className="text-xs text-gray-400">Next Monday</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center text-lg" style={{ color: "#ffcb74" }}>
                  <Zap className="mr-2 h-4 w-4" style={{ color: "#fbbf24" }} />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}>
                    <div className="text-sm font-medium mb-1" style={{ color: "#fbbf24" }}>
                      High Potential Deal
                    </div>
                    <div className="text-xs text-gray-300">FlowAI matches 95% of your criteria</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
                    <div className="text-sm font-medium mb-1" style={{ color: "#3b82f6" }}>
                      Market Trend
                    </div>
                    <div className="text-xs text-gray-300">AI/ML startups seeing 20% valuation increase</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">{renderContent()}</div>
        </div>
      </div>

      {/* Investor Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {investorProfile ? 'Edit Investor Profile' : 'Create Investor Profile'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firm_name">Firm Name *</Label>
                <Input 
                  name="firm_name" 
                  value={profileForm.firm_name} 
                  onChange={handleProfileFormChange} 
                  required 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="investment_focus">Investment Focus</Label>
                <Input 
                  name="investment_focus" 
                  value={profileForm.investment_focus} 
                  onChange={handleProfileFormChange} 
                  placeholder="e.g., SaaS, FinTech"
                  className="mt-1" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stage_preference">Stage Preference</Label>
                <Input 
                  name="stage_preference" 
                  value={profileForm.stage_preference} 
                  onChange={handleProfileFormChange} 
                  placeholder="e.g., Seed, Series A"
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="sector_preference">Sector Preference</Label>
                <Input 
                  name="sector_preference" 
                  value={profileForm.sector_preference} 
                  onChange={handleProfileFormChange} 
                  placeholder="e.g., B2B, B2C"
                  className="mt-1" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="check_size_min">Min Check Size ($)</Label>
                <Input 
                  name="check_size_min" 
                  type="number"
                  value={profileForm.check_size_min} 
                  onChange={handleProfileFormChange} 
                  placeholder="50000"
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="check_size_max">Max Check Size ($)</Label>
                <Input 
                  name="check_size_max" 
                  type="number"
                  value={profileForm.check_size_max} 
                  onChange={handleProfileFormChange} 
                  placeholder="1000000"
                  className="mt-1" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="portfolio_companies">Portfolio Companies</Label>
                <Input 
                  name="portfolio_companies" 
                  type="number"
                  value={profileForm.portfolio_companies} 
                  onChange={handleProfileFormChange} 
                  placeholder="15"
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="total_investments">Total Investments</Label>
                <Input 
                  name="total_investments" 
                  type="number"
                  value={profileForm.total_investments} 
                  onChange={handleProfileFormChange} 
                  placeholder="50"
                  className="mt-1" 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                name="bio" 
                value={profileForm.bio} 
                onChange={handleProfileFormChange} 
                placeholder="Tell us about your investment philosophy and experience..."
                className="mt-1" 
              />
            </div>

            <div>
              <Label htmlFor="investment_criteria">Investment Criteria</Label>
              <Textarea 
                name="investment_criteria" 
                value={profileForm.investment_criteria} 
                onChange={handleProfileFormChange} 
                placeholder="What criteria do you use when evaluating startups?"
                className="mt-1" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input 
                  name="contact_email" 
                  type="email"
                  value={profileForm.contact_email} 
                  onChange={handleProfileFormChange} 
                  placeholder="investor@firm.com"
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input 
                  name="website" 
                  value={profileForm.website} 
                  onChange={handleProfileFormChange} 
                  placeholder="https://yourfirm.com"
                  className="mt-1" 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input 
                name="linkedin" 
                value={profileForm.linkedin} 
                onChange={handleProfileFormChange} 
                placeholder="https://linkedin.com/in/yourprofile"
                className="mt-1" 
              />
            </div>

            {profileFormError && (
              <div className="text-red-400 text-sm">{profileFormError}</div>
            )}

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={profileFormLoading} 
                className="bg-[#ffcb74] text-black hover:bg-[#ffcb74]/80"
              >
                {profileFormLoading ? "Saving..." : "Save Profile"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Investment Modal */}
      <Dialog open={showInvestmentModal} onOpenChange={setShowInvestmentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invest in {selectedCompany?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">{selectedCompany?.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedCompany?.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{selectedCompany?.industry}</span>
                <span>•</span>
                <span>{selectedCompany?.stage}</span>
                {selectedCompany?.valuation && (
                  <>
                    <span>•</span>
                    <span>${selectedCompany.valuation.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="investment_amount">Investment Amount ($)</Label>
              <Input
                id="investment_amount"
                type="number"
                placeholder="e.g., 50000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="investment_notes">Investment Notes (Optional)</Label>
              <Textarea
                id="investment_notes"
                placeholder="Any specific terms, conditions, or notes about this investment..."
                value={investmentNotes}
                onChange={(e) => setInvestmentNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            {blockchainConnected && isCorrectNetwork && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                                            Investment will be recorded on Core Blockchain
                  </span>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  • Company will be added to blockchain if not already present<br/>
                  • Investment deal will be created with funding status<br/>
                  • Transaction will be permanently recorded on-chain
                </div>
              </div>
            )}

            {!blockchainConnected && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700">
                    Connect wallet to fund on blockchain
                  </span>
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  Investment will be saved to database only. Connect MetaMask to record on blockchain.
                </div>
              </div>
            )}

            {blockchainConnected && !isCorrectNetwork && (
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">
                                            Wrong network - switch to Core Blockchain Testnet
                  </span>
                </div>
                <div className="text-xs text-red-600 mt-1">
                                        Currently on {networkName}. Switch to Core Blockchain Testnet to fund on blockchain.
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleInvestmentSubmit}
              disabled={!investmentAmount || investmentLoading}
              className="bg-[#ffcb74] text-black hover:bg-[#ffcb74]/80"
            >
              {investmentLoading 
                ? 'Processing...' 
                : blockchainConnected && isCorrectNetwork 
                  ? 'Fund on Blockchain & Add to Pipeline'
                  : 'Add to Pipeline & Save Investment'
              }
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

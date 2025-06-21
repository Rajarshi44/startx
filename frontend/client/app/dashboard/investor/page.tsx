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
         Database, Activity, CheckCircle, AlertCircle, RefreshCw, Settings } from "lucide-react"

import Portfolio from "@/components/sections/investor/Portfolio"
import Analytics from "@/components/sections/investor/Analytics"
import Preferences from "@/components/sections/investor/Preferences"
import { OracleDashboard } from "@/components/oracle/OracleDashboard"
import Link from "next/link"
import { useOracle } from "@/hooks/useOracle"
import { ethers } from "ethers"
import contractABI from "@/contractABI"

export default function InvestorDashboard() {
  const { user } = useUser()
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

  const initializeBlockchain = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(web3Provider)

        // Check if we're on Sepolia testnet
        const network = await web3Provider.getNetwork()
        const sepoliaChainId = BigInt(11155111) // Sepolia testnet chain ID
        
        setNetworkName(network.name)
        setIsCorrectNetwork(network.chainId === sepoliaChainId)

        if (network.chainId !== sepoliaChainId) {
          try {
            // Switch to Sepolia testnet
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xAA36A7' }], // 11155111 in hex
            })
          } catch (switchError: any) {
            // If Sepolia is not added to the wallet, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xAA36A7',
                  chainName: 'Sepolia Testnet',
                  nativeCurrency: {
                    name: 'SepoliaETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://ethereum-sepolia.publicnode.com'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                }],
              })
            }
          }
        }

        // Request account access
        const accounts = await web3Provider.send("eth_requestAccounts", [])
        setAccount(accounts[0])

        // Initialize contract on Sepolia testnet
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x1234567890abcdef1234567890abcdef12345678"
        const signer = await web3Provider.getSigner()
        const dealFlowContract = new ethers.Contract(contractAddress, contractABI, signer)
        setContract(dealFlowContract)
        setBlockchainConnected(true)

        console.log('Blockchain connected to Sepolia testnet:', accounts[0])
        console.log('Network:', network.name, 'Chain ID:', network.chainId.toString())
      } else {
        throw new Error('MetaMask not found. Please install MetaMask to use blockchain features.')
      }
    } catch (error) {
      console.error('Failed to connect to Sepolia testnet:', error)
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

      // Check if company is already in deal flow
      const existingDeal = dealFlow.find(d => d.company?.id === selectedCompany.id)
      
      let success = false
      if (existingDeal && existingDeal.id) {
        // Update existing deal with investment
        success = await updateDealWithInvestment(existingDeal.id, investmentData)
      } else {
        // Add new deal to pipeline
        success = await addToDealFlow(selectedCompany, investmentData)
      }
      
      if (success) {
        setShowInvestmentModal(false)
        setSelectedCompany(null)
        setInvestmentAmount('')
        setInvestmentNotes('')
        
        // If blockchain is connected, automatically sync to blockchain
        if (blockchainConnected && isCorrectNetwork) {
          const deal = dealFlow.find(d => d.company?.id === selectedCompany.id)
          if (deal) {
            await syncDealToBlockchain(deal)
          }
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
      }
    } catch (e: any) {
      setProfileFormError(e.message || "Failed to save profile.")
    } finally {
      setProfileFormLoading(false)
    }
  }

  // Function to sync specific deal to blockchain
  const syncDealToBlockchain = async (deal: any) => {
    if (!contract || !blockchainConnected || !isCorrectNetwork) {
      console.error("Blockchain not connected or wrong network. Please connect to Sepolia testnet.")
      return
    }

    try {
      console.log("Syncing deal to blockchain:", deal)

      // First, ensure the company exists on blockchain
      if (deal.company) {
        await syncCompanyToBlockchain(deal.company)
      }

      // Add deal to blockchain
      const dealAmount = ethers.parseEther((deal.investment_amount || 0).toString())
      
      const tx = await contract.addDeal(
        1, // Company ID on blockchain (you might need to map this properly)
        "Investment",
        dealAmount,
        deal.status || "new"
      )

      console.log("Deal sync transaction:", tx.hash)
      await tx.wait()
      console.log("Deal synced successfully!")

      // Mark the deal as synced
      setDealFlow(prev => prev.map(d => 
        d.id === deal.id ? { ...d, onChain: true } : d
      ))
    } catch (error) {
      console.error("Error syncing deal to blockchain:", error)
    }
  }

  // Function to sync company to blockchain
  const syncCompanyToBlockchain = async (company: any) => {
    if (!contract || !blockchainConnected || !isCorrectNetwork) {
      console.error("Blockchain not connected or wrong network. Please connect to Sepolia testnet.")
      return
    }

    try {
      console.log("Syncing company to blockchain:", company)

      const valuation = ethers.parseEther((company.valuation || 0).toString())
      
      const tx = await contract.addCompany(
        company.name || "Unknown Company",
        company.description || "No description",
        company.industry || "Technology",
        company.stage || "Early",
        valuation
      )

      console.log("Company sync transaction:", tx.hash)
      await tx.wait()
      console.log("Company synced successfully!")

      return tx
    } catch (error) {
      console.error("Error syncing company to blockchain:", error)
      throw error
    }
  }

  // Function to sync all companies to blockchain
  const syncAllToBlockchain = async () => {
    if (!contract || !blockchainConnected || !isCorrectNetwork) {
      console.error("Blockchain not connected or wrong network. Please connect to Sepolia testnet.")
      return
    }

    try {
      setLocalSyncInProgress(true)
      console.log("Starting batch sync to blockchain...")

      // Get all companies that need to be synced
      const companiesToSync = companies.filter(company => !company.onChain)
      
      if (companiesToSync.length > 0) {
        console.log(`Syncing ${companiesToSync.length} companies...`)

        // Use batch sync for efficiency
        const names = companiesToSync.map(c => c.name || "Unknown Company")
        const descriptions = companiesToSync.map(c => c.description || "No description")
        const sectors = companiesToSync.map(c => c.industry || "Technology")
        const stages = companiesToSync.map(c => c.stage || "Early")
        const valuations = companiesToSync.map(c => ethers.parseEther((c.valuation || 0).toString()))

        const tx = await contract.batchAddCompanies(names, descriptions, sectors, stages, valuations)
        console.log("Batch sync transaction:", tx.hash)
        await tx.wait()
        console.log("Batch sync completed!")

        // Mark companies as synced
        setCompanies(prev => prev.map(c => 
          companiesToSync.find(cs => cs.id === c.id) ? { ...c, onChain: true } : c
        ))
      }

      // Sync deal flow
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
                {/* Oracle Status Indicator */}
                                  <div className="flex items-center space-x-2">
                    <span className={blockchainConnected && isCorrectNetwork ? 'text-green-400' : 'text-red-400'}>
                      {blockchainConnected && isCorrectNetwork ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </span>
                    <span className="text-sm text-gray-400">
                      {blockchainConnected 
                        ? (isCorrectNetwork 
                          ? `Sepolia Testnet` 
                          : `Wrong Network: ${networkName}`)
                        : 'Disconnected'
                      }
                    </span>
                    {account && (
                      <span className="text-xs text-gray-500">
                        ({account.slice(0, 6)}...{account.slice(-4)})
                      </span>
                    )}
                  </div>
                
                <Button
                  onClick={syncAllToBlockchain}
                  disabled={!blockchainConnected || !isCorrectNetwork || localSyncInProgress}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  size="sm"
                >
                  <Database className={`h-4 w-4 mr-2 ${localSyncInProgress ? 'animate-spin' : ''}`} />
                  {localSyncInProgress ? 'Syncing...' : 'Sync All to Blockchain'}
                </Button>
                
                <Button
                  onClick={initializeBlockchain}
                  disabled={blockchainConnected && isCorrectNetwork}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {blockchainConnected && isCorrectNetwork 
                    ? 'Connected to Sepolia' 
                    : blockchainConnected 
                      ? 'Switch to Sepolia'
                      : 'Connect Wallet'
                  }
                </Button>
                
                <Button className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300">
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
                  <strong>Wrong Network:</strong> Please switch to Sepolia testnet to sync data to blockchain.
                  Current network: {networkName}
                </AlertDescription>
              </Alert>
            )}

            {/* Wallet Connection Alert */}
            {!blockchainConnected && (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  <strong>Wallet Required:</strong> Connect your MetaMask wallet to Sepolia testnet to sync deals to blockchain.
                </AlertDescription>
              </Alert>
            )}

            {/* Blockchain Status Card */}
            {health && (
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
                        <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                          {health.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Companies On-Chain</p>
                      <p className="font-medium text-xl" style={{ color: "#ffcb74" }}>
                        {health.blockchain.companiesOnChain || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Current Block</p>
                      <p className="font-medium text-gray-200">
                        {health.blockchain.currentBlock || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Last Sync</p>
                      <p className="font-medium text-sm text-gray-200">
                        {new Date(health.sync.lastSync).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Deal Flow */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4" style={{ color: "#ffcb74" }}>
                Current Deal Flow ({dealFlow.length})
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
                          <p className="font-medium" style={{ color: "#4ade80" }}>
                            {deal.investment_amount ? `$${deal.investment_amount.toLocaleString()}` : 'TBD'}
                          </p>
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
                          {deal.onChain ? 'Re-sync to Sepolia' : 'Sync to Sepolia'}
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
                  {companies.filter(company => !company.inDealFlow).map((company) => (
                    <Card
                      key={company.id}
                      className="backdrop-blur-sm border hover:border-opacity-60 transition-all duration-300"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        borderColor: "rgba(255, 203, 116, 0.1)",
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold" style={{ color: "#f6f6f6" }}>
                              {company.name}
                            </h4>
                            <p className="text-gray-300 text-sm mt-1">{company.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                              <span>{company.industry}</span>
                              <span>•</span>
                              <span>{company.stage}</span>
                              {company.valuation && (
                                <>
                                  <span>•</span>
                                  <span>${company.valuation.toLocaleString()}</span>
                                </>
                              )}
                              {/* Show if company is on blockchain */}
                              {company.onChain && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-400">On-Chain</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => showInvestmentModalForCompany(company)}
                            className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300"
                          >
                            Invest in Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {companies.filter(company => !company.inDealFlow).length === 0 && (
                    <Card
                      className="backdrop-blur-sm border text-center py-8"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderColor: "rgba(255, 203, 116, 0.2)",
                      }}
                    >
                      <CardContent>
                        <p className="text-gray-400">No new companies available at the moment.</p>
                      </CardContent>
                    </Card>
                  )}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileModal(true)}
                className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300 mr-2"
              >
                <User className="w-4 h-4 mr-2" />
                {investorProfile ? 'Edit Profile' : 'Create Profile'}
              </Button>
              <Button
                variant="outline"
                size="sm"
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
                  <span className="font-semibold" style={{ color: "#ffcb74" }}>
                    {dealFlow.filter(deal => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(deal.created_at) >= weekAgo
                    }).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Total Pipeline</span>
                  <span className="font-semibold" style={{ color: "#ffcb74" }}>
                    {dealFlow.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Companies Available</span>
                  <span className="font-semibold" style={{ color: "#ffcb74" }}>
                    {companies.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">On-Chain Companies</span>
                  <span className="font-semibold" style={{ color: "#4ade80" }}>
                    {health?.blockchain.companiesOnChain || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Investments</span>
                  <span className="font-semibold" style={{ color: "#ffcb74" }}>
                    {investments.length}
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
                    <p className="font-medium text-gray-200">{investorProfile.firm_name}</p>
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
                    Will be automatically synced to Sepolia blockchain
                  </span>
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
              {investmentLoading ? 'Processing...' : 'Add to Pipeline & Invest'}
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

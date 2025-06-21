import { useState, useCallback } from 'react'
import { HealthCheck, OracleResponse, OracleActionRequest, SyncOptions } from '@/types/oracle'

interface UseOracleReturn {
  health: HealthCheck | null
  isLoading: boolean
  error: string | null
  syncInProgress: boolean
  
  // Methods
  getHealth: () => Promise<HealthCheck | null>
  getStatus: () => Promise<OracleResponse | null>
  performSync: (options?: SyncOptions) => Promise<boolean>
  syncCompanies: (options?: SyncOptions) => Promise<boolean>
  syncDeals: (options?: SyncOptions) => Promise<boolean>
  syncSpecificDeal: (dealId: string | number) => Promise<boolean>
  syncSpecificCompany: (companyId: string | number) => Promise<boolean>
  syncDealFlow: () => Promise<boolean>
  startOracle: () => Promise<boolean>
  stopOracle: () => Promise<boolean>
  setupRealtimeSync: () => Promise<boolean>
}

export function useOracle(): UseOracleReturn {
  const [health, setHealth] = useState<HealthCheck | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncInProgress, setSyncInProgress] = useState(false)

  const handleApiCall = useCallback(async (
    url: string,
    options?: RequestInit
  ): Promise<any> => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'API request failed')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Oracle API error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getHealth = useCallback(async (): Promise<HealthCheck | null> => {
    const response = await handleApiCall('/api/oracle?action=health')
    if (response?.health) {
      setHealth(response.health)
      setSyncInProgress(response.health.sync.inProgress)
      return response.health
    }
    return null
  }, [handleApiCall])

  const getStatus = useCallback(async (): Promise<OracleResponse | null> => {
    return await handleApiCall('/api/oracle?action=status')
  }, [handleApiCall])

  const performAction = useCallback(async (
    action: OracleActionRequest['action'],
    options?: SyncOptions,
    additionalData?: Record<string, any>
  ): Promise<boolean> => {
    const response = await handleApiCall('/api/oracle', {
      method: 'POST',
      body: JSON.stringify({ action, options, ...additionalData }),
    })

    if (response) {
      // Update health after successful operation
      if (action === 'start' || action === 'sync' || action === 'health') {
        await getHealth()
      }
      return true
    }
    return false
  }, [handleApiCall, getHealth])

  const performSync = useCallback(async (options?: SyncOptions): Promise<boolean> => {
    setSyncInProgress(true)
    try {
      return await performAction('sync', options)
    } finally {
      setSyncInProgress(false)
    }
  }, [performAction])

  const syncCompanies = useCallback(async (options?: SyncOptions): Promise<boolean> => {
    setSyncInProgress(true)
    try {
      return await performAction('sync-companies', options)
    } finally {
      setSyncInProgress(false)
    }
  }, [performAction])

  const syncDeals = useCallback(async (options?: SyncOptions): Promise<boolean> => {
    setSyncInProgress(true)
    try {
      return await performAction('sync-deals', options)
    } finally {
      setSyncInProgress(false)
    }
  }, [performAction])

  const syncSpecificDeal = useCallback(async (dealId: string | number): Promise<boolean> => {
    setSyncInProgress(true)
    try {
      return await performAction('sync-deals', undefined, { dealIds: [dealId] })
    } finally {
      setSyncInProgress(false)
    }
  }, [performAction])

  const syncSpecificCompany = useCallback(async (companyId: string | number): Promise<boolean> => {
    setSyncInProgress(true)
    try {
      return await performAction('sync-companies', undefined, { companyIds: [companyId] })
    } finally {
      setSyncInProgress(false)
    }
  }, [performAction])

  const syncDealFlow = useCallback(async (): Promise<boolean> => {
    setSyncInProgress(true)
    try {
      return await performAction('sync-deal-flow')
    } finally {
      setSyncInProgress(false)
    }
  }, [performAction])

  const startOracle = useCallback(async (): Promise<boolean> => {
    return await performAction('start')
  }, [performAction])

  const stopOracle = useCallback(async (): Promise<boolean> => {
    const success = await performAction('stop')
    if (success) {
      setHealth(null)
      setSyncInProgress(false)
    }
    return success
  }, [performAction])

  const setupRealtimeSync = useCallback(async (): Promise<boolean> => {
    const response = await handleApiCall('/api/oracle', {
      method: 'PUT',
      body: JSON.stringify({ action: 'setup-realtime' }),
    })
    return !!response
  }, [handleApiCall])

  return {
    health,
    isLoading,
    error,
    syncInProgress,
    
    // Methods
    getHealth,
    getStatus,
    performSync,
    syncCompanies,
    syncDeals,
    syncSpecificDeal,
    syncSpecificCompany,
    syncDealFlow,
    startOracle,
    stopOracle,
    setupRealtimeSync,
  }
} 
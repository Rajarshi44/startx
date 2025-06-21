/*eslint-disable*/
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useOracle } from '@/hooks/useOracle'
import { HealthCheck } from '@/types/oracle'
import { 
  RefreshCw, 
  Database, 
  Zap, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Square,
  Building,
  Briefcase
} from 'lucide-react'

export function OracleDashboard() {
  const {
    health,
    isLoading,
    error,
    syncInProgress,
    getHealth,
    performSync,
    syncCompanies,
    syncDeals,
    startOracle,
    stopOracle,
    setupRealtimeSync
  } = useOracle()

  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh health status
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        getHealth()
      }, 30000) // Refresh every 30 seconds

      // Initial fetch
      getHealth()

      return () => clearInterval(interval)
    }
  }, [autoRefresh, getHealth])

  const getStatusColor = (status: HealthCheck['status']) => {
    return status === 'healthy' ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (status: HealthCheck['status']) => {
    return status === 'healthy' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Oracle Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and control the DealFlow Oracle blockchain sync service
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => getHealth()}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health && (
                <>
                  <span className={getStatusColor(health.status)}>
                    {getStatusIcon(health.status)}
                  </span>
                  <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                    {health.status}
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supabase</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health && (
                <>
                  <span className={health.supabase.connected ? 'text-green-600' : 'text-red-600'}>
                    {health.supabase.connected ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  </span>
                  <Badge variant={health.supabase.connected ? 'default' : 'destructive'}>
                    {health.supabase.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health && (
                <>
                  <span className={health.blockchain.connected ? 'text-green-600' : 'text-red-600'}>
                    {health.blockchain.connected ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  </span>
                  <Badge variant={health.blockchain.connected ? 'default' : 'destructive'}>
                    {health.blockchain.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </>
              )}
            </div>
            {health?.blockchain.currentBlock && (
              <p className="text-xs text-muted-foreground mt-1">
                Block: {health.blockchain.currentBlock}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies On-Chain</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health?.blockchain.companiesOnChain || '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Information */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
            <CardDescription>Current synchronization information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Sync:</span>
              <span className="text-sm text-muted-foreground">
                {formatTimestamp(health.sync.lastSync)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sync In Progress:</span>
              <Badge variant={health.sync.inProgress ? 'default' : 'secondary'}>
                {health.sync.inProgress ? 'Yes' : 'No'}
              </Badge>
            </div>

            {health.blockchain.contractAddress && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contract Address:</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {health.blockchain.contractAddress}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Control Buttons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={startOracle}
              disabled={isLoading}
              className="w-full"
              variant="default"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Oracle
            </Button>
            
            <Button
              onClick={stopOracle}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Oracle
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Synchronization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => performSync()}
              disabled={isLoading || syncInProgress}
              className="w-full"
              variant="default"
            >
              <Building className={`h-4 w-4 mr-2 ${syncInProgress ? 'animate-spin' : ''}`} />
              Full Sync
            </Button>
            
            <Button
              onClick={() => syncCompanies()}
              disabled={isLoading || syncInProgress}
              className="w-full"
              variant="outline"
            >
              <Building className="h-4 w-4 mr-2" />
              Sync Companies
            </Button>
            
            <Button
              onClick={() => syncDeals()}
              disabled={isLoading || syncInProgress}
              className="w-full"
              variant="outline"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Sync Deals
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real-time Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={setupRealtimeSync}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Zap className="h-4 w-4 mr-2" />
              Setup Real-time Sync
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Status</CardTitle>
            <CardDescription>Raw health check data</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(health, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
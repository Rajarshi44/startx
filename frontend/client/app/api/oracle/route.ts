/*eslint-disable*/
import { NextRequest, NextResponse } from "next/server"
import DealFlowOracle from "@/services/dealFlowOracle"

// Singleton oracle instance
let oracleInstance: DealFlowOracle | null = null

// Initialize oracle instance
function getOracle(): DealFlowOracle {
  if (!oracleInstance) {
    oracleInstance = new DealFlowOracle()
  }
  return oracleInstance
}

// GET - Health check and status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    const oracle = getOracle()

    switch (action) {
      case "health":
        const health = await oracle.healthCheck()
        return NextResponse.json({ health })

      case "status":
        return NextResponse.json({ 
          status: "Oracle service available",
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({ 
          message: "Oracle API",
          endpoints: {
            "GET ?action=health": "Get health status",
            "GET ?action=status": "Get service status",
            "POST": "Control oracle operations (sync, start, stop)"
          }
        })
    }
  } catch (error) {
    console.error("Oracle API GET error:", error)
    return NextResponse.json(
      { error: "Failed to process request", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// POST - Oracle operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, options, dealIds, companyIds } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    const oracle = getOracle()

    switch (action) {
      case "sync":
        await oracle.performFullSync()
        return NextResponse.json({ 
          message: "Full sync completed successfully",
          timestamp: new Date().toISOString()
        })

      case "sync-companies":
        // For now, sync all companies regardless of specific IDs
        // TODO: Implement specific company syncing in DealFlowOracle service
        await oracle.syncCompaniesToBlockchain()
        return NextResponse.json({ 
          message: companyIds ? `Specific companies sync completed successfully` : "Company sync completed successfully",
          timestamp: new Date().toISOString()
        })

      case "sync-deals":
        // For now, sync all deals regardless of specific IDs
        // TODO: Implement specific deal syncing in DealFlowOracle service
        await oracle.syncDealsToBlockchain()
        return NextResponse.json({ 
          message: dealIds ? `Specific deals sync completed successfully` : "Deal sync completed successfully",
          timestamp: new Date().toISOString()
        })

      case "sync-deal-flow":
        // Sync deals from deal flow - use existing method for now
        await oracle.syncDealsToBlockchain()
        return NextResponse.json({ 
          message: "Deal flow sync completed successfully",
          timestamp: new Date().toISOString()
        })

      case "start":
        await oracle.start()
        return NextResponse.json({ 
          message: "Oracle service started successfully",
          timestamp: new Date().toISOString()
        })

      case "stop":
        await oracle.stop()
        oracleInstance = null // Reset instance
        return NextResponse.json({ 
          message: "Oracle service stopped successfully",
          timestamp: new Date().toISOString()
        })

      case "health":
        const health = await oracle.healthCheck()
        return NextResponse.json({ health })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Oracle API POST error:", error)
    return NextResponse.json(
      { 
        error: "Failed to execute oracle operation", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// PUT - Update oracle configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    const oracle = getOracle()

    switch (action) {
      case "setup-realtime":
        const subscriptions = oracle.setupRealtimeSync()
        return NextResponse.json({ 
          message: "Real-time sync setup completed",
          subscriptions: {
            companies: !!subscriptions.companySubscription,
            deals: !!subscriptions.dealSubscription
          },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Oracle API PUT error:", error)
    return NextResponse.json(
      { 
        error: "Failed to update oracle configuration", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 
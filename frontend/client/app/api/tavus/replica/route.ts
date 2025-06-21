import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { tavusClient } from "@/lib/tavus"

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { personaId, replicaName, civicId } = body

    if (!personaId || !civicId) {
      return NextResponse.json(
        {
          error: "personaId and civicId are required",
        },
        { status: 400 },
      )
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Verify user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("civic_id", civicId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create replica with Tavus
    const replica = await tavusClient.createReplica(personaId, replicaName)

    return NextResponse.json({ replica })
  } catch (error) {
    console.error("Tavus replica creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create replica",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const replicaId = searchParams.get("replicaId")
    const personaId = searchParams.get("personaId")
    const civicId = searchParams.get("civicId")

    if (!civicId) {
      return NextResponse.json(
        {
          error: "civicId is required",
        },
        { status: 400 },
      )
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Verify user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("civic_id", civicId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (replicaId) {
      // Get specific replica
      const replica = await tavusClient.getReplica(replicaId)
      return NextResponse.json({ replica })
    } else {
      // Get replicas (optionally filtered by personaId)
      const replicas = await tavusClient.getReplicas(personaId || undefined)
      return NextResponse.json({ replicas })
    }
  } catch (error) {
    console.error("Tavus replica retrieval error:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve replica(s)",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { replicaId, updates, civicId } = body

    if (!replicaId || !updates || !civicId) {
      return NextResponse.json(
        {
          error: "replicaId, updates, and civicId are required",
        },
        { status: 400 },
      )
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Verify user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("civic_id", civicId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update replica with Tavus
    const replica = await tavusClient.updateReplica(replicaId, updates)

    return NextResponse.json({ replica })
  } catch (error) {
    console.error("Tavus replica update error:", error)
    return NextResponse.json(
      {
        error: "Failed to update replica",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const replicaId = searchParams.get("replicaId")
    const civicId = searchParams.get("civicId")

    if (!replicaId || !civicId) {
      return NextResponse.json(
        {
          error: "replicaId and civicId are required",
        },
        { status: 400 },
      )
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Verify user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("civic_id", civicId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete replica with Tavus
    await tavusClient.deleteReplica(replicaId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Tavus replica deletion error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete replica",
      },
      { status: 500 },
    )
  }
} 
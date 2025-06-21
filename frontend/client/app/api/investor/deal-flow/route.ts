import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const civicId = searchParams.get("civicId")
    const status = searchParams.get("status")

    if (!civicId) {
      return NextResponse.json({ error: "civicId is required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("civic_id", civicId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let query = supabase
      .from("deal_flow")
      .select(`
        *,
        company:companies(
          id,
          name,
          description,
          industry,
          stage,
          valuation,
          sector,
          user:users!companies_user_id_fkey(
            name,
            email
          )
        )
      `)
      .eq("investor_id", user.id)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: dealFlow, error: dealFlowError } = await query
      .order("created_at", { ascending: false })

    if (dealFlowError) {
      console.error("Deal flow fetch error:", dealFlowError)
      return NextResponse.json({ error: "Failed to fetch deal flow" }, { status: 500 })
    }

    return NextResponse.json({ dealFlow })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { civicId, companyId, status, investment_amount, valuation, notes, meetingScheduled } = body

    if (!civicId || !companyId) {
      return NextResponse.json({ error: "civicId and companyId are required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("civic_id", civicId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create or update deal flow entry
    const { data: deal, error: dealError } = await supabase
      .from("deal_flow")
      .upsert({
        investor_id: user.id,
        company_id: companyId,
        status: status || 'new',
        investment_amount: investment_amount,
        valuation,
        notes,
        meeting_scheduled: meetingScheduled
      })
      .select(`
        *,
        company:companies(
          id,
          name,
          description,
          industry,
          stage,
          valuation
        )
      `)
      .single()

    if (dealError) {
      console.error("Deal creation error:", dealError)
      return NextResponse.json({ error: "Failed to create deal" }, { status: 500 })
    }

    return NextResponse.json({ deal })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealId, status, investment_amount, valuation, notes, meetingScheduled } = body

    if (!dealId) {
      return NextResponse.json({ error: "dealId is required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Update deal flow entry
    const { data: deal, error: dealError } = await supabase
      .from("deal_flow")
      .update({
        status,
        investment_amount: investment_amount,
        valuation,
        notes,
        meeting_scheduled: meetingScheduled
      })
      .eq("id", dealId)
      .select(`
        *,
        company:companies(
          id,
          name,
          description,
          industry,
          stage,
          valuation
        )
      `)
      .single()

    if (dealError) {
      console.error("Deal update error:", dealError)
      return NextResponse.json({ error: "Failed to update deal" }, { status: 500 })
    }

    return NextResponse.json({ deal })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const civicId = searchParams.get("civicId")

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

    // Get investor profile
    const { data: profile, error: profileError } = await supabase
      .from("investor_profiles")
      .select(`
        *,
        user:users!inner(
          id,
          civic_id,
          email,
          name,
          active_roles
        )
      `)
      .eq("user_id", user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Profile fetch error:", profileError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    // Get deal flow
    const { data: dealFlow, error: dealFlowError } = await supabase
      .from("deal_flow")
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
      .eq("investor_id", user.id)
      .order("created_at", { ascending: false })

    if (dealFlowError) {
      console.error("Deal flow fetch error:", dealFlowError)
    }

    // Get investments
    const { data: investments, error: investmentsError } = await supabase
      .from("investments")
      .select(`
        *,
        company:companies(
          id,
          name,
          description,
          industry,
          stage
        )
      `)
      .eq("investor_id", user.id)
      .order("investment_date", { ascending: false })

    if (investmentsError) {
      console.error("Investments fetch error:", investmentsError)
    }

    return NextResponse.json({
      profile: profile || null,
      dealFlow: dealFlow || [],
      investments: investments || []
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { civicId, ...profileData } = body

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

    // Upsert investor profile
    const { data: profile, error: profileError } = await supabase
      .from("investor_profiles")
      .upsert({
        user_id: user.id,
        ...profileData
      })
      .select()
      .single()

    if (profileError) {
      console.error("Profile upsert error:", profileError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")
    const industry = searchParams.get("industry")
    const stage = searchParams.get("stage")
    const minInvestment = searchParams.get("minInvestment")
    const maxInvestment = searchParams.get("maxInvestment")

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Build query
    let query = supabase
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
      .limit(limit)
      .range(offset, offset + limit - 1)

    // Apply filters
    if (industry) {
      query = query.contains("preferred_industries", [industry])
    }
    if (stage) {
      query = query.contains("preferred_stages", [stage])
    }
    if (minInvestment) {
      query = query.gte("min_investment", parseInt(minInvestment))
    }
    if (maxInvestment) {
      query = query.lte("max_investment", parseInt(maxInvestment))
    }

    const { data: investors, error: investorsError } = await query

    if (investorsError) {
      console.error("Investors fetch error:", investorsError)
      return NextResponse.json({ error: "Failed to fetch investors" }, { status: 500 })
    }

    return NextResponse.json({ investors: investors || [] })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
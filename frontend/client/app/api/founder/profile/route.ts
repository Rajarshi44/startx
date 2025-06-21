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

    // First get the user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("civic_id", civicId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get founder profile with related data
    const { data: profile, error: profileError } = await supabase
      .from("founder_profiles")
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

    // Get companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)

    if (companiesError) {
      console.error("Companies fetch error:", companiesError)
    }

    // Get idea validations
    const { data: validations, error: validationsError } = await supabase
      .from("idea_validations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (validationsError) {
      console.error("Validations fetch error:", validationsError)
    }

    return NextResponse.json({
      profile: profile || null,
      companies: companies || [],
      validations: validations || []
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

    // Upsert founder profile
    const { data: profile, error: profileError } = await supabase
      .from("founder_profiles")
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
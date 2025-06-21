import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { civicId, companyId, ideaText, validationResult, score, perplexityResponse } = body

    if (!civicId || !ideaText) {
      return NextResponse.json({ error: "civicId and ideaText are required" }, { status: 400 })
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

    // Save idea validation
    const { data: validation, error: validationError } = await supabase
      .from("idea_validations")
      .insert({
        user_id: user.id,
        company_id: companyId || null,
        idea_text: ideaText,
        validation_result: validationResult,
        score: score,
        perplexity_response: perplexityResponse
      })
      .select()
      .single()

    if (validationError) {
      console.error("Validation save error:", validationError)
      return NextResponse.json({ error: "Failed to save validation" }, { status: 500 })
    }

    return NextResponse.json({ validation })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Get validations
    const { data: validations, error: validationsError } = await supabase
      .from("idea_validations")
      .select(`
        *,
        company:companies(name, id)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (validationsError) {
      console.error("Validations fetch error:", validationsError)
      return NextResponse.json({ error: "Failed to fetch validations" }, { status: 500 })
    }

    return NextResponse.json({ validations })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
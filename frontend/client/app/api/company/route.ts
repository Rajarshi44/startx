import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const civicId = searchParams.get("civicId")
    const companyId = searchParams.get("companyId")

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    if (companyId) {
      // Get specific company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select(`
          *,
          user:users!companies_user_id_fkey(
            id,
            civic_id,
            name,
            email
          ),
          job_postings(
            id,
            title,
            status,
            created_at
          ),
          idea_validations(
            id,
            score,
            created_at
          )
        `)
        .eq("id", companyId)
        .single()

      if (companyError) {
        console.error("Company fetch error:", companyError)
        return NextResponse.json({ error: "Company not found" }, { status: 404 })
      }

      return NextResponse.json({ company })
    }

    if (civicId) {
      // Get user's companies
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("civic_id", civicId)
        .single()

      if (userError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select(`
          *,
          job_postings(
            id,
            title,
            status
          ),
          idea_validations(
            id,
            score
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (companiesError) {
        console.error("Companies fetch error:", companiesError)
        return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 })
      }

      return NextResponse.json({ companies })
    }

    // Get all companies (public view)
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select(`
        *,
        user:users!companies_user_id_fkey(
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (companiesError) {
      console.error("All companies fetch error:", companiesError)
      return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 })
    }

    return NextResponse.json({ companies })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { civicId, name, description, industry, stage, level, valuation, match, sector } = body

    if (!civicId || !name) {
      return NextResponse.json({ 
        error: "civicId and name are required" 
      }, { status: 400 })
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

    // Create company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        user_id: user.id,
        name,
        description,
        industry,
        stage,
        level,
        valuation: valuation ? parseFloat(valuation) : null,
        match: match ? parseFloat(match) : null,
        sector
      })
      .select()
      .single()

    if (companyError) {
      console.error("Company creation error:", companyError)
      return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
    }

    return NextResponse.json({ company })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { civicId, companyId, ...updateData } = body

    if (!civicId || !companyId) {
      return NextResponse.json({ 
        error: "civicId and companyId are required" 
      }, { status: 400 })
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

    // Verify user owns the company
    const { data: company, error: companyCheckError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .eq("user_id", user.id)
      .single()

    if (companyCheckError || !company) {
      return NextResponse.json({ 
        error: "Company not found or user doesn't have permission" 
      }, { status: 403 })
    }

    // Process update data
    const processedUpdateData = {
      ...updateData,
      valuation: updateData.valuation ? parseFloat(updateData.valuation) : undefined,
      match: updateData.match ? parseFloat(updateData.match) : undefined
    }

    // Update company
    const { data: updatedCompany, error: updateError } = await supabase
      .from("companies")
      .update(processedUpdateData)
      .eq("id", companyId)
      .select()
      .single()

    if (updateError) {
      console.error("Company update error:", updateError)
      return NextResponse.json({ error: "Failed to update company" }, { status: 500 })
    }

    return NextResponse.json({ company: updatedCompany })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const civicId = searchParams.get("civicId")
    const companyId = searchParams.get("companyId")

    if (!civicId || !companyId) {
      return NextResponse.json({ 
        error: "civicId and companyId are required" 
      }, { status: 400 })
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

    // Verify user owns the company
    const { data: company, error: companyCheckError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .eq("user_id", user.id)
      .single()

    if (companyCheckError || !company) {
      return NextResponse.json({ 
        error: "Company not found or user doesn't have permission" 
      }, { status: 403 })
    }

    // Delete company (cascade will handle related data)
    const { error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", companyId)

    if (deleteError) {
      console.error("Company deletion error:", deleteError)
      return NextResponse.json({ error: "Failed to delete company" }, { status: 500 })
    }

    return NextResponse.json({ message: "Company deleted successfully" })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
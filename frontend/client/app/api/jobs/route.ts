/*eslint-disable*/
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const civicId = searchParams.get("civicId")
    const companyId = searchParams.get("companyId")
    const status = searchParams.get("status") || "active"
    const skills = searchParams.get("skills")
    const jobType = searchParams.get("jobType")
    const workMode = searchParams.get("workMode")
    const location = searchParams.get("location")

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    let query = supabase
      .from("job_postings")
      .select(`
        *,
        company:companies(
          id,
          name,
          description,
          industry,
          stage,
          user:users!companies_user_id_fkey(
            name,
            email
          )
        )
      `)
      .eq("status", status)

    // Filter by company if provided
    if (companyId) {
      query = query.eq("company_id", companyId)
    }

    // Filter by user's companies if civicId provided
    if (civicId && !companyId) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("civic_id", civicId)
        .single()

      if (userError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Get user's companies
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)

      if (companiesError) {
        console.error("Companies fetch error:", companiesError)
      } else if (companies && companies.length > 0) {
        const companyIds = companies.map((c: any) => c.id)
        query = query.in("company_id", companyIds)
      }
    }

    // Apply filters
    if (jobType) {
      query = query.eq("job_type", jobType)
    }

    if (workMode) {
      query = query.eq("work_mode", workMode)
    }

    if (location) {
      query = query.ilike("location", `%${location}%`)
    }

    if (skills) {
      const skillsArray = skills.split(",").map(s => s.trim())
      query = query.overlaps("skills_required", skillsArray)
    }

    const { data: jobs, error: jobsError } = await query
      .order("created_at", { ascending: false })

    if (jobsError) {
      console.error("Jobs fetch error:", jobsError)
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      civicId, 
      companyId, 
      title, 
      description, 
      requirements, 
      skillsRequired, 
      experienceLevel, 
      jobType, 
      workMode, 
      salaryRange, 
      location 
    } = body

    if (!civicId || !companyId || !title) {
      return NextResponse.json({ 
        error: "civicId, companyId, and title are required" 
      }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Verify user owns the company
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("civic_id", civicId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .eq("user_id", user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ 
        error: "Company not found or user doesn't have permission" 
      }, { status: 403 })
    }

    // Create job posting
    const { data: job, error: jobError } = await supabase
      .from("job_postings")
      .insert({
        company_id: companyId,
        title,
        description,
        requirements: requirements || [],
        skills_required: skillsRequired || [],
        experience_level: experienceLevel,
        job_type: jobType,
        work_mode: workMode,
        salary_range: salaryRange,
        location,
        status: 'active'
      })
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
      .single()

    if (jobError) {
      console.error("Job creation error:", jobError)
      return NextResponse.json({ error: "Failed to create job posting" }, { status: 500 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
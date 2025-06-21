import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobPostingId = searchParams.get("jobPostingId")
    const status = searchParams.get("status")

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Build query to get all applications
    let query = supabase.from("job_applications").select(`
        *,
        job_posting:job_postings(*, company:companies(*)),
        jobseeker:users(id, name, email, jobseeker_profile:jobseeker_profiles(*))
      `)

    // Filter by specific job posting if provided
    if (jobPostingId && jobPostingId !== "all") {
      query = query.eq("job_posting_id", jobPostingId)
    }

    // Filter by status if provided
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: applications, error: applicationsError } = await query.order("applied_at", { ascending: false })

    if (applicationsError) {
      console.error("Applications fetch error:", applicationsError)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    return NextResponse.json({ applications: applications || [] })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, status, notes } = body

    if (!applicationId || !status) {
      return NextResponse.json({ 
        error: "applicationId and status are required" 
      }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['applied', 'interview', 'accepted', 'rejected', 'waitlist']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: "Invalid status. Must be one of: applied, interview, accepted, rejected, waitlist" 
      }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Update application status without permission checks
    const updateData: any = { status }
    if (notes) {
      updateData.notes = notes
    }

    const { data: updatedApplication, error: updateError } = await supabase
      .from("job_applications")
      .update(updateData)
      .eq("id", applicationId)
      .select(
        `
        *,
        job_posting:job_postings(*, company:companies(*)),
        jobseeker:users(id, name, email, jobseeker_profile:jobseeker_profiles(*))
      `
      )
      .single()

    if (updateError) {
      console.error("Application update error:", updateError)
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
    }

    return NextResponse.json({ application: updatedApplication })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
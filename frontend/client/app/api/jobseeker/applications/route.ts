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
      .from("job_applications")
      .select(`
        *,
        job_posting:job_postings(
          id,
          title,
          description,
          job_type,
          work_mode,
          salary_range,
          location,
          skills_required,
          experience_level,
          status,
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
        )
      `)
      .eq("jobseeker_id", user.id)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: applications, error: applicationsError } = await query
      .order("applied_at", { ascending: false })

    if (applicationsError) {
      console.error("Applications fetch error:", applicationsError)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { civicId, jobPostingId, coverLetter } = body

    if (!civicId || !jobPostingId) {
      return NextResponse.json({ 
        error: "civicId and jobPostingId are required" 
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

    // Check if job posting exists and is active
    const { data: jobPosting, error: jobError } = await supabase
      .from("job_postings")
      .select("id, status")
      .eq("id", jobPostingId)
      .single()

    if (jobError || !jobPosting) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 })
    }

    if (jobPosting.status !== 'active') {
      return NextResponse.json({ error: "Job posting is not active" }, { status: 400 })
    }

    // Check if user already applied
    const { data: existingApplication, error: existingError } = await supabase
      .from("job_applications")
      .select("id")
      .eq("jobseeker_id", user.id)
      .eq("job_posting_id", jobPostingId)
      .single()

    if (existingApplication) {
      return NextResponse.json({ 
        error: "You have already applied to this job" 
      }, { status: 400 })
    }

    // Create application
    const { data: application, error: applicationError } = await supabase
      .from("job_applications")
      .insert({
        jobseeker_id: user.id,
        job_posting_id: jobPostingId,
        cover_letter: coverLetter,
        status: 'applied'
      })
      .select(`
        *,
        job_posting:job_postings(
          id,
          title,
          description,
          job_type,
          work_mode,
          salary_range,
          location,
          company:companies(
            id,
            name,
            industry
          )
        )
      `)
      .single()

    if (applicationError) {
      console.error("Application creation error:", applicationError)
      return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, status, civicId } = body

    if (!applicationId || !status) {
      return NextResponse.json({ 
        error: "applicationId and status are required" 
      }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Verify the application belongs to the user or the company owner
    if (civicId) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("civic_id", civicId)
        .single()

      if (userError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Check if user can update this application
      const { data: application, error: applicationCheckError } = await supabase
        .from("job_applications")
        .select(`
          id,
          jobseeker_id,
          job_posting:job_postings(
            company:companies(
              user_id
            )
          )
        `)
        .eq("id", applicationId)
        .single()

      if (applicationCheckError || !application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
      }

      const canUpdate = 
        application.jobseeker_id === user.id || 
        (application.job_posting as any)?.company?.user_id === user.id

      if (!canUpdate) {
        return NextResponse.json({ 
          error: "You don't have permission to update this application" 
        }, { status: 403 })
      }
    }

    // Update application status
    const { data: updatedApplication, error: updateError } = await supabase
      .from("job_applications")
      .update({ status })
      .eq("id", applicationId)
      .select(`
        *,
        job_posting:job_postings(
          id,
          title,
          description,
          job_type,
          work_mode,
          salary_range,
          location,
          company:companies(
            id,
            name,
            industry
          )
        )
      `)
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
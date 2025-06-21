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

    // Get jobseeker profile
    const { data: profile, error: profileError } = await supabase
      .from("jobseeker_profiles")
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

    // Get job applications
    const { data: applications, error: applicationsError } = await supabase
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
          company:companies(
            id,
            name,
            industry
          )
        )
      `)
      .eq("jobseeker_id", user.id)
      .order("applied_at", { ascending: false })

    if (applicationsError) {
      console.error("Applications fetch error:", applicationsError)
    }

    return NextResponse.json({
      profile: profile || null,
      applications: applications || []
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

    // Process the profile data
    const processedData = {
      user_id: user.id,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      phone: profileData.phone,
      city: profileData.city,
      country: profileData.country || 'India',
      date_of_birth: profileData.dateOfBirth,
      gender: profileData.gender,
      languages: profileData.languages || ['English'],
      profile_picture_url: profileData.profilePictureUrl,
      current_status: profileData.currentStatus,
      experience_level: profileData.experience,
      education_level: profileData.education,
      university: profileData.university,
      graduation_year: profileData.graduationYear ? parseInt(profileData.graduationYear) : null,
      skills: profileData.skills || [],
      resume_url: profileData.resumeUrl,
      portfolio_url: profileData.portfolio,
      linkedin_url: profileData.linkedIn,
      github_url: profileData.github,
      interests: profileData.interests || [],
      career_goals: profileData.careerGoals || [],
      job_types: profileData.jobTypes || [],
      work_modes: profileData.workModes || [],
      salary_expectation: profileData.salaryExpectation,
      availability: profileData.availability,
      willing_to_relocate: profileData.relocate === 'Yes',
      bio: profileData.bio,
      achievements: profileData.achievements || [],
      certifications: profileData.certifications || []
    }

    // Upsert jobseeker profile
    const { data: profile, error: profileError } = await supabase
      .from("jobseeker_profiles")
      .upsert(processedData)
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { civicId, ...updateData } = body

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

    // Update jobseeker profile
    const { data: profile, error: profileError } = await supabase
      .from("jobseeker_profiles")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single()

    if (profileError) {
      console.error("Profile update error:", profileError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
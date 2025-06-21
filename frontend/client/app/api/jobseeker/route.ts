import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")
    const skills = searchParams.get("skills")
    const experience = searchParams.get("experience")
    const location = searchParams.get("location")

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Build query
    let query = supabase
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
      .limit(limit)
      .range(offset, offset + limit - 1)

    // Apply filters
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim())
      query = query.overlaps("skills", skillsArray)
    }
    if (experience) {
      query = query.eq("experience_level", experience)
    }
    if (location) {
      query = query.or(`city.ilike.%${location}%,country.ilike.%${location}%`)
    }

    const { data: jobseekers, error: jobseekersError } = await query

    if (jobseekersError) {
      console.error("Job seekers fetch error:", jobseekersError)
      return NextResponse.json({ error: "Failed to fetch job seekers" }, { status: 500 })
    }

    return NextResponse.json({ jobseekers: jobseekers || [] })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
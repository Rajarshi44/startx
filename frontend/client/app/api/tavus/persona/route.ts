import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { tavusClient } from "@/lib/tavus"

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { jobPostingId, civicId } = body

    if (!jobPostingId || !civicId) {
      return NextResponse.json(
        {
          error: "jobPostingId and civicId are required",
        },
        { status: 400 },
      )
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Verify user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("civic_id", civicId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get job posting details
    const { data: jobPosting, error: jobError } = await supabase
      .from("job_postings")
      .select(`
        *,
        company:companies(
          id,
          name,
          description,
          industry
        )
      `)
      .eq("id", jobPostingId)
      .single()

    if (jobError || !jobPosting) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 })
    }

    const stockPersonaId = process.env.TAVUS_STOCK_PERSONA_ID
    if (!stockPersonaId) {
      console.error("TAVUS_STOCK_PERSONA_ID environment variable not set.")
      return NextResponse.json({ error: "Stock persona not configured." }, { status: 500 })
    }

    // Get the stock persona
    const persona = await tavusClient.getPersona(stockPersonaId)

    // Create a new replica from the stock persona for this interview
    const replica = await tavusClient.createReplica(stockPersonaId, `Interview Replica - ${jobPosting.title}`)

    return NextResponse.json({
      persona,
      replica,
      jobPosting: {
        id: jobPosting.id,
        title: jobPosting.title,
        company: jobPosting.company?.name,
        description: jobPosting.description,
      },
    })
  } catch (error) {
    console.error("Tavus persona creation error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      jobPostingId: body?.jobPostingId,
      civicId: body?.civicId
    })
    return NextResponse.json(
      {
        error: "Failed to create interview persona",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const personaId = searchParams.get("personaId")
    const civicId = searchParams.get("civicId")

    if (!civicId) {
      return NextResponse.json(
        {
          error: "civicId is required",
        },
        { status: 400 },
      )
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Verify user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("civic_id", civicId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (personaId) {
      // Get specific persona
      const persona = await tavusClient.getPersona(personaId)
      return NextResponse.json({ persona })
    } else {
      // Get all personas
      const personas = await tavusClient.getPersonas()
      return NextResponse.json({ personas })
    }
  } catch (error) {
    console.error("Tavus persona retrieval error:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve persona(s)",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { personaId, updates, civicId } = body

    if (!personaId || !updates || !civicId) {
      return NextResponse.json(
        {
          error: "personaId, updates, and civicId are required",
        },
        { status: 400 },
      )
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Verify user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("civic_id", civicId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update persona with Tavus
    const persona = await tavusClient.updatePersona(personaId, updates)

    return NextResponse.json({ persona })
  } catch (error) {
    console.error("Tavus persona update error:", error)
    return NextResponse.json(
      {
        error: "Failed to update persona",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const personaId = searchParams.get("personaId")
    const civicId = searchParams.get("civicId")

    if (!personaId || !civicId) {
      return NextResponse.json(
        {
          error: "personaId and civicId are required",
        },
        { status: 400 },
      )
    }

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Verify user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("civic_id", civicId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete persona with Tavus
    await tavusClient.deletePersona(personaId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Tavus persona deletion error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete persona",
      },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { tavusClient } from "@/lib/tavus"

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { personaId, civicId, jobPostingId, conversationName, replicaId } = body

    console.log("Conversation creation request:", { personaId, civicId, jobPostingId, conversationName, replicaId })

    if (!personaId || !civicId || !jobPostingId) {
      return NextResponse.json(
        {
          error: "personaId, civicId, and jobPostingId are required",
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

    // Create conversation with Tavus
    let finalReplicaId = body.replicaId
    
    // If no replicaId provided, try to get one for the persona
    if (!finalReplicaId) {
      try {
        const replicas = await tavusClient.getReplicas(personaId)
        if (replicas && replicas.length > 0) {
          finalReplicaId = replicas[0].replica_id
        } else {
          // Create a new replica if none exist
          const newReplica = await tavusClient.createReplica(personaId, "Default Interview Replica")
          finalReplicaId = newReplica.replica_id
        }
      } catch (error) {
        console.error("Failed to get or create replica:", error)
        return NextResponse.json(
          {
            error: "Failed to get or create replica for conversation",
          },
          { status: 500 },
        )
      }
    }

    const conversationConfig = {
      replica_id: finalReplicaId,
      persona_id: personaId,
      conversation_name: conversationName || `Interview - ${new Date().toISOString()}`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tavus/webhook`,
      conversational_context: "You are conducting a job interview. Be professional, friendly, and thorough in your questioning.",
      custom_greeting: "Hello! I'm excited to interview you today. Let's get started!",
      properties: {
        max_call_duration: 1800, // 30 minutes
        participant_left_timeout: 60,
        participant_absent_timeout: 120,
        enable_recording: true,
        enable_closed_captions: true,
        apply_greenscreen: false,
        language: "english",
      },
    }

    console.log("Creating conversation with config:", JSON.stringify(conversationConfig, null, 2))

    const conversation = await tavusClient.createConversation(conversationConfig)

    // Create interview session record
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .insert({
        user_id: user.id,
        role: "jobseeker",
        agent_id: personaId,
        stream_id: conversation.conversation_id,
        status: "active",
        total_questions: 8,
        job_posting_id: jobPostingId,
      })
      .select()
      .single()

    if (sessionError) {
      console.error("Session creation error:", sessionError)
      return NextResponse.json(
        {
          error: "Failed to create interview session",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      conversation,
      session,
      conversationUrl: conversation.conversation_url,
    })
  } catch (error) {
    console.error("Tavus conversation creation error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      personaId: body?.personaId,
      civicId: body?.civicId,
      jobPostingId: body?.jobPostingId,
      replicaId: body?.replicaId
    })
    return NextResponse.json(
      {
        error: "Failed to create interview conversation",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const civicId = searchParams.get("civicId")

    if (!conversationId || !civicId) {
      return NextResponse.json(
        {
          error: "conversationId and civicId are required",
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

    // Get conversation status from Tavus
    const conversation = await tavusClient.getConversation(conversationId)

    // Update local session status
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("stream_id", conversationId)
      .eq("user_id", user.id)
      .single()

    if (session && conversation.status === "ended" && session.status === "active") {
      // Get transcript if available
      let transcript = null
      try {
        transcript = await tavusClient.getConversationTranscript(conversationId)
      } catch (error) {
        console.log("Transcript not yet available:", error)
      }

      // Update session as completed
      await supabase
        .from("interview_sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          transcript: transcript ? JSON.stringify(transcript) : null,
        })
        .eq("id", session.id)
    }

    return NextResponse.json({
      conversation,
      session,
    })
  } catch (error) {
    console.error("Tavus conversation status error:", error)
    return NextResponse.json(
      {
        error: "Failed to get conversation status",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const civicId = searchParams.get("civicId")

    if (!conversationId || !civicId) {
      return NextResponse.json(
        {
          error: "conversationId and civicId are required",
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

    // End conversation with Tavus
    await tavusClient.endConversation(conversationId)

    // Update local session status
    await supabase
      .from("interview_sessions")
      .update({
        status: "cancelled",
        completed_at: new Date().toISOString(),
      })
      .eq("stream_id", conversationId)
      .eq("user_id", user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Tavus conversation end error:", error)
    return NextResponse.json(
      {
        error: "Failed to end conversation",
      },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { tavusClient } from "@/lib/tavus"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversation_id, event_type, data } = body

    console.log("Tavus webhook received:", { conversation_id, event_type, data })

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Find the interview session
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("stream_id", conversation_id)
      .single()

    if (sessionError || !session) {
      console.error("Session not found for conversation:", conversation_id)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    switch (event_type) {
      case "conversation_started":
        await supabase.from("interview_sessions").update({ status: "active" }).eq("id", session.id)
        break

      case "conversation_ended":
        // Get transcript
        let transcript = null
        let analysis = null

        try {
          transcript = await tavusClient.getConversationTranscript(conversation_id)

          // Simple analysis based on transcript
          if (transcript && transcript.messages) {
            const totalMessages = transcript.messages.length
            const candidateMessages = transcript.messages.filter((m: any) => m.speaker === "participant").length
            const interviewerMessages = transcript.messages.filter((m: any) => m.speaker === "bot").length

            analysis = {
              total_messages: totalMessages,
              candidate_responses: candidateMessages,
              interviewer_questions: interviewerMessages,
              engagement_score: Math.min(10, Math.round((candidateMessages / Math.max(interviewerMessages, 1)) * 10)),
              duration_minutes: Math.round((new Date().getTime() - new Date(session.created_at).getTime()) / 60000),
            }
          }
        } catch (error) {
          console.error("Error getting transcript:", error)
        }

        await supabase
          .from("interview_sessions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            transcript: transcript ? JSON.stringify(transcript) : null,
            analysis: analysis ? JSON.stringify(analysis) : null,
            score: analysis?.engagement_score || null,
            questions_asked: analysis?.interviewer_questions || session.questions_asked,
          })
          .eq("id", session.id)
        break

      case "conversation_failed":
        await supabase
          .from("interview_sessions")
          .update({
            status: "cancelled",
            completed_at: new Date().toISOString(),
          })
          .eq("id", session.id)
        break

      default:
        console.log("Unhandled webhook event:", event_type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Tavus webhook error:", error)
    return NextResponse.json(
      {
        error: "Webhook processing failed",
      },
      { status: 500 },
    )
  }
}

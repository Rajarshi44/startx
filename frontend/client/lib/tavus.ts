// Tavus AI SDK integration
export interface TavusConversationConfig {
  replica_id: string
  persona_id: string
  conversation_name: string
  callback_url?: string
  conversational_context?: string
  custom_greeting?: string
  properties?: {
    max_call_duration?: number
    participant_left_timeout?: number
    participant_absent_timeout?: number
    enable_recording?: boolean
    enable_closed_captions?: boolean
    apply_greenscreen?: boolean
    language?: string
    recording_s3_bucket_name?: string
    recording_s3_bucket_region?: string
    aws_assume_role_arn?: string
  }
}

export interface TavusConversation {
  conversation_id: string
  conversation_url: string
  status: "active" | "ended" | "failed"
  created_at: string
}

export interface TavusPersona {
  persona_id: string
  persona_name: string
  system_prompt: string
  pipeline_mode?: "full" | "basic"
  context?: string
  default_replica_id?: string
  layers?: {
    llm?: {
      model?: string
      base_url?: string
      api_key?: string
      tools?: Array<{
        type: "function"
        function: {
          name: string
          description: string
          parameters: {
            type: "object"
            properties: Record<string, any>
            required: string[]
          }
        }
      }>
      headers?: Record<string, string>
      extra_body?: Record<string, any>
    }
    tts?: {
      api_key?: string
      tts_engine?: string
      external_voice_id?: string
      voice_settings?: {
        speed?: string
        emotion?: string[]
      }
      playht_user_id?: string
      tts_emotion_control?: string
      tts_model_name?: string
    }
    perception?: {
      perception_model?: string
      ambient_awareness_queries?: string[]
      perception_tool_prompt?: string
      perception_tools?: Array<{
        type: "function"
        function: {
          name: string
          description: string
          parameters: {
            type: "object"
            properties: Record<string, any>
            required: string[]
          }
        }
      }>
    }
    stt?: {
      stt_engine?: string
      participant_pause_sensitivity?: string
      participant_interrupt_sensitivity?: string
      hotwords?: string
      smart_turn_detection?: boolean
    }
  }
}

export interface TavusReplica {
  replica_id: string
  persona_id: string
  replica_name: string
  status: "active" | "inactive"
  created_at: string
}

class TavusClient {
  private apiKey: string
  private baseUrl = "https://tavusapi.com"

  constructor(apiKey: string) {
    this.apiKey = apiKey
    if (!this.apiKey) {
      console.warn("TavusClient: No API key provided. Please set TAVUS_API_KEY environment variable.")
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.apiKey) {
      throw new Error("Tavus API key is not configured. Please set TAVUS_API_KEY environment variable.")
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }))
      console.error(`Tavus API Error (${response.status}):`, error)
      throw new Error(`Tavus API Error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  async createPersona(config: Omit<TavusPersona, "persona_id">): Promise<TavusPersona> {
    return this.makeRequest("/v2/personas", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async getPersona(personaId: string): Promise<TavusPersona> {
    return this.makeRequest(`/v2/personas/${personaId}`)
  }

  async getPersonas(): Promise<TavusPersona[]> {
    return this.makeRequest("/v2/personas")
  }

  async updatePersona(personaId: string, updates: any[]): Promise<TavusPersona> {
    return this.makeRequest(`/v2/personas/${personaId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  async deletePersona(personaId: string): Promise<void> {
    await this.makeRequest(`/v2/personas/${personaId}`, {
      method: "DELETE",
    })
  }

  async createReplica(personaId: string, replicaName?: string): Promise<TavusReplica> {
    return this.makeRequest("/v2/replicas", {
      method: "POST",
      body: JSON.stringify({
        persona_id: personaId,
        replica_name: replicaName || `Replica for ${personaId}`,
      }),
    })
  }

  async getReplicas(personaId?: string): Promise<TavusReplica[]> {
    const endpoint = personaId ? `/v2/replicas?persona_id=${personaId}` : "/v2/replicas"
    return this.makeRequest(endpoint)
  }

  async getReplica(replicaId: string): Promise<TavusReplica> {
    return this.makeRequest(`/v2/replicas/${replicaId}`)
  }

  async updateReplica(replicaId: string, updates: any[]): Promise<TavusReplica> {
    return this.makeRequest(`/v2/replicas/${replicaId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  async deleteReplica(replicaId: string): Promise<void> {
    await this.makeRequest(`/v2/replicas/${replicaId}`, {
      method: "DELETE",
    })
  }

  async createConversation(config: TavusConversationConfig): Promise<TavusConversation> {
    return this.makeRequest("/v2/conversations", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async getConversation(conversationId: string): Promise<TavusConversation> {
    return this.makeRequest(`/v2/conversations/${conversationId}`)
  }

  async endConversation(conversationId: string): Promise<void> {
    await this.makeRequest(`/v2/conversations/${conversationId}/end`, {
      method: "POST",
    })
  }

  async getConversationTranscript(conversationId: string): Promise<any> {
    return this.makeRequest(`/v2/conversations/${conversationId}/transcript`)
  }
}

export const tavusClient = new TavusClient(process.env.TAVUS_API_KEY || "")

// Helper function to generate interview persona based on job description
export function generateInterviewPersona(jobPosting: any, companyInfo?: any): Omit<TavusPersona, "persona_id"> {
  const companyName = companyInfo?.name || jobPosting.company?.name || "the company"
  const jobTitle = jobPosting.title
  const skills = jobPosting.skills_required?.join(", ") || "relevant skills"
  const experience = jobPosting.experience_level || "appropriate experience level"

  const systemPrompt = `You are Sarah, an experienced HR professional and technical interviewer conducting a job interview for the position of ${jobTitle} at ${companyName}.

Your role:
- Conduct a professional, friendly, and thorough interview
- Ask relevant questions about the candidate's experience, skills, and fit for the role
- Focus on: ${skills}
- Look for: ${experience}
- Provide constructive feedback and insights
- Keep the interview engaging and conversational
- Ask follow-up questions based on candidate responses
- Conclude with next steps and timeline

Interview Structure:
1. Welcome and brief company/role overview
2. Candidate background and experience
3. Technical skills assessment
4. Behavioral questions
5. Role-specific scenarios
6. Candidate questions
7. Next steps and closing

Keep responses concise but thorough. Be encouraging while maintaining professionalism.`

  const context = `Job Details:
- Position: ${jobTitle}
- Company: ${companyName}
- Required Skills: ${skills}
- Experience Level: ${experience}
- Job Type: ${jobPosting.job_type || "Full-time"}
- Work Mode: ${jobPosting.work_mode || "Hybrid"}
- Location: ${jobPosting.location || "Remote"}

${jobPosting.description ? `Job Description: ${jobPosting.description}` : ""}
${jobPosting.requirements ? `Requirements: ${jobPosting.requirements.join(", ")}` : ""}`

  return {
    persona_name: `Interview Bot - ${jobTitle} at ${companyName}`,
    system_prompt: systemPrompt,
    pipeline_mode: "full",
    context: context,
    layers: {
      llm: {
        model: "tavus-llama",
        extra_body: {
          temperature: 0.7,
          max_tokens: 1000
        }
      },
      tts: {
        tts_engine: "cartesia",
        voice_settings: {
          speed: "normal",
          emotion: ["professionalism:high", "friendliness:medium"]
        },
        tts_model_name: "sonic"
      },
      perception: {
        perception_model: "raven-0",
        ambient_awareness_queries: [
          "Is the candidate showing confidence?",
          "Does the candidate appear nervous or uncomfortable?",
          "Is the candidate maintaining good eye contact?",
          "Does the candidate appear engaged and interested?"
        ],
        perception_tool_prompt: "You have tools to assess candidate behavior and engagement during the interview. Use these insights to adjust your interviewing style and provide appropriate feedback."
      },
      stt: {
        stt_engine: "tavus-turbo",
        participant_pause_sensitivity: "medium",
        participant_interrupt_sensitivity: "medium",
        smart_turn_detection: false,
      }
    }
  }
}

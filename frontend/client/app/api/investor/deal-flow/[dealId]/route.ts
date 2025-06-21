import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'

export async function PUT(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)
    const body = await request.json()
    const { civicId, investment_amount, notes, status } = body

    // Update the deal flow entry
    const { data: deal, error } = await supabase
      .from('investor_deal_flow')
      .update({
        investment_amount,
        notes,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.dealId)
      .eq('investor_civic_id', civicId)
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ deal })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 
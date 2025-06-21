import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const limit = searchParams.get('limit') || '10'
    const offset = searchParams.get('offset') || '0'

    // Create Supabase client
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Build query
    let query = supabase
      .from('users')
      .select('*')
      .limit(parseInt(limit))
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    // Add role filter if specified
    if (role) {
      query = query.eq('role', role)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching user profiles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      users: users || [],
      total: users?.length || 0
    })
  } catch (error) {
    console.error('Error in profiles API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const limit = searchParams.get('limit') || '10'
    const offset = searchParams.get('offset') || '0'

    if (!role) {
      return NextResponse.json(
        { error: 'Role parameter is required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Get users by role
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .limit(parseInt(limit))
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) {
      console.error('Error fetching users by role:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users by role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      users: users || [],
      role: role,
      total: users?.length || 0
    })
  } catch (error) {
    console.error('Error in by-role API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

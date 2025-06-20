import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get civic ID from query params or headers
    const { searchParams } = new URL(request.url)
    const civicId = searchParams.get('civicId')

    if (!civicId) {
      return NextResponse.json(
        { error: 'Civic ID is required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Get user profile
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('civic_id', civicId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching user profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: user
    })
  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
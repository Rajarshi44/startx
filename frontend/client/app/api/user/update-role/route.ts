import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { role, civicId, email, name } = await request.json()

    if (!role || !civicId) {
      return NextResponse.json(
        { error: 'Role and civic ID are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['founder', 'jobseeker', 'investor']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // First check if user exists, if not create them
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('civic_id', civicId)
      .single()

    let userData
    if (!existingUser) {
      // Create user if they don't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          civic_id: civicId,
          email: email,
          name: name,
          active_roles: [role], // Store role in active_roles array
          onboarded: true,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }
      userData = newUser
    } else {
      // Update existing user - add role to active_roles if not already present
      let updatedActiveRoles = existingUser.active_roles || []
      if (!updatedActiveRoles.includes(role)) {
        updatedActiveRoles.push(role)
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          email: email,
          name: name,
          active_roles: updatedActiveRoles,
          onboarded: true,
          updated_at: new Date().toISOString(),
        })
        .eq('civic_id', civicId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user role:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        )
      }
      userData = updatedUser
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userData
    })
  } catch (error) {
    console.error('Error in update-role API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// This would be the Civic Auth configuration - you'll need to configure this based on your Civic Auth setup
const CIVIC_CLIENT_ID = process.env.CIVIC_CLIENT_ID
const CIVIC_CLIENT_SECRET = process.env.CIVIC_CLIENT_SECRET
const CIVIC_REDIRECT_URI = process.env.CIVIC_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/civicauth/callback`

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const pathname = request.nextUrl.pathname

  // Handle the callback
  if (pathname.includes('callback') && code) {
    try {
      // Exchange code for access token with Civic Auth
      const tokenResponse = await fetch('https://auth.civic.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: CIVIC_CLIENT_ID!,
          client_secret: CIVIC_CLIENT_SECRET!,
          code,
          redirect_uri: CIVIC_REDIRECT_URI,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const tokenData = await tokenResponse.json()
      
      // Get user profile from Civic Auth
      const userResponse = await fetch('https://auth.civic.com/api/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const userData = await userResponse.json()
      
      // Create Supabase client
      const cookieStore = cookies()
      const supabase = await createClient(cookieStore)

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('civic_id', userData.id)
        .single()

      if (existingUser) {
        // User exists, update their profile data
        await supabase
          .from('users')
          .update({
            email: userData.email,
            name: userData.name || userData.displayName,
            wallet_address: userData.walletAddress,
            profile_data: userData,
            updated_at: new Date().toISOString(),
          })
          .eq('civic_id', userData.id)
        
        // Redirect based on onboarding status
        if (existingUser.onboarded && existingUser.active_roles && existingUser.active_roles.length > 0) {
          // Redirect to the first active role's dashboard
          const primaryRole = existingUser.active_roles[0]
          return NextResponse.redirect(new URL(`/dashboard/${primaryRole}`, request.url))
        } else {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      } else {
        // Create new user
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            civic_id: userData.id,
            email: userData.email,
            name: userData.name || userData.displayName,
            wallet_address: userData.walletAddress,
            profile_data: userData,
            onboarded: false,
          })

        if (insertError) {
          console.error('Error creating user:', insertError)
          return NextResponse.redirect(new URL('/auth?error=database_error', request.url))
        }

        // Redirect to onboarding for new users
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth?error=auth_failed', request.url))
    }
  }

  // Handle initial auth request - redirect to Civic Auth
  const authUrl = new URL('https://auth.civic.com/oauth/authorize')
  authUrl.searchParams.set('client_id', CIVIC_CLIENT_ID!)
  authUrl.searchParams.set('redirect_uri', CIVIC_REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'profile email')
  authUrl.searchParams.set('state', crypto.randomUUID())

  return NextResponse.redirect(authUrl)
}

export async function POST(request: NextRequest) {
  // Handle POST requests if needed
  return GET(request)
}
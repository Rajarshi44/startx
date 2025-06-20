# Authentication Setup Guide

This document explains how to set up the Civic Auth + Supabase authentication flow for the StartupHub application.

## Overview

The authentication flow works as follows:
1. User clicks "Sign In" and is redirected to Civic Auth
2. After authentication, Civic Auth redirects back to our app with user data
3. User data is stored in Supabase users table
4. User is redirected to onboarding to select their role (founder, jobseeker, investor)
5. Role selection is saved and user is marked as onboarded
6. User is redirected to their personalized dashboard

## Database Schema

The `users` table in Supabase stores:
- `id`: UUID primary key
- `civic_id`: Unique identifier from Civic Auth
- `email`: User's email address
- `name`: User's display name
- `wallet_address`: Crypto wallet address (if provided by Civic)
- `role`: User's selected role (founder, jobseeker, investor)
- `profile_data`: JSONB field storing complete Civic Auth profile
- `onboarded`: Boolean indicating if user completed onboarding
- `created_at` / `updated_at`: Timestamps

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the frontend/client directory with:

```env
# Civic Auth Configuration
CIVIC_CLIENT_ID=your_civic_client_id_here
CIVIC_CLIENT_SECRET=your_civic_client_secret_here
CIVIC_REDIRECT_URI=http://localhost:3000/api/auth/civicauth/callback

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the SQL commands from `supabase/schema.sql` in your Supabase SQL editor
3. Copy your project URL and anon key to the environment variables

### 3. Civic Auth Setup

1. Register your application at [Civic Auth](https://auth.civic.com)
2. Set your redirect URI to: `http://localhost:3000/api/auth/civicauth/callback`
3. Copy your client ID and secret to the environment variables
4. Update the client ID in `app/layout.tsx` if different from the hardcoded one

## API Routes

### Authentication Flow
- `GET /api/auth/civicauth` - Initiates Civic Auth login
- `GET /api/auth/civicauth/callback` - Handles auth callback and user creation

### User Management
- `GET /api/user/profile?civicId={id}` - Gets user profile by Civic ID
- `POST /api/user/update-role` - Updates user role and onboarding status

## File Structure

```
app/
├── api/
│   ├── auth/
│   │   └── [...civicauth]/
│   │       └── route.ts          # Civic Auth handler
│   └── user/
│       ├── profile/
│       │   └── route.ts          # User profile API
│       └── update-role/
│           └── route.ts          # Role update API
├── onboarding/
│   └── page.tsx                  # Role selection page
├── dashboard/
│   ├── founder/
│   ├── investor/
│   └── jobseeker/
└── layout.tsx                    # App layout with Civic Auth provider

utils/supabase/
├── client.ts                     # Browser Supabase client
├── server.ts                     # Server Supabase client
└── middleware.ts                 # Middleware Supabase client

supabase/
└── schema.sql                    # Database schema
```

## Usage

1. User visits `/auth` and clicks "Sign In with Civic"
2. User completes Civic Auth flow
3. User is redirected to `/onboarding` to select role
4. After role selection, user goes to `/dashboard/{role}`
5. Returning users are automatically redirected to their dashboard

## Security Features

- Row Level Security (RLS) policies on users table
- JWT-based authentication through Civic Auth
- Secure API routes with proper error handling
- Input validation on role updates

## Development Notes

- The Civic Auth middleware in `middleware/middleware.ts` handles authentication for all routes
- Toast notifications provide user feedback
- Loading states prevent double submissions
- Error handling includes user-friendly messages

## Troubleshooting

- Ensure environment variables are set correctly
- Check Supabase RLS policies if database operations fail
- Verify Civic Auth redirect URI matches exactly
- Check browser console for detailed error messages

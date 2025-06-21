# Investor Profile Setup & Features

## Overview

The investor dashboard now includes comprehensive profile management with two ways to manage your investor information:

1. **Quick Edit Modal** - For basic profile updates directly from the dashboard
2. **Detailed Profile Page** - Full profile management with all available fields

## New Features

### 1. Enhanced Profile Management

- **Quick Edit**: Click "Quick Edit" button in the dashboard header for basic profile updates
- **Full Profile**: Click "View Profile" or "Create Profile" to access the comprehensive profile page
- **Automatic Save**: All profile changes are automatically saved and synchronized
- **Real-time Updates**: Profile changes reflect immediately in the dashboard sidebar

### 2. Comprehensive Profile Fields

The investor profile now supports the following information:

#### Basic Information
- Firm Name (required)
- Location
- Investment Focus (e.g., SaaS, FinTech, AI)
- Assets Under Management (AUM)

#### Investment Preferences
- Stage Preference (e.g., Seed, Series A, Series B)
- Sector Preference (e.g., B2B, B2C, Enterprise)
- Minimum Check Size
- Maximum Check Size

#### Portfolio & Experience
- Number of Portfolio Companies
- Total Investments Made
- Notable Investments (description)

#### About & Criteria
- Personal/Firm Bio
- Investment Criteria and Philosophy

#### Contact Information
- Contact Email
- Phone Number
- Website URL
- LinkedIn Profile URL

### 3. Profile Navigation

- **Dashboard Integration**: Profile information displays in the dashboard sidebar
- **Dedicated Profile Page**: Access via `/dashboard/investor/profile`
- **Breadcrumb Navigation**: Easy navigation back to dashboard
- **Auto-editing**: New users automatically enter edit mode

### 4. Authentication & Security

- **Sign Out Functionality**: Working sign out button that redirects to home page
- **Secure Sessions**: Proper Civic Auth integration with session management
- **Data Protection**: All profile data is securely stored and validated

## Database Setup

### For New Installations

If you're setting up a fresh database, the updated schema in `supabase/schema.sql` includes all necessary fields.

### For Existing Databases

If you have an existing database, run the migration script:

```sql
-- Run this in your Supabase SQL editor or via CLI
\i supabase/migrations/add_investor_profile_fields.sql
```

Or manually execute the ALTER TABLE statements from the migration file.

### Database Fields Added

The following fields were added to the `investor_profiles` table:

- `investment_focus` (TEXT)
- `stage_preference` (TEXT) 
- `sector_preference` (TEXT)
- `check_size_min` (NUMERIC)
- `check_size_max` (NUMERIC)
- `portfolio_companies` (INTEGER)
- `investment_criteria` (TEXT)
- `contact_email` (TEXT)
- `website` (TEXT)
- `linkedin` (TEXT)
- `phone` (TEXT)
- `location` (TEXT)
- `aum` (NUMERIC) - Assets Under Management
- `notable_investments` (TEXT)

## API Endpoints

### GET `/api/investor/profile`
Fetches complete investor profile including:
- Profile details
- Deal flow data  
- Investment history

**Parameters:**
- `civicId` (required) - Civic Auth user ID

### POST `/api/investor/profile`
Creates or updates investor profile

**Body:**
- `civicId` (required) - Civic Auth user ID
- All profile fields (optional)

## Usage Examples

### Creating a New Profile

1. Navigate to investor dashboard
2. Click "Create Profile" if no profile exists
3. Fill out the comprehensive form
4. Save to create your investor profile

### Editing Existing Profile

**Quick Edit:**
1. Click "Quick Edit" in dashboard header
2. Update basic fields in modal
3. Save changes

**Full Edit:**
1. Click "View Profile" in dashboard header
2. Click "Edit" button in profile page
3. Update any fields
4. Save changes

### Viewing Profile

1. Click "View Profile" in dashboard header
2. Review all profile information
3. See contact information with clickable links
4. View investment criteria and notable investments

## Technical Implementation

### Frontend Components

- **Dashboard Integration**: Enhanced investor dashboard with profile display
- **Profile Page**: Dedicated profile management page at `/dashboard/investor/profile`
- **Responsive Design**: Works on desktop and mobile devices
- **Form Validation**: Client-side validation for required fields

### Backend Integration

- **Supabase Integration**: All data stored in Supabase PostgreSQL
- **Civic Auth**: Secure authentication and user identification
- **RESTful API**: Clean API endpoints for profile management
- **Error Handling**: Comprehensive error handling and user feedback

### State Management

- **React State**: Local state management for form data
- **Real-time Updates**: Immediate UI updates on successful saves
- **Loading States**: Loading indicators during API calls
- **Error States**: User-friendly error messages

## Troubleshooting

### Profile Not Saving

1. Check that you're logged in with Civic Auth
2. Verify all required fields are filled
3. Check browser console for API errors
4. Ensure database migration has been run

### Sign Out Not Working

1. Verify Civic Auth configuration
2. Check that `signOut` function is properly imported
3. Ensure proper error handling in sign out function

### Profile Page Not Loading

1. Check that you're authenticated
2. Verify the route `/dashboard/investor/profile` exists
3. Check browser console for navigation errors
4. Ensure database connection is working

## Future Enhancements

Potential future additions:

- Profile photo upload
- Investment thesis document upload
- Portfolio company showcase
- Investment preferences matching
- Public investor directory
- Enhanced search and filtering
- Analytics and insights dashboard 
# Community Chat System

This document describes the community chat system implemented for the StartupHub platform.

## Overview

The community chat system allows verified users on the platform to communicate with each other through a mentoring forum. Users must set up a username before entering the chat and all messages are stored in MongoDB.

## Features

### User Registration
- Users must be authenticated through Civic Auth
- Username selection with validation (3-20 characters, alphanumeric + underscores)
- Automatic verification for platform users
- Wallet address storage (optional)

### Messaging
- Non-real-time chat interface
- Message length limit: 1000 characters
- Pagination support (20 messages per page)
- Auto-scroll to latest messages
- Message timestamps with relative time display
- **Image sharing**: Upload and share JPEG, PNG, GIF, WebP images (up to 10MB)
- **Voice messages**: Record and send voice messages with audio controls
- **Media viewer**: Click to zoom images, play/pause/seek audio with waveform

### User Interface
- Dark theme consistent with platform design
- Responsive design for mobile and desktop
- User avatars with initials
- Verification badges for authenticated users
- Keyboard shortcuts (Ctrl+Enter to send)

## API Endpoints

### User Management
- `GET /api/community/users?civicId={id}` - Check if user exists
- `POST /api/community/users` - Register new user or update username
- `PUT /api/community/users` - Update verification status (admin only)

### Messages
- `GET /api/community/messages?page={page}&limit={limit}` - Fetch messages with pagination
- `POST /api/community/messages` - Send new message (with optional media attachment)

### Media Upload
- `POST /api/community/upload` - Upload images or audio files to Cloudinary

## Database Schema

### Collection: `communityUsers`
```javascript
{
  _id: ObjectId,
  civicId: string,           // Civic Auth user ID
  username: string,          // Unique username (lowercase)
  walletAddress: string,     // Optional wallet address
  verificationStatus: string, // 'verified', 'pending', 'rejected'
  joinedAt: Date,
  updatedAt: Date
}
```

### Collection: `communityMessages`
```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to communityUsers._id
  message: string,           // Message content (max 1000 chars)
  media: {                   // Optional media attachment
    type: string,            // 'image' or 'audio'
    url: string,             // Cloudinary secure URL
    publicId: string,        // Cloudinary public ID
    format: string,          // File format (jpg, png, mp3, etc.)
    bytes: number,           // File size in bytes
    width: number,           // Image width (images only)
    height: number,          // Image height (images only)
    duration: number         // Audio duration in seconds (audio only)
  },
  createdAt: Date,
  editedAt: Date             // Optional, for future edit functionality
}
```

## Security Features

1. **Authentication Required**: Users must be signed in with Civic Auth
2. **Verification Check**: Only verified users can send messages
3. **Input Validation**: 
   - Username format validation
   - Message length limits
   - XSS protection through proper encoding
4. **Rate Limiting**: Implemented through UI state management

## File Structure

```
frontend/client/
├── app/
│   ├── community/
│   │   └── page.tsx                    # Main community chat page
│   └── api/
│       └── community/
│           ├── users/
│           │   └── route.ts            # User management API
│           ├── messages/
│           │   └── route.ts            # Message handling API
│           └── upload/
│               └── route.ts            # Media upload API (Cloudinary)
├── components/
│   └── community/
│       ├── VoiceRecorder.tsx           # Voice recording component
│       └── MediaViewer.tsx             # Image/audio display component
├── lib/
│   └── cloudinary.ts                   # Cloudinary configuration & utilities
├── types/
│   └── community.ts                    # TypeScript interfaces (updated with media)
├── services/
│   └── communityService.ts             # API service layer (with media support)
└── docs/
    └── COMMUNITY_CHAT.md               # This documentation
```

## Usage

### For Users
1. Navigate to `/community` from the floating navbar
2. If not registered, enter a username to join
3. Start chatting with other community members
4. **Text Messages**: Type and send text messages (up to 1000 characters)
5. **Image Sharing**: Click "Image" button to upload photos (JPEG, PNG, GIF, WebP up to 10MB)
6. **Voice Messages**: Click "Voice" button to record and send audio messages
7. **Media Viewing**: Click images to view full-size, use audio controls to play voice messages
8. Use Ctrl+Enter for quick message sending

### For Developers
```typescript
import { communityService } from '@/services/communityService'

// Check if user is registered
const userResponse = await communityService.getUser(civicId)

// Send a message
const messageResponse = await communityService.sendMessage({
  message: "Hello community!",
  civicId: user.id
})
```

## Configuration

### MongoDB
The system uses the following MongoDB connection:
- URI: `mongodb+srv://rishi404:giXEpvLDXFg8Jwzd@cluster0.6nhngod.mongodb.net/`
- Database: `resumeUploads`
- Collections: `communityUsers`, `communityMessages`

### Cloudinary
Media files are stored on Cloudinary with the following configuration:
- Cloud Name: `djydvffdp`
- API Key: `615679796164426`
- API Secret: `ObBGhhlXY5FxwCvvMqHIGuCsdxI`
- Folders: `community/images/`, `community/audio/`
- Image transformations: Auto-optimization, max 1200x1200px
- Audio format: Converted to MP3 for compatibility

## Future Enhancements

1. **Real-time Messaging**: WebSocket implementation for live updates
2. **Message Editing**: Allow users to edit their messages
3. **Private Messaging**: Direct messages between users
4. **File Sharing**: Support for images and documents
5. **Moderation Tools**: Admin controls for message management
6. **Thread Replies**: Nested conversation support
7. **Emoji Reactions**: React to messages with emojis
8. **User Roles**: Different permission levels (mentor, startup founder, etc.)

## Troubleshooting

### Common Issues

1. **User Not Found Error**: Ensure user is properly authenticated with Civic Auth
2. **Username Taken**: Try a different username or add numbers/underscores
3. **Message Send Failed**: Check network connection and user verification status
4. **Loading Issues**: Refresh the page and check console for errors

### Error Codes
- `400`: Bad request (missing parameters or validation errors)
- `403`: Forbidden (user not verified)
- `404`: User not found
- `409`: Conflict (username already taken)
- `500`: Internal server error

## Contributing

When contributing to the community chat system:

1. Follow the existing code style and patterns
2. Add proper error handling and validation
3. Update this documentation for any API changes
4. Test with different user scenarios
5. Ensure MongoDB queries are optimized 
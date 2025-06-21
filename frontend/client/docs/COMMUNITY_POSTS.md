# Community Posts System

## Overview

The Community Posts system is a comprehensive social platform that allows verified users (investors, founders, employees) to share insights, experiences, and engage in discussions through posts and comments.

## Features

### 📝 Post Creation
- **Rich Text Posts**: Create posts with titles and detailed content (up to 5000 characters)
- **Media Support**: Upload images and videos with posts
  - Images: JPEG, PNG, GIF, WebP (up to 10MB)
  - Videos: MP4, WebM, MOV, AVI (up to 100MB)
- **Tagging System**: Add up to 10 relevant tags to categorize posts
- **Real-time Preview**: See media previews before publishing

### 🎯 Content Discovery
- **Sorting Options**:
  - Latest: Newest posts first
  - Popular: Most liked posts
  - Trending: High engagement in the last 7 days
- **Tag-based Filtering**: Filter posts by specific tags
- **Pagination**: Load posts in batches for better performance
- **Infinite Scroll**: Load more posts on demand

### 💬 Engagement Features
- **Like System**: Like/unlike posts with real-time updates
- **Comments**: Share opinions and engage in discussions (coming soon)
- **Share Options**: Share posts with others
- **User Verification**: Verified badge display for authenticated users

### 🔒 Security & Verification
- **User Authentication**: Only verified Civic Auth users can post
- **Content Validation**: Input sanitization and length limits
- **Media Validation**: File type and size restrictions
- **Ownership Control**: Users can only edit/delete their own posts

## Technical Implementation

### Database Schema

#### Community Posts Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to communityUsers
  title: String, // Max 200 characters
  content: String, // Max 5000 characters
  media: [
    {
      type: 'image' | 'video',
      url: String, // Cloudinary URL
      publicId: String, // Cloudinary public ID
      width: Number,
      height: Number,
      duration: Number, // For videos
      format: String,
      bytes: Number
    }
  ],
  tags: [String], // Max 10 tags, processed to lowercase
  likes: [String], // Array of user IDs
  commentsCount: Number, // Cached count for performance
  createdAt: Date,
  updatedAt: Date
}
```

#### Community Comments Collection
```javascript
{
  _id: ObjectId,
  postId: ObjectId, // Reference to post
  userId: ObjectId, // Reference to communityUsers
  content: String, // Max 2000 characters
  likes: [String], // Array of user IDs
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

#### Posts
- `GET /api/community/posts` - Fetch posts with filtering and pagination
- `POST /api/community/posts` - Create new post
- `GET /api/community/posts/[postId]` - Get single post
- `PUT /api/community/posts/[postId]` - Update post (owner only)
- `DELETE /api/community/posts/[postId]` - Delete post (owner only)
- `POST /api/community/posts/[postId]/like` - Toggle like on post

#### Comments
- `GET /api/community/posts/[postId]/comments` - Fetch comments for post
- `POST /api/community/posts/[postId]/comments` - Create new comment

#### Media Upload
- `POST /api/community/upload` - Upload images and videos to Cloudinary

### Media Storage (Cloudinary)

#### Configuration
- **Cloud Name**: djydvffdp
- **Folders**:
  - `community/images/` - Image uploads
  - `community/videos/` - Video uploads
  - `community/audio/` - Audio uploads (for future use)

#### Processing
- **Images**: Auto-optimization, format conversion, size limits (1200x1200px)
- **Videos**: Quality optimization, size limits (1920x1080px), compression

## User Interface

### Main Posts Feed (`/community/posts`)
- **Header**: Navigation between chat and posts
- **Create Post Dialog**: Modal for post creation with media upload
- **Filter Bar**: Sort and filter options
- **Posts List**: Paginated feed with infinite scroll
- **Post Cards**: Rich display with media, tags, and engagement metrics

### Navigation
- **From Chat**: "View Posts" button in community chat header
- **From Posts**: "Chat" button in posts header
- **Floating Navbar**: Community icon navigates to both sections

## Usage Guide

### For Users

1. **Creating a Post**:
   - Click "Create Post" button
   - Enter title and content
   - Add relevant tags
   - Upload images/videos (optional)
   - Click "Create Post" to publish

2. **Engaging with Posts**:
   - Click heart icon to like/unlike
   - View comments by clicking comment count
   - Use filter options to find relevant content
   - Load more posts by scrolling or clicking "Load More"

3. **Managing Posts**:
   - Edit your own posts (title, content, tags, media)
   - Delete your own posts
   - View engagement metrics

### For Developers

1. **Adding New Features**:
   - Extend TypeScript interfaces in `/types/posts.ts`
   - Add API endpoints following existing patterns
   - Update service layer in `/services/postsService.ts`
   - Implement UI components with consistent styling

2. **Database Operations**:
   - Use MongoDB aggregation for complex queries
   - Maintain referential integrity between collections
   - Cache frequently accessed data (likes count, comments count)

3. **Media Handling**:
   - Validate file types and sizes on both client and server
   - Use Cloudinary transformations for optimization
   - Implement proper error handling for upload failures

## Performance Considerations

- **Pagination**: Load posts in small batches (10 per page)
- **Image Optimization**: Cloudinary auto-optimization reduces bandwidth
- **Caching**: Like counts and comment counts are cached in posts
- **Lazy Loading**: Media is loaded on demand
- **Aggregation Pipelines**: Efficient database queries with joins

## Security Features

- **Input Validation**: All user inputs are sanitized and validated
- **File Upload Security**: Strict file type and size limitations
- **User Verification**: Only verified users can post
- **Ownership Checks**: Users can only modify their own content
- **Rate Limiting**: Prevent spam and abuse

## Future Enhancements

- **Comment Threads**: Nested replies to comments
- **Rich Text Editor**: Markdown support, mentions, embeds
- **Notification System**: Real-time notifications for likes and comments
- **Advanced Search**: Full-text search across posts and comments
- **User Profiles**: Dedicated profile pages with post history
- **Content Moderation**: Automated and manual content review
- **Analytics Dashboard**: Engagement metrics and insights

## Integration Points

- **Civic Auth**: User authentication and verification
- **Community Chat**: Seamless navigation between chat and posts
- **Cloudinary**: Media storage and optimization
- **MongoDB**: Data persistence and querying
- **Next.js App Router**: Server-side rendering and routing

## Monitoring & Analytics

- **Error Tracking**: Client and server error logging
- **Performance Metrics**: API response times and database query performance
- **User Engagement**: Track post creation, likes, comments, and views
- **Media Usage**: Monitor storage usage and bandwidth consumption 
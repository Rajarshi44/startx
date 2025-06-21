export interface CommunityPost {
  _id: string
  userId: string
  title: string
  content: string
  media?: PostMedia[]
  tags: string[]
  likes: string[] // Array of user IDs who liked the post
  likesCount: number
  commentsCount: number
  createdAt: string
  updatedAt?: string
  user: {
    username: string
    civicId: string
    verificationStatus: string
  }
}

export interface PostMedia {
  type: 'image' | 'video'
  url: string
  publicId: string
  width?: number
  height?: number
  duration?: number
  format: string
  bytes: number
  thumbnail?: string // For videos
}

export interface PostComment {
  _id: string
  postId: string
  userId: string
  content: string
  likes: string[]
  createdAt: string
  updatedAt?: string
  user: {
    username: string
    civicId: string
    verificationStatus: string
  }
}

export interface CreatePostRequest {
  title: string
  content: string
  media?: PostMedia[]
  tags: string[]
  civicId: string
}

export interface CreateCommentRequest {
  postId: string
  content: string
  civicId: string
}

export interface PostsResponse {
  success: boolean
  posts?: CommunityPost[]
  post?: CommunityPost
  error?: string
  pagination?: {
    page: number
    limit: number
    hasMore: boolean
    total: number
  }
}

export interface CommentsResponse {
  success: boolean
  comments?: PostComment[]
  comment?: PostComment
  error?: string
  pagination?: {
    page: number
    limit: number
    hasMore: boolean
    total: number
  }
}

export interface LikeResponse {
  success: boolean
  liked: boolean
  likesCount: number
  error?: string
}

export type UserRole = 'founder' | 'investor' | 'employee' | 'mentor' | 'other'

export interface PostFilters {
  role?: UserRole
  tags?: string[]
  sortBy?: 'latest' | 'popular' | 'trending'
  timeRange?: 'day' | 'week' | 'month' | 'all'
} 
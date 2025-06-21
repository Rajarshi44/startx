import { 
  CommunityPost, 
  PostComment, 
  CreatePostRequest, 
  CreateCommentRequest,
  PostsResponse,
  CommentsResponse,
  LikeResponse,
  PostFilters 
} from '@/types/posts'

class PostsService {
  private baseUrl = '/api/community/posts'

  // Get all posts with filters and pagination
  async getPosts(filters?: PostFilters, page: number = 1, limit: number = 10): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })

      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.tags?.length) params.append('tags', filters.tags.join(','))
      if (filters?.timeRange) params.append('timeRange', filters.timeRange)

      const response = await fetch(`${this.baseUrl}?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts')
      }

      return data
    } catch (error) {
      console.error('Error fetching posts:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch posts' 
      }
    }
  }

  // Get single post
  async getPost(postId: string): Promise<PostsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${postId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch post')
      }

      return data
    } catch (error) {
      console.error('Error fetching post:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch post' 
      }
    }
  }

  // Create new post
  async createPost(postData: CreatePostRequest): Promise<PostsResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post')
      }

      return data
    } catch (error) {
      console.error('Error creating post:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create post' 
      }
    }
  }

  // Update post
  async updatePost(postId: string, postData: Partial<CreatePostRequest>): Promise<PostsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update post')
      }

      return data
    } catch (error) {
      console.error('Error updating post:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update post' 
      }
    }
  }

  // Delete post
  async deletePost(postId: string, civicId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${postId}?civicId=${civicId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete post')
      }

      return data
    } catch (error) {
      console.error('Error deleting post:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete post' 
      }
    }
  }

  // Like/Unlike post
  async toggleLike(postId: string, civicId: string): Promise<LikeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ civicId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle like')
      }

      return data
    } catch (error) {
      console.error('Error toggling like:', error)
      return { 
        success: false, 
        liked: false,
        likesCount: 0,
        error: error instanceof Error ? error.message : 'Failed to toggle like' 
      }
    }
  }

  // Get comments for a post
  async getComments(postId: string, page: number = 1, limit: number = 20): Promise<CommentsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })

      const response = await fetch(`${this.baseUrl}/${postId}/comments?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments')
      }

      return data
    } catch (error) {
      console.error('Error fetching comments:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch comments' 
      }
    }
  }

  // Create new comment
  async createComment(commentData: CreateCommentRequest): Promise<CommentsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${commentData.postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create comment')
      }

      return data
    } catch (error) {
      console.error('Error creating comment:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create comment' 
      }
    }
  }

  // Upload media file
  async uploadMedia(file: File, type: 'image' | 'video', civicId: string): Promise<{
    success: boolean
    data?: any
    error?: string
  }> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('civicId', civicId)

      const response = await fetch('/api/community/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload media')
      }

      return data
    } catch (error) {
      console.error('Error uploading media:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload media' 
      }
    }
  }
}

export const postsService = new PostsService()
export default postsService 
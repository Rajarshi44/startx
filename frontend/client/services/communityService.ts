import type { 
  CommunityUser, 
  CommunityMessage, 
  MessageResponse, 
  UserResponse,
  MessageRequest,
  UserRegistrationRequest,
  VerificationUpdateRequest
} from '@/types/community'

class CommunityService {
  private baseUrl = '/api/community'

  async getUser(civicId: string): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users?civicId=${civicId}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching user:', error)
      return { success: false, exists: false, error: 'Failed to fetch user' }
    }
  }

  async registerUser(data: UserRegistrationRequest): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      console.error('Error registering user:', error)
      return { success: false, exists: false, error: 'Failed to register user' }
    }
  }

  async updateVerificationStatus(data: VerificationUpdateRequest): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      console.error('Error updating verification status:', error)
      return { success: false, exists: false, error: 'Failed to update verification' }
    }
  }

  async getMessages(page: number = 1, limit: number = 20): Promise<MessageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages?page=${page}&limit=${limit}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching messages:', error)
      return { success: false, error: 'Failed to fetch messages' }
    }
  }

  async sendMessage(data: MessageRequest): Promise<MessageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false, error: 'Failed to send message' }
    }
  }

  // Helper method to validate username
  validateUsername(username: string): { valid: boolean; error?: string } {
    if (!username || username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters long' }
    }
    
    if (username.length > 20) {
      return { valid: false, error: 'Username must be no more than 20 characters long' }
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, error: 'Username can only contain letters, numbers, and underscores' }
    }
    
    return { valid: true }
  }

  // Helper method to validate message
  validateMessage(message: string): { valid: boolean; error?: string } {
    if (!message || !message.trim()) {
      return { valid: false, error: 'Message cannot be empty' }
    }
    
    if (message.length > 1000) {
      return { valid: false, error: 'Message must be no more than 1000 characters long' }
    }
    
    return { valid: true }
  }

  // Helper method to format timestamps
  formatTimestamp(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now'
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes}m ago`
    }
    
    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours}h ago`
    }
    
    // Less than 1 week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `${days}d ago`
    }
    
    // Default to formatted date
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Helper method to get user initials for avatar
  getUserInitials(username: string): string {
    if (!username) return 'U'
    return username.slice(0, 2).toUpperCase()
  }

  // Helper method to get verification badge variant
  getVerificationBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' {
    switch (status) {
      case 'verified':
        return 'secondary'
      case 'pending':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'default'
    }
  }
}

export const communityService = new CommunityService() 
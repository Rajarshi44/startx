export interface CommunityUser {
  _id: string
  username: string
  civicId: string
  walletAddress?: string
  verificationStatus: 'pending' | 'verified' | 'rejected'
  joinedAt: string
  updatedAt: string
}

export interface CommunityMessage {
  _id: string
  userId: string
  message: string
  createdAt: string
  editedAt?: string
  user: {
    username: string
    civicId: string
    verificationStatus: string
  }
}

export interface MessageResponse {
  success: boolean
  message?: CommunityMessage
  messages?: CommunityMessage[]
  error?: string
  pagination?: {
    page: number
    limit: number
    hasMore: boolean
  }
}

export interface UserResponse {
  success: boolean
  exists: boolean
  user?: CommunityUser
  error?: string
  message?: string
}

export interface MessageRequest {
  message: string
  civicId: string
}

export interface UserRegistrationRequest {
  civicId: string
  username: string
  walletAddress?: string
}

export interface VerificationUpdateRequest {
  civicId: string
  verificationStatus: 'verified' | 'rejected'
  adminCivicId: string
} 
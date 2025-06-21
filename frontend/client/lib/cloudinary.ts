import { v2 as cloudinary } from 'cloudinary'

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'djydvffdp',
  api_key: '615679796164426',
  api_secret: 'ObBGhhlXY5FxwCvvMqHIGuCsdxI',
  secure: true
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  resource_type: string
  bytes: number
  width?: number
  height?: number
  duration?: number
}

export class CloudinaryService {
  // Upload image file
  async uploadImage(file: File): Promise<CloudinaryUploadResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'community_images') // You'll need to create this preset
      formData.append('folder', 'community/images')

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/djydvffdp/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      return await response.json()
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Upload audio file (voice message)
  async uploadAudio(audioBlob: Blob): Promise<CloudinaryUploadResult> {
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'voice-message.webm')
      formData.append('upload_preset', 'community_audio') // You'll need to create this preset
      formData.append('folder', 'community/audio')
      formData.append('resource_type', 'video') // Cloudinary treats audio as video

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/djydvffdp/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Failed to upload audio')
      }

      return await response.json()
    } catch (error) {
      console.error('Error uploading audio:', error)
      throw error
    }
  }

  // Get optimized image URL
  getOptimizedImageUrl(publicId: string, options: {
    width?: number
    height?: number
    quality?: 'auto' | number
    format?: 'auto' | 'jpg' | 'png' | 'webp'
  } = {}): string {
    const {
      width = 800,
      height,
      quality = 'auto',
      format = 'auto'
    } = options

    let transformations = `q_${quality},f_${format}`
    
    if (width) transformations += `,w_${width}`
    if (height) transformations += `,h_${height},c_fill`

    return `https://res.cloudinary.com/djydvffdp/image/upload/${transformations}/${publicId}`
  }

  // Get audio URL
  getAudioUrl(publicId: string): string {
    return `https://res.cloudinary.com/djydvffdp/video/upload/${publicId}`
  }

  // Validate file type
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 10MB' }
    }

    return { valid: true }
  }

  // Get thumbnail URL for images
  getThumbnailUrl(publicId: string): string {
    return `https://res.cloudinary.com/djydvffdp/image/upload/w_150,h_150,c_fill,q_auto,f_auto/${publicId}`
  }
}

export const cloudinaryService = new CloudinaryService() 
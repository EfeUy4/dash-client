import api from '../utils/api'

interface UploadResponse {
  success: boolean
  data: {
    url: string
    publicId: string
    width: number | null
    height: number | null
  }
}

class UploadService {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data
  }

  async deleteImage(publicId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/upload/image/${publicId}`)
    return response.data
  }

  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, or WebP)' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' }
    }

    return { valid: true }
  }

  getThumbnailUrl(imageUrl: string, _width?: number, _height?: number): string {
    return imageUrl
  }
}

export const uploadService = new UploadService()

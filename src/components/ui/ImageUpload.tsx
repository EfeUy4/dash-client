import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { useToastUtils } from '@/services/toast'
import { uploadService } from '@/services/uploadService'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

const ImageUpload = ({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showSuccessToast, showErrorToast } = useToastUtils()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) return

    if (images.length + files.length > maxImages) {
      showErrorToast(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    const newImages: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        const validation = uploadService.validateImage(file)
        if (!validation.valid) {
          showErrorToast(validation.error || `Invalid file: ${file.name}`)
          continue
        }

        setUploadingIndex(i)

        try {
          const result = await uploadService.uploadImage(file)
          newImages.push(result.data.url)
          showSuccessToast(`Image ${i + 1} uploaded successfully`)
        } catch (error) {
          showErrorToast(`Failed to upload ${file.name}`)
          console.error('Upload error:', error)
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages])
      }
    } finally {
      setUploading(false)
      setUploadingIndex(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const addImageUrl = () => {
    const url = prompt('Enter image URL:')
    if (url && url.trim()) {
      if (images.length >= maxImages) {
        showErrorToast(`Maximum ${maxImages} images allowed`)
        return
      }
      onImagesChange([...images, url.trim()])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
        </button>

        <button
          type="button"
          onClick={addImageUrl}
          disabled={images.length >= maxImages}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-4 h-4" />
          <span>Add URL</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && (
        <div className="text-sm text-gray-600">
          Uploading image {uploadingIndex !== null ? uploadingIndex + 1 : ''}...
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/placeholder-image.png'
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>• Maximum {maxImages} images</p>
        <p>• Supported formats: JPG, PNG, WebP</p>
        <p>• Maximum file size: 5MB per image</p>
      </div>
    </div>
  )
}

export default ImageUpload

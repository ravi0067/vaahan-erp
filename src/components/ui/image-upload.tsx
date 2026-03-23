'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return 'Only JPG, PNG, SVG, and WebP files are allowed'
    }

    // Check file size (2MB max)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 2MB'
    }

    return null
  }

  const handleFileSelect = async (file: File) => {
    const error = validateFile(file)
    if (error) {
      alert(error)
      return
    }

    setIsLoading(true)
    try {
      const base64 = await convertToBase64(file)
      onChange(base64)
    } catch (error) {
      console.error('Error converting file:', error)
      alert('Error processing file. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (disabled || isLoading) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !isLoading) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    if (!disabled && !isLoading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>Business Logo</Label>
      
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5',
          value ? 'border-solid border-green-500 bg-green-50 dark:bg-green-950' : ''
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          disabled={disabled || isLoading}
          className="hidden"
        />

        {value ? (
          // Preview
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={value}
                alt="Logo preview"
                className="h-16 w-16 object-contain rounded border bg-white"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                disabled={disabled || isLoading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">✅ Logo uploaded successfully</p>
              <p className="text-xs text-muted-foreground">Click to replace or drag a new file</p>
            </div>
          </div>
        ) : (
          // Upload prompt
          <div className="space-y-3">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm">Processing logo...</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium">Upload your business logo</p>
                  <p className="text-xs text-muted-foreground">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, SVG, WebP • Max 2MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Alternative URL input */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Or paste logo URL:</Label>
        <div className="flex space-x-2">
          <Input
            type="url"
            placeholder="https://example.com/logo.png"
            value={value && !value.startsWith('data:') ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            className="text-xs"
          />
          {value && !value.startsWith('data:') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange('')}
              disabled={disabled || isLoading}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
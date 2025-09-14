"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Upload, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  images: File[]
  onImagesChange: (images: File[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onImagesChange, maxImages = 10 }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages = [...images, ...acceptedFiles].slice(0, maxImages)
      onImagesChange(newImages)

      // Create preview URLs
      const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file))
      setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxImages))
    },
    [images, onImagesChange, maxImages],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages,
  })

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    onImagesChange(newImages)
    setPreviews(newPreviews)

    // Revoke the URL to prevent memory leaks
    if (previews[index]) {
      URL.revokeObjectURL(previews[index])
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-gray-300 dark:border-gray-600 hover:border-green-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? "Drop images here..." : "Upload Product Images"}
              </p>
              <p className="text-sm text-gray-500 mb-4">Drag & drop images here, or click to select files</p>
              <p className="text-xs text-gray-400">Supports: JPG, PNG, WebP, GIF (Max {maxImages} images)</p>
              <Button type="button" variant="outline" className="mt-4 bg-transparent">
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((file, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {previews[index] ? (
                    <Image
                      src={previews[index] || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 truncate">{file.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-sm text-gray-500">
          {images.length} of {maxImages} images uploaded
        </p>
      )}
    </div>
  )
}

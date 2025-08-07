"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, type File, X, CheckCircle, AlertCircle } from "lucide-react"
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZES } from "@/data/content-categories"
import type { ContentType, UploadProgress } from "@/types/content-upload"

interface FileUploadZoneProps {
  onFileSelected: (file: File, contentType: ContentType) => void
  acceptedTypes?: ContentType[]
}

export function FileUploadZone({
  onFileSelected,
  acceptedTypes = ["image", "video", "audio", "document"],
}: FileUploadZoneProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ percentage: 0, status: "idle" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const getContentTypeFromFile = (file: File): ContentType | null => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase()

    for (const [type, extensions] of Object.entries(SUPPORTED_FILE_TYPES)) {
      if (extensions.includes(extension)) {
        return type as ContentType
      }
    }
    return null
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const contentType = getContentTypeFromFile(file)

    if (!contentType) {
      return { valid: false, error: "Unsupported file type" }
    }

    if (!acceptedTypes.includes(contentType)) {
      return { valid: false, error: `${contentType} files are not accepted` }
    }

    const maxSize = MAX_FILE_SIZES[contentType]
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return { valid: false, error: `File size must be less than ${maxSizeMB}MB` }
    }

    return { valid: true }
  }

  const simulateUpload = useCallback(
    (file: File) => {
      setUploadProgress({ percentage: 0, status: "uploading", message: "Uploading file..." })

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev.percentage >= 100) {
            clearInterval(interval)
            const contentType = getContentTypeFromFile(file)!
            onFileSelected(file, contentType)
            return { percentage: 100, status: "complete", message: "Upload complete!" }
          }
          return {
            ...prev,
            percentage: prev.percentage + Math.random() * 15 + 5,
          }
        })
      }, 200)
    },
    [onFileSelected],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const validation = validateFile(file)
      if (!validation.valid) {
        setUploadProgress({
          percentage: 0,
          status: "error",
          message: validation.error,
        })
        return
      }

      setSelectedFile(file)
      simulateUpload(file)
    },
    [simulateUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: Object.fromEntries(acceptedTypes.flatMap((type) => SUPPORTED_FILE_TYPES[type].map((ext) => [ext, []]))),
  })

  const clearFile = () => {
    setSelectedFile(null)
    setUploadProgress({ percentage: 0, status: "idle" })
  }

  const getFileIcon = (file: File) => {
    const contentType = getContentTypeFromFile(file)
    const icons = {
      image: "🖼️",
      video: "🎥",
      audio: "🎵",
      document: "📄",
    }
    return icons[contentType || "document"]
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {!selectedFile && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {isDragActive ? "Drop your file here" : "Upload your content"}
              </h3>
              <p className="text-muted-foreground mb-4">Drag and drop your file here, or click to browse</p>
              <Button variant="outline">Choose File</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedFile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getFileIcon(selectedFile)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFile}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{getContentTypeFromFile(selectedFile)}</Badge>
                  <span className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</span>
                </div>

                {uploadProgress.status !== "idle" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {uploadProgress.status === "complete" && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {uploadProgress.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
                      <span className="text-sm">{uploadProgress.message}</span>
                    </div>
                    {uploadProgress.status === "uploading" && (
                      <Progress value={uploadProgress.percentage} className="h-2" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        <p className="mb-1">Supported file types:</p>
        <div className="flex flex-wrap gap-1">
          {acceptedTypes.flatMap((type) =>
            SUPPORTED_FILE_TYPES[type].map((ext) => (
              <Badge key={ext} variant="outline" className="text-xs">
                {ext}
              </Badge>
            )),
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Upload, FileText } from "lucide-react"

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  acceptedTypes?: Record<string, string[]>
  title?: string
  description?: string
}

export function FileUpload({
  files,
  onFilesChange,
  maxFiles = 5,
  acceptedTypes = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "text/plain": [".txt"],
    "application/zip": [".zip"],
    "application/x-rar-compressed": [".rar"],
  },
  title = "Upload Attachments",
  description = "Upload manuals, certificates, or other supporting documents",
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
      onFilesChange(newFiles)
    },
    [files, onFilesChange, maxFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles,
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
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
      {/* Upload Area */}
      {files.length < maxFiles && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-gray-300 dark:border-gray-600 hover:border-green-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="font-medium mb-1">{title}</p>
              <p className="text-sm text-gray-500 mb-3">{description}</p>
              <p className="text-xs text-gray-400">Supports: PDF, DOC, DOCX, TXT, ZIP, RAR (Max {maxFiles} files)</p>
              <Button type="button" variant="outline" size="sm" className="mt-3 bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Uploaded Files ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

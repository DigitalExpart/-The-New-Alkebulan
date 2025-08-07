"use client"

import { ContentUploadSection } from "@/components/content-upload/content-upload-section"
import { Upload, CheckCircle } from "lucide-react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ContentUpload } from "@/types/content-upload"

export default function ContentUploadPage() {
  const [uploadedContent, setUploadedContent] = useState<ContentUpload[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  const handleContentUploaded = (content: ContentUpload) => {
    setUploadedContent((prev) => [...prev, content])
    setShowSuccess(true)

    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000)

    console.log("Content uploaded:", content)
  }

  const handleDraftSaved = (draft: Partial<ContentUpload>) => {
    console.log("Draft saved:", draft)
    // In a real app, you would save this to localStorage or send to API
  }

  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-950">
      {/* Header */}
      <div className="bg-white dark:bg-green-900 border-b border-green-200 dark:border-green-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="h-8 w-8 text-green-600" />
            <h1 className="font-agrandir-bold text-3xl text-green-900 dark:text-white">Content Upload</h1>
          </div>
          <p className="text-green-700 dark:text-green-300 text-lg max-w-3xl">
            Share your knowledge, creativity, and insights with the diaspora community. Upload original content or
            import from your favorite social platforms.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="container mx-auto px-4 py-4">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Content Published Successfully!</h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Your content has been uploaded and is now available to the community.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowSuccess(false)} className="ml-auto">
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <ContentUploadSection onContentUploaded={handleContentUploaded} onDraftSaved={handleDraftSaved} />
      </div>

      {/* Recently Uploaded */}
      {uploadedContent.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Recently Uploaded Content</h3>
              <div className="space-y-3">
                {uploadedContent.slice(-3).map((content, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{content.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {content.contentType} • {content.subject} • {content.visibility}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

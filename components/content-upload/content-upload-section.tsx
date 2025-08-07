"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Link, Sparkles, CheckCircle } from "lucide-react"
import { FileUploadZone } from "./file-upload-zone"
import { SocialMediaImport } from "./social-media-import"
import { ContentMetadataForm } from "./content-metadata-form"
import type { ContentUpload, SocialMediaContent, ContentType } from "@/types/content-upload"

interface ContentUploadSectionProps {
  onContentUploaded?: (content: ContentUpload) => void
  onDraftSaved?: (draft: Partial<ContentUpload>) => void
}

export function ContentUploadSection({ onContentUploaded, onDraftSaved }: ContentUploadSectionProps) {
  const [currentStep, setCurrentStep] = useState<"upload" | "metadata">("upload")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [importedContent, setImportedContent] = useState<SocialMediaContent | null>(null)
  const [contentType, setContentType] = useState<ContentType>("article")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileSelected = (file: File, type: ContentType) => {
    setUploadedFile(file)
    setContentType(type)
    setCurrentStep("metadata")
  }

  const handleContentImported = (content: SocialMediaContent) => {
    setImportedContent(content)
    setContentType("link")
    setCurrentStep("metadata")
  }

  const handleSubmit = async (data: ContentUpload) => {
    setIsSubmitting(true)

    try {
      // Simulate upload process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const finalContent: ContentUpload = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        file: uploadedFile || undefined,
        socialMediaData: importedContent || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: "current-user-id",
      }

      onContentUploaded?.(finalContent)
      setUploadSuccess(true)

      // Reset form after success
      setTimeout(() => {
        setCurrentStep("upload")
        setUploadedFile(null)
        setImportedContent(null)
        setUploadSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = (data: Partial<ContentUpload>) => {
    const draft = {
      ...data,
      file: uploadedFile || undefined,
      socialMediaData: importedContent || undefined,
      updatedAt: new Date(),
    }
    onDraftSaved?.(draft)
  }

  const getInitialMetadata = (): Partial<ContentUpload> => {
    if (importedContent) {
      return {
        title: importedContent.title || "",
        description: importedContent.description || "",
        contentType: "link",
        socialMediaUrl: importedContent.originalUrl,
      }
    }

    if (uploadedFile) {
      return {
        title: uploadedFile.name.replace(/\.[^/.]+$/, ""),
        description: "",
        contentType,
      }
    }

    return {}
  }

  if (uploadSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Content Published Successfully!</h2>
          <p className="text-muted-foreground mb-4">
            Your content has been uploaded and is now available to the community.
          </p>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Published
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Upload Your Content</h1>
        <p className="text-lg text-muted-foreground">Inspire, share, and contribute to the hub.</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div
          className={`flex items-center gap-2 ${currentStep === "upload" ? "text-primary" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep === "upload" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
            }`}
          >
            1
          </div>
          <span className="font-medium">Upload Content</span>
        </div>
        <div className="w-12 h-px bg-border" />
        <div
          className={`flex items-center gap-2 ${currentStep === "metadata" ? "text-primary" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep === "metadata"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground"
            }`}
          >
            2
          </div>
          <span className="font-medium">Add Details</span>
        </div>
      </div>

      {currentStep === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Choose Upload Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Import from Social
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="mt-6">
                <FileUploadZone onFileSelected={handleFileSelected} />
              </TabsContent>

              <TabsContent value="social" className="mt-6">
                <SocialMediaImport onContentImported={handleContentImported} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {currentStep === "metadata" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Content Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContentMetadataForm
              initialData={getInitialMetadata()}
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

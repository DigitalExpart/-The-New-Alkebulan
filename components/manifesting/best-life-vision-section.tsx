"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ImageIcon, Wand2, Save, Edit3 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BestLifeVisionSectionProps {
  vision: {
    description: string
    moodboardImages: string[]
    aiGeneratedVision?: string
    lastUpdated: Date
  }
  onUpdate: (vision: any) => void
}

export function BestLifeVisionSection({ vision, onUpdate }: BestLifeVisionSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(vision.description)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [desires, setDesires] = useState<string[]>(["", "", ""])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSave = () => {
    onUpdate({
      ...vision,
      description,
      lastUpdated: new Date(),
    })
    setIsEditing(false)
  }

  const handleGenerateAIVision = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      const aiVision = `I envision a life where ${desires.filter((d) => d.trim()).join(", ")} come together harmoniously. I see myself waking up each day with purpose and excitement, surrounded by loving relationships and meaningful work. My days are filled with creativity, growth, and contribution to something greater than myself. I live in alignment with my values, making decisions from a place of wisdom and intuition. Financial abundance flows naturally as I share my gifts with the world. I am healthy, vibrant, and deeply connected to my spiritual essence.`

      onUpdate({
        ...vision,
        aiGeneratedVision: aiVision,
        lastUpdated: new Date(),
      })
      setIsGenerating(false)
      setShowAIDialog(false)
    }, 2000)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you'd upload these to a storage service
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      onUpdate({
        ...vision,
        moodboardImages: [...vision.moodboardImages, ...newImages],
        lastUpdated: new Date(),
      })
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
          <Sparkles className="w-5 h-5" />
          Best Life Vision
          <Badge variant="secondary" className="ml-auto">
            {vision.description ? "Complete" : "Pending"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vision Description */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Your Ideal Life Vision</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your ideal life in vivid detail. What does it look like, feel like, and include?"
                className="min-h-[120px] resize-none"
              />
              <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                <Save className="w-4 h-4 mr-2" />
                Save Vision
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-purple-200 dark:border-purple-700">
              {vision.description ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{vision.description}</p>
              ) : (
                <p className="text-gray-500 italic">Start by describing your ideal life vision...</p>
              )}
            </div>
          )}
        </div>

        {/* AI Generated Vision */}
        {vision.aiGeneratedVision && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              AI-Generated Vision
            </Label>
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{vision.aiGeneratedVision}</p>
            </div>
          </div>
        )}

        {/* AI Vision Generator */}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Vision with AI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>AI Vision Generator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share 3 key desires or areas of focus for your ideal life:
              </p>
              {desires.map((desire, index) => (
                <div key={index}>
                  <Label className="text-sm">Desire {index + 1}</Label>
                  <Input
                    value={desire}
                    onChange={(e) => {
                      const newDesires = [...desires]
                      newDesires[index] = e.target.value
                      setDesires(newDesires)
                    }}
                    placeholder={`e.g., ${["Financial freedom", "Meaningful relationships", "Creative fulfillment"][index]}`}
                  />
                </div>
              ))}
              <Button
                onClick={handleGenerateAIVision}
                disabled={isGenerating || desires.filter((d) => d.trim()).length < 2}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Vision
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Moodboard Images */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Vision Moodboard
          </Label>

          {vision.moodboardImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {vision.moodboardImages.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Vision image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="moodboard-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("moodboard-upload")?.click()}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Images
            </Button>
          </div>
        </div>

        {vision.lastUpdated && (
          <p className="text-xs text-gray-500 text-right">Last updated: {vision.lastUpdated.toLocaleDateString()}</p>
        )}
      </CardContent>
    </Card>
  )
}

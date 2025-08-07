"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Save, Edit3, Download } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { exportToPDF } from "@/utils/manifesting-helpers"

interface AutobiographySectionProps {
  autobiography: {
    content: string
    futureVision: string
    lastUpdated: Date
  }
  onUpdate: (autobiography: any) => void
}

export function AutobiographySection({ autobiography, onUpdate }: AutobiographySectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(autobiography.content)
  const [futureVision, setFutureVision] = useState(autobiography.futureVision)
  const [activeTab, setActiveTab] = useState("life-story")

  const handleSave = () => {
    onUpdate({
      content,
      futureVision,
      lastUpdated: new Date(),
    })
    setIsEditing(false)
  }

  const handleExport = () => {
    const exportData = {
      autobiography: {
        content,
        futureVision,
        lastUpdated: new Date(),
      },
    }
    exportToPDF(exportData)
  }

  const wordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <BookOpen className="w-5 h-5" />
          My Autobiography
          <Badge variant="secondary" className="ml-auto">
            {content || futureVision ? "In Progress" : "Not Started"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Document your life story and envision your future chapters
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-amber-600 hover:text-amber-700"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            {(content || futureVision) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="life-story">Life Story</TabsTrigger>
            <TabsTrigger value="future-vision">Future Vision</TabsTrigger>
          </TabsList>

          <TabsContent value="life-story" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Your Life Story</Label>
                {content && (
                  <Badge variant="outline" className="text-xs">
                    {wordCount(content)} words
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your life story... Where did you come from? What experiences shaped you? What challenges have you overcome? What are you proud of?"
                    className="min-h-[300px] resize-none"
                  />
                  <div className="text-xs text-gray-500">
                    Tip: Include your childhood, formative experiences, achievements, challenges, and lessons learned.
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200 dark:border-amber-700">
                  {content ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Start writing your life story...</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="future-vision" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Future Chapters</Label>
                {futureVision && (
                  <Badge variant="outline" className="text-xs">
                    {wordCount(futureVision)} words
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={futureVision}
                    onChange={(e) => setFutureVision(e.target.value)}
                    placeholder="Envision your future chapters... What story do you want to write? What legacy do you want to leave? How do you see yourself growing and evolving?"
                    className="min-h-[300px] resize-none"
                  />
                  <div className="text-xs text-gray-500">
                    Tip: Write about your future self, the impact you want to make, and the person you're becoming.
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200 dark:border-amber-700">
                  {futureVision ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {futureVision}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Envision your future chapters...</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {isEditing && (
          <Button onClick={handleSave} className="w-full bg-amber-600 hover:bg-amber-700">
            <Save className="w-4 h-4 mr-2" />
            Save Autobiography
          </Button>
        )}

        {autobiography.lastUpdated && (
          <p className="text-xs text-gray-500 text-right">
            Last updated: {autobiography.lastUpdated.toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

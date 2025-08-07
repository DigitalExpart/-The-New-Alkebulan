"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Heart, Plus, Star, Wand2, Trash2, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Affirmation, AffirmationCategory } from "@/types/manifesting"
import { affirmationCategories } from "@/data/manifesting-data"
import { generateAIAffirmations } from "@/utils/manifesting-helpers"

interface AffirmationsSectionProps {
  affirmations: {
    personal: Affirmation[]
    dailyFocus?: string
    aiGenerated: Affirmation[]
    lastUpdated: Date
  }
  onUpdate: (affirmations: any) => void
}

export function AffirmationsSection({ affirmations, onUpdate }: AffirmationsSectionProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [newAffirmation, setNewAffirmation] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory>("abundance")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const handleCreateAffirmation = () => {
    const affirmation: Affirmation = {
      id: Date.now().toString(),
      text: newAffirmation,
      category: selectedCategory,
      isActive: false,
      createdAt: new Date(),
      source: "personal",
    }

    const updatedAffirmations = {
      ...affirmations,
      personal: [...affirmations.personal, affirmation],
      lastUpdated: new Date(),
    }

    onUpdate(updatedAffirmations)
    setNewAffirmation("")
    setShowCreateDialog(false)
  }

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true)
    // Simulate AI generation
    setTimeout(() => {
      const generated = generateAIAffirmations(selectedCategory, [])
      const updatedAffirmations = {
        ...affirmations,
        aiGenerated: [...affirmations.aiGenerated, ...generated],
        lastUpdated: new Date(),
      }
      onUpdate(updatedAffirmations)
      setIsGeneratingAI(false)
      setShowAIDialog(false)
    }, 2000)
  }

  const handleSetDailyFocus = (affirmationText: string) => {
    onUpdate({
      ...affirmations,
      dailyFocus: affirmationText,
      lastUpdated: new Date(),
    })
  }

  const handleDeleteAffirmation = (id: string, source: "personal" | "ai") => {
    const key = source === "personal" ? "personal" : "aiGenerated"
    const updatedAffirmations = {
      ...affirmations,
      [key]: affirmations[key].filter((a) => a.id !== id),
      lastUpdated: new Date(),
    }
    onUpdate(updatedAffirmations)
  }

  const handleCopyAffirmation = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getCategoryInfo = (category: AffirmationCategory) => {
    return affirmationCategories.find((cat) => cat.value === category) || affirmationCategories[0]
  }

  const allAffirmations = [...affirmations.personal, ...affirmations.aiGenerated]

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
          <Heart className="w-5 h-5" />
          Affirmations
          <Badge variant="secondary" className="ml-auto">
            {allAffirmations.length} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Focus Affirmation */}
        {affirmations.dailyFocus && (
          <div className="p-4 bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-lg border border-rose-200 dark:border-rose-700">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-rose-600" />
              <Label className="text-sm font-medium text-rose-800 dark:text-rose-200">Today's Focus</Label>
            </div>
            <p className="text-rose-700 dark:text-rose-300 font-medium">{affirmations.dailyFocus}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Affirmation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Personal Affirmation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value as AffirmationCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {affirmationCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Affirmation Text</Label>
                  <Input
                    value={newAffirmation}
                    onChange={(e) => setNewAffirmation(e.target.value)}
                    placeholder="I am worthy of abundance and success..."
                  />
                </div>
                <Button
                  onClick={handleCreateAffirmation}
                  disabled={!newAffirmation.trim()}
                  className="w-full bg-rose-600 hover:bg-rose-700"
                >
                  Create Affirmation
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>AI Affirmation Generator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value as AffirmationCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {affirmationCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate personalized affirmations based on your selected category.
                </p>
                <Button
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="w-full bg-rose-600 hover:bg-rose-700"
                >
                  {isGeneratingAI ? (
                    <>
                      <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Affirmations
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Affirmations List */}
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({allAffirmations.length})</TabsTrigger>
            <TabsTrigger value="personal">Personal ({affirmations.personal.length})</TabsTrigger>
            <TabsTrigger value="ai">AI Generated ({affirmations.aiGenerated.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {allAffirmations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No affirmations created yet.</p>
                <p className="text-sm">Create your first affirmation to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allAffirmations.map((affirmation) => {
                  const categoryInfo = getCategoryInfo(affirmation.category)
                  return (
                    <div
                      key={affirmation.id}
                      className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-rose-200 dark:border-rose-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              <span className="mr-1">{categoryInfo.icon}</span>
                              {categoryInfo.label}
                            </Badge>
                            <Badge variant={affirmation.source === "ai" ? "secondary" : "default"} className="text-xs">
                              {affirmation.source === "ai" ? "AI" : "Personal"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{affirmation.text}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDailyFocus(affirmation.text)}
                            className="text-yellow-500 hover:text-yellow-600"
                            title="Set as daily focus"
                          >
                            <Star className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyAffirmation(affirmation.text)}
                            className="text-gray-500 hover:text-gray-600"
                            title="Copy affirmation"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAffirmation(affirmation.id, affirmation.source)}
                            className="text-red-500 hover:text-red-600"
                            title="Delete affirmation"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="personal" className="space-y-2">
            {affirmations.personal.map((affirmation) => {
              const categoryInfo = getCategoryInfo(affirmation.category)
              return (
                <div
                  key={affirmation.id}
                  className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-rose-200 dark:border-rose-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          <span className="mr-1">{categoryInfo.icon}</span>
                          {categoryInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{affirmation.text}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDailyFocus(affirmation.text)}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAffirmation(affirmation.id, "personal")}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </TabsContent>

          <TabsContent value="ai" className="space-y-2">
            {affirmations.aiGenerated.map((affirmation) => {
              const categoryInfo = getCategoryInfo(affirmation.category)
              return (
                <div
                  key={affirmation.id}
                  className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-rose-200 dark:border-rose-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          <span className="mr-1">{categoryInfo.icon}</span>
                          {categoryInfo.label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          AI
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{affirmation.text}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDailyFocus(affirmation.text)}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAffirmation(affirmation.id, "ai")}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </TabsContent>
        </Tabs>

        {affirmations.lastUpdated && (
          <p className="text-xs text-gray-500 text-right">
            Last updated: {affirmations.lastUpdated.toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

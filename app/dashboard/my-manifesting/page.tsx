"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Target, BookOpen, Brain, Heart, ImageIcon, Video, Palette, Headphones } from "lucide-react"
import { BestLifeVisionSection } from "@/components/manifesting/best-life-vision-section"
import { LongTermGoalsSection } from "@/components/manifesting/long-term-goals-section"
import { AutobiographySection } from "@/components/manifesting/autobiography-section"
import { MeditationsSection } from "@/components/manifesting/meditations-section"
import { AffirmationsSection } from "@/components/manifesting/affirmations-section"
import type { ManifestingData } from "@/types/manifesting"
import { getManifestingProgress } from "@/utils/manifesting-helpers"

export default function MyManifestingPage() {
  const [manifestingData, setManifestingData] = useState<ManifestingData>({
    id: "1",
    userId: "1",
    bestLifeVision: {
      description: "",
      moodboardImages: [],
      lastUpdated: new Date(),
    },
    longTermGoals: {
      oneYear: [],
      fiveYear: [],
      tenYear: [],
      lastUpdated: new Date(),
    },
    autobiography: {
      content: "",
      futureVision: "",
      lastUpdated: new Date(),
    },
    meditations: {
      saved: [],
      bookmarked: [],
      dailyReminder: false,
      lastUpdated: new Date(),
    },
    affirmations: {
      personal: [],
      aiGenerated: [],
      lastUpdated: new Date(),
    },
    visualGallery: {
      images: [],
      tags: [],
      displayMode: "grid",
      lastUpdated: new Date(),
    },
    visionVideos: {
      videos: [],
      dailyReminder: false,
      lastUpdated: new Date(),
    },
    customizedVisuals: {
      artwork: [],
      favorites: [],
      lastUpdated: new Date(),
    },
    hypnotherapy: {
      sessions: [],
      journalEntries: [],
      lastUpdated: new Date(),
    },
    privacy: {},
    dailyRoutine: {
      enabled: false,
      reminders: [],
      quickAccess: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("manifesting-data")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Convert date strings back to Date objects
        const convertDates = (obj: any): any => {
          if (obj && typeof obj === "object") {
            if (obj.lastUpdated) obj.lastUpdated = new Date(obj.lastUpdated)
            if (obj.createdAt) obj.createdAt = new Date(obj.createdAt)
            if (obj.updatedAt) obj.updatedAt = new Date(obj.updatedAt)
            Object.keys(obj).forEach((key) => {
              if (typeof obj[key] === "object") {
                obj[key] = convertDates(obj[key])
              }
            })
          }
          return obj
        }
        setManifestingData(convertDates(parsed))
      } catch (error) {
        console.error("Error loading manifesting data:", error)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("manifesting-data", JSON.stringify(manifestingData))
  }, [manifestingData])

  const handleUpdateSection = (section: keyof ManifestingData, data: any) => {
    setManifestingData((prev) => ({
      ...prev,
      [section]: data,
      updatedAt: new Date(),
    }))
  }

  const progress = getManifestingProgress(manifestingData)

  const sectionStats = [
    { name: "Vision", icon: Sparkles, progress: progress.sections.vision, color: "text-purple-600" },
    { name: "Goals", icon: Target, progress: progress.sections.goals, color: "text-blue-600" },
    { name: "Story", icon: BookOpen, progress: progress.sections.autobiography, color: "text-amber-600" },
    { name: "Meditations", icon: Brain, progress: progress.sections.meditations, color: "text-green-600" },
    { name: "Affirmations", icon: Heart, progress: progress.sections.affirmations, color: "text-rose-600" },
    { name: "Gallery", icon: ImageIcon, progress: progress.sections.gallery, color: "text-cyan-600" },
    { name: "Videos", icon: Video, progress: progress.sections.videos, color: "text-indigo-600" },
    { name: "Visuals", icon: Palette, progress: progress.sections.visuals, color: "text-orange-600" },
    { name: "Hypnotherapy", icon: Headphones, progress: progress.sections.hypnotherapy, color: "text-teal-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Manifesting</h1>
              <p className="text-gray-600 dark:text-gray-400">Create, visualize, and manifest your ideal life</p>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Manifestation Journey Progress</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {progress.overall}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress.overall} className="h-3 mb-4" />
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
                {sectionStats.map((stat) => (
                  <div key={stat.name} className="text-center">
                    <div
                      className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${stat.progress === 100 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                    >
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{stat.name}</div>
                    <div className="text-xs text-gray-500">{stat.progress}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manifesting Sections */}
        <div className="space-y-8">
          {/* Best Life Vision */}
          <BestLifeVisionSection
            vision={manifestingData.bestLifeVision}
            onUpdate={(data) => handleUpdateSection("bestLifeVision", data)}
          />

          {/* Long-Term Goals */}
          <LongTermGoalsSection
            goals={manifestingData.longTermGoals}
            onUpdate={(data) => handleUpdateSection("longTermGoals", data)}
          />

          {/* Autobiography */}
          <AutobiographySection
            autobiography={manifestingData.autobiography}
            onUpdate={(data) => handleUpdateSection("autobiography", data)}
          />

          {/* Meditations */}
          <MeditationsSection
            meditations={manifestingData.meditations}
            onUpdate={(data) => handleUpdateSection("meditations", data)}
          />

          {/* Affirmations */}
          <AffirmationsSection
            affirmations={manifestingData.affirmations}
            onUpdate={(data) => handleUpdateSection("affirmations", data)}
          />

          {/* Coming Soon Sections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Visual Gallery",
                icon: ImageIcon,
                description: "Vision board and dream images",
                color: "from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20",
              },
              {
                title: "Vision Videos",
                icon: Video,
                description: "Personal vision movies",
                color: "from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20",
              },
              {
                title: "Custom Visuals",
                icon: Palette,
                description: "AI-generated artwork",
                color: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
              },
              {
                title: "Hypnotherapy",
                icon: Headphones,
                description: "Guided sessions & journaling",
                color: "from-teal-50 to-green-50 dark:from-teal-950/20 dark:to-green-950/20",
              },
            ].map((section) => (
              <Card
                key={section.title}
                className={`bg-gradient-to-br ${section.color} border-gray-200 dark:border-gray-700`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <section.icon className="w-5 h-5" />
                    {section.title}
                    <Badge variant="outline" className="ml-auto">
                      Coming Soon
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Sparkles, Calculator, Calendar, Moon, Star, BookOpen } from "lucide-react"
import Link from "next/link"
import { NumerologyInputForm } from "@/components/numerology/numerology-input-form"
import { CoreNumbersDisplay } from "@/components/numerology/core-numbers-display"
import { PersonalYearCycle } from "@/components/numerology/personal-year-cycle"
import { DailyVibesTracker } from "@/components/numerology/daily-vibes-tracker"
import { NumerologyChart } from "@/components/numerology/numerology-chart"
import { SpiritualIntegration } from "@/components/numerology/spiritual-integration"
import {
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculateSoulUrgeNumber,
  calculatePersonalityNumber,
  calculateBirthdayNumber,
  calculatePersonalYear,
  calculatePersonalMonth,
  calculatePersonalDay,
} from "@/utils/numerology-calculator"
import type { NumerologyProfile } from "@/types/numerology"

export default function NumerologyPage() {
  const [profile, setProfile] = useState<NumerologyProfile | null>(null)
  const [isCalculated, setIsCalculated] = useState(false)

  useEffect(() => {
    // Load saved profile from localStorage
    const saved = localStorage.getItem("numerologyProfile")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const convertedProfile = {
          ...parsed,
          birthDate: new Date(parsed.birthDate),
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
        }
        setProfile(convertedProfile)
        setIsCalculated(true)
      } catch (error) {
        console.error("Failed to parse numerology profile:", error)
      }
    }
  }, [])

  const handleCalculate = (data: { fullName: string; birthDate: Date }) => {
    const currentYear = new Date().getFullYear()
    const currentDate = new Date()

    const coreNumbers = {
      lifePathNumber: calculateLifePathNumber(data.birthDate),
      destinyNumber: calculateDestinyNumber(data.fullName),
      soulUrgeNumber: calculateSoulUrgeNumber(data.fullName),
      personalityNumber: calculatePersonalityNumber(data.fullName),
      birthdayNumber: calculateBirthdayNumber(data.birthDate),
    }

    const currentCycles = {
      personalYear: calculatePersonalYear(data.birthDate, currentYear),
      personalMonth: calculatePersonalMonth(data.birthDate, currentYear, currentDate.getMonth() + 1),
      personalDay: calculatePersonalDay(data.birthDate, currentDate),
      year: currentYear,
    }

    const newProfile: NumerologyProfile = {
      id: "user-numerology-1",
      userId: "current-user",
      fullNameAtBirth: data.fullName,
      birthDate: data.birthDate,
      coreNumbers,
      currentCycles,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setProfile(newProfile)
    setIsCalculated(true)
    localStorage.setItem("numerologyProfile", JSON.stringify(newProfile))
  }

  const resetCalculation = () => {
    setProfile(null)
    setIsCalculated(false)
    localStorage.removeItem("numerologyProfile")
  }

  if (!isCalculated || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/dashboard/my-journey"
                className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to My Journey
              </Link>

              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Sparkles className="h-12 w-12" />
                  <h1 className="font-bold text-4xl md:text-5xl">✨ Numerology</h1>
                </div>
                <p className="text-xl md:text-2xl font-medium mb-6">Discover the mystical patterns in your numbers</p>
                <p className="text-lg text-purple-100 mb-8 max-w-3xl mx-auto">
                  Unlock the ancient wisdom of numbers to understand your life path, purpose, and spiritual journey.
                  Your birth date and name hold the keys to your soul's blueprint.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <NumerologyInputForm onCalculate={handleCalculate} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/dashboard/my-journey"
              className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Journey
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-8 w-8" />
                  <h1 className="font-bold text-3xl md:text-4xl">Your Numerology Profile</h1>
                </div>
                <p className="text-purple-100 mb-4">
                  {profile.fullNameAtBirth} • Born {profile.birthDate.toLocaleDateString()}
                </p>
                <div className="flex items-center gap-4">
                  <Badge className="bg-white/20 text-white">Life Path {profile.coreNumbers.lifePathNumber}</Badge>
                  <Badge className="bg-white/20 text-white">Personal Year {profile.currentCycles.personalYear}</Badge>
                </div>
              </div>
              <Button
                onClick={resetCalculation}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Recalculate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="core-numbers" className="space-y-8">
            <TabsList className="grid w-full grid-cols-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <TabsTrigger value="core-numbers" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Core Numbers</span>
              </TabsTrigger>
              <TabsTrigger value="personal-year" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Personal Year</span>
              </TabsTrigger>
              <TabsTrigger value="daily-vibes" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">Daily Vibes</span>
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Chart</span>
              </TabsTrigger>
              <TabsTrigger value="spiritual" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Spiritual</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="core-numbers">
              <CoreNumbersDisplay
                coreNumbers={profile.coreNumbers}
                fullName={profile.fullNameAtBirth}
                birthDate={profile.birthDate}
              />
            </TabsContent>

            <TabsContent value="personal-year">
              <PersonalYearCycle currentCycles={profile.currentCycles} />
            </TabsContent>

            <TabsContent value="daily-vibes">
              <DailyVibesTracker birthDate={profile.birthDate} />
            </TabsContent>

            <TabsContent value="chart">
              <NumerologyChart
                coreNumbers={profile.coreNumbers}
                currentCycles={profile.currentCycles}
                fullName={profile.fullNameAtBirth}
                birthDate={profile.birthDate}
              />
            </TabsContent>

            <TabsContent value="spiritual">
              <SpiritualIntegration coreNumbers={profile.coreNumbers} />
            </TabsContent>

            <TabsContent value="insights">
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="text-center text-amber-900 dark:text-amber-100">
                    Personal Insights & Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-amber-700 dark:text-amber-300 mb-6">
                      Based on your numerological profile, here are some key insights about your life patterns and
                      spiritual journey.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">Life Themes</h3>
                      <ul className="space-y-2 text-amber-700 dark:text-amber-300">
                        <li>
                          • Your Life Path {profile.coreNumbers.lifePathNumber} suggests a journey of personal growth
                          and leadership
                        </li>
                        <li>
                          • Your Destiny {profile.coreNumbers.destinyNumber} indicates your mission involves creative
                          expression
                        </li>
                        <li>
                          • Your Soul Urge {profile.coreNumbers.soulUrgeNumber} reveals deep desires for harmony and
                          connection
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">Current Focus</h3>
                      <ul className="space-y-2 text-amber-700 dark:text-amber-300">
                        <li>
                          • Personal Year {profile.currentCycles.personalYear} brings opportunities for new beginnings
                        </li>
                        <li>• This is an ideal time for taking initiative and starting fresh projects</li>
                        <li>• Focus on developing your leadership abilities and trusting your instincts</li>
                      </ul>
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-lg">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      Your Numerological Affirmation
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 italic text-lg">
                      "I trust in the divine timing of my life path and embrace the unique gifts my numbers reveal. I am
                      aligned with my soul's purpose and open to the wisdom the universe provides through sacred
                      numbers."
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

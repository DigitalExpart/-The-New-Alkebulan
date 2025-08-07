"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp, Target, Lightbulb } from "lucide-react"
import { personalYearMeanings } from "@/data/numerology-meanings"
import { getNumberColor } from "@/utils/numerology-calculator"
import type { CurrentCycles } from "@/types/numerology"

interface PersonalYearCycleProps {
  currentCycles: CurrentCycles
}

export function PersonalYearCycle({ currentCycles }: PersonalYearCycleProps) {
  const personalYearMeaning = personalYearMeanings.find((meaning) => meaning.number === currentCycles.personalYear)

  if (!personalYearMeaning) return null

  const yearProgress = ((new Date().getMonth() + 1) / 12) * 100
  const numberColor = getNumberColor(currentCycles.personalYear)

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">Your Personal Year Cycle</h2>
        <p className="text-purple-700 dark:text-purple-300">Understanding the energy and themes of your current year</p>
      </div>

      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg"
              style={{ backgroundColor: numberColor }}
            >
              {currentCycles.personalYear}
            </div>
            <div className="text-left">
              <CardTitle className="text-2xl text-indigo-900 dark:text-indigo-100">
                {personalYearMeaning.title}
              </CardTitle>
              <p className="text-indigo-700 dark:text-indigo-300">
                Personal Year {currentCycles.personalYear} • {currentCycles.year}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-indigo-600 dark:text-indigo-400">
              <span>Year Progress</span>
              <span>{Math.round(yearProgress)}%</span>
            </div>
            <Progress value={yearProgress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Year Overview
            </h3>
            <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed">{personalYearMeaning.description}</p>
          </div>

          <div>
            <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Key Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {personalYearMeaning.themes.map((theme, index) => (
                <Badge key={index} className="text-white" style={{ backgroundColor: numberColor }}>
                  {theme}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Focus Areas
              </h3>
              <ul className="space-y-2">
                {personalYearMeaning.focus.map((item, index) => (
                  <li key={index} className="text-sm text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Opportunities
              </h3>
              <ul className="space-y-2">
                {personalYearMeaning.opportunities.map((item, index) => (
                  <li key={index} className="text-sm text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-4">
            <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">Guidance for This Year</h3>
            <p className="text-indigo-700 dark:text-indigo-300 italic">"{personalYearMeaning.advice}"</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                {currentCycles.personalMonth}
              </div>
              <div className="text-sm text-indigo-600 dark:text-indigo-400">Personal Month</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="text-lg font-bold text-indigo-900 dark:text-indigo-100">{currentCycles.personalDay}</div>
              <div className="text-sm text-indigo-600 dark:text-indigo-400">Personal Day</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

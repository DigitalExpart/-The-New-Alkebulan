"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Heart, User, Calendar } from "lucide-react"
import { getNumberColor } from "@/utils/numerology-calculator"
import type { CoreNumbers, CurrentCycles } from "@/types/numerology"

interface NumerologyChartProps {
  coreNumbers: CoreNumbers
  currentCycles: CurrentCycles
  fullName: string
  birthDate: Date
}

export function NumerologyChart({ coreNumbers, currentCycles, fullName, birthDate }: NumerologyChartProps) {
  const chartData = [
    {
      category: "Core Identity",
      icon: User,
      numbers: [
        { label: "Life Path", value: coreNumbers.lifePathNumber, description: "Your life's journey" },
        { label: "Destiny", value: coreNumbers.destinyNumber, description: "Your life's mission" },
      ],
    },
    {
      category: "Inner Self",
      icon: Heart,
      numbers: [
        { label: "Soul Urge", value: coreNumbers.soulUrgeNumber, description: "Your inner desires" },
        { label: "Birthday", value: coreNumbers.birthdayNumber, description: "Your special gifts" },
      ],
    },
    {
      category: "Outer Expression",
      icon: Sparkles,
      numbers: [{ label: "Personality", value: coreNumbers.personalityNumber, description: "How others see you" }],
    },
    {
      category: "Current Cycles",
      icon: Calendar,
      numbers: [
        { label: "Personal Year", value: currentCycles.personalYear, description: "This year's theme" },
        { label: "Personal Month", value: currentCycles.personalMonth, description: "This month's energy" },
        { label: "Personal Day", value: currentCycles.personalDay, description: "Today's vibration" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">Your Numerology Chart</h2>
        <p className="text-purple-700 dark:text-purple-300">
          A visual map of your numerological influences and connections
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {chartData.map((category, categoryIndex) => (
          <Card
            key={categoryIndex}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                <category.icon className="h-5 w-5" />
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.numbers.map((number, numberIndex) => (
                  <div
                    key={numberIndex}
                    className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: getNumberColor(number.value) }}
                      >
                        {number.value}
                      </div>
                      <div>
                        <div className="font-medium text-purple-900 dark:text-purple-100">{number.label}</div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">{number.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Numerology Wheel Visualization */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="text-center text-indigo-900 dark:text-indigo-100">Your Numerological Wheel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-80 h-80 mx-auto">
            {/* Center circle with Life Path */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ backgroundColor: getNumberColor(coreNumbers.lifePathNumber) }}
              >
                {coreNumbers.lifePathNumber}
              </div>
              <div className="text-center mt-2 text-sm font-medium text-indigo-800 dark:text-indigo-200">Life Path</div>
            </div>

            {/* Surrounding numbers */}
            {[
              { number: coreNumbers.destinyNumber, label: "Destiny", angle: 0 },
              { number: coreNumbers.soulUrgeNumber, label: "Soul Urge", angle: 72 },
              { number: coreNumbers.personalityNumber, label: "Personality", angle: 144 },
              { number: coreNumbers.birthdayNumber, label: "Birthday", angle: 216 },
              { number: currentCycles.personalYear, label: "Personal Year", angle: 288 },
            ].map((item, index) => {
              const radius = 120
              const x = Math.cos((item.angle * Math.PI) / 180) * radius
              const y = Math.sin((item.angle * Math.PI) / 180) * radius

              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                    style={{ backgroundColor: getNumberColor(item.number) }}
                  >
                    {item.number}
                  </div>
                  <div className="text-center mt-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Number Connections */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-900 dark:text-purple-100">Number Connections & Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Dominant Numbers</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set([
                      coreNumbers.lifePathNumber,
                      coreNumbers.destinyNumber,
                      coreNumbers.soulUrgeNumber,
                      coreNumbers.personalityNumber,
                      coreNumbers.birthdayNumber,
                    ]),
                  ).map((number, index) => (
                    <Badge key={index} className="text-white" style={{ backgroundColor: getNumberColor(number) }}>
                      {number}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">Current Influences</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-indigo-700 dark:text-indigo-300">Year Energy:</span>
                    <Badge
                      className="text-white"
                      style={{ backgroundColor: getNumberColor(currentCycles.personalYear) }}
                    >
                      {currentCycles.personalYear}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-indigo-700 dark:text-indigo-300">Month Energy:</span>
                    <Badge
                      className="text-white"
                      style={{ backgroundColor: getNumberColor(currentCycles.personalMonth) }}
                    >
                      {currentCycles.personalMonth}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-indigo-700 dark:text-indigo-300">Daily Energy:</span>
                    <Badge
                      className="text-white"
                      style={{ backgroundColor: getNumberColor(currentCycles.personalDay) }}
                    >
                      {currentCycles.personalDay}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

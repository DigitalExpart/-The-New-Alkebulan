"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calculator, Calendar, Star, TrendingUp, AlertCircle } from "lucide-react"
import { calculateLifePathNumber, formatBirthDate, getAgeFromBirthDate } from "@/utils/numerology"
import { numerologyInsights } from "@/data/journey-data"

interface NumerologySectionProps {
  birthDate?: Date
  lifePathNumber?: number
  onSave: (data: { birthDate: Date; lifePathNumber: number }) => void
}

export function NumerologySection({ birthDate, lifePathNumber, onSave }: NumerologySectionProps) {
  const [inputDate, setInputDate] = useState(birthDate ? birthDate.toISOString().split("T")[0] : "")
  const [calculatedNumber, setCalculatedNumber] = useState<number | null>(lifePathNumber || null)

  const handleCalculate = () => {
    if (!inputDate) return

    const date = new Date(inputDate)
    const lifePathNum = calculateLifePathNumber(date)

    setCalculatedNumber(lifePathNum)
    onSave({
      birthDate: date,
      lifePathNumber: lifePathNum,
    })
  }

  const insight = calculatedNumber ? numerologyInsights[calculatedNumber] : null

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-blue-900 dark:text-blue-100">Numerology</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Birth Date Input */}
        <div className="space-y-3">
          <Label htmlFor="birth-date" className="text-blue-800 dark:text-blue-200 font-medium">
            Date of Birth
          </Label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                id="birth-date"
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="bg-white/50 dark:bg-gray-800/50 border-blue-200 dark:border-blue-700 focus:border-blue-400 dark:focus:border-blue-500"
              />
            </div>
            <Button
              onClick={handleCalculate}
              disabled={!inputDate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate
            </Button>
          </div>
        </div>

        {/* Birth Date Display */}
        {birthDate && (
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200 font-medium">Your Birth Information</span>
            </div>
            <p className="text-blue-900 dark:text-blue-100">Born: {formatBirthDate(birthDate)}</p>
            <p className="text-blue-700 dark:text-blue-300 text-sm">Age: {getAgeFromBirthDate(birthDate)} years</p>
          </div>
        )}

        {/* Life Path Number Display */}
        {calculatedNumber && insight && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl">
                <span className="text-3xl">{insight.icon}</span>
                <div className="text-left">
                  <div className="text-2xl font-bold">Life Path {calculatedNumber}</div>
                  <div className="text-blue-100">{insight.title}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-blue-900 dark:text-blue-100 leading-relaxed text-center">{insight.description}</p>
            </div>

            {/* Traits */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200 font-medium">Your Strengths</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {insight.traits.map((trait, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Challenges */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-orange-800 dark:text-orange-200 font-medium">Growth Areas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {insight.challenges.map((challenge, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-300"
                  >
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Learn More */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200 font-medium text-sm">Want to learn more?</span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Explore our numerology learning content to dive deeper into your numbers and their meanings.
              </p>
            </div>
          </div>
        )}

        {/* No calculation yet */}
        {!calculatedNumber && (
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <p className="text-blue-600 dark:text-blue-400">
              Enter your birth date to discover your Life Path Number and unlock insights about your personality and
              life purpose.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

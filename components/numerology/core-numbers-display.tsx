"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { numberMeanings } from "@/data/numerology-meanings"
import { getNumberColor } from "@/utils/numerology-calculator"
import type { CoreNumbers } from "@/types/numerology"

interface CoreNumbersDisplayProps {
  coreNumbers: CoreNumbers
  fullName: string
  birthDate: Date
}

export function CoreNumbersDisplay({ coreNumbers, fullName, birthDate }: CoreNumbersDisplayProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const numberCards = [
    {
      id: "lifePath",
      title: "Life Path Number",
      number: coreNumbers.lifePathNumber,
      description: "Your life's purpose and the path you're meant to walk",
      calculation: `Birth Date: ${birthDate.toLocaleDateString()}`,
    },
    {
      id: "destiny",
      title: "Destiny Number",
      number: coreNumbers.destinyNumber,
      description: "Your life's mission and what you're meant to accomplish",
      calculation: `Full Name: ${fullName}`,
    },
    {
      id: "soulUrge",
      title: "Soul Urge Number",
      number: coreNumbers.soulUrgeNumber,
      description: "Your inner desires and what motivates you from within",
      calculation: "Based on vowels in your name",
    },
    {
      id: "personality",
      title: "Personality Number",
      number: coreNumbers.personalityNumber,
      description: "How others perceive you and your outer personality",
      calculation: "Based on consonants in your name",
    },
    {
      id: "birthday",
      title: "Birthday Number",
      number: coreNumbers.birthdayNumber,
      description: "Special talents and abilities you possess",
      calculation: `Birth Day: ${birthDate.getDate()}`,
    },
  ]

  const toggleExpanded = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId)
  }

  const getNumberMeaning = (number: number) => {
    return numberMeanings.find((meaning) => meaning.number === number)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">Your Core Numbers</h2>
        <p className="text-purple-700 dark:text-purple-300">
          These five numbers form the foundation of your numerological profile
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {numberCards.map((card) => {
          const meaning = getNumberMeaning(card.number)
          const isExpanded = expandedCard === card.id
          const numberColor = getNumberColor(card.number)

          return (
            <Card
              key={card.id}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                    style={{ backgroundColor: numberColor }}
                  >
                    {meaning?.icon || card.number}
                  </div>
                </div>
                <CardTitle className="text-lg text-purple-900 dark:text-purple-100">{card.title}</CardTitle>
                <div className="flex items-center justify-center gap-2">
                  <Badge className="text-white font-bold px-3 py-1" style={{ backgroundColor: numberColor }}>
                    {card.number}
                  </Badge>
                  {meaning && (
                    <Badge variant="outline" className="text-purple-700 dark:text-purple-300">
                      {meaning.title}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-600 dark:text-purple-400 text-center mb-4">{card.description}</p>
                <p className="text-xs text-purple-500 dark:text-purple-500 text-center mb-4">{card.calculation}</p>

                {meaning && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => toggleExpanded(card.id)}
                      className="w-full text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Learn More
                        </>
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div>
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Description</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300">{meaning.description}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Strengths</h4>
                          <div className="flex flex-wrap gap-1">
                            {meaning.strengths.map((strength, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              >
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Challenges</h4>
                          <div className="flex flex-wrap gap-1">
                            {meaning.challenges.map((challenge, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              >
                                {challenge}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Purpose</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300">{meaning.purpose}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Famous People</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            {meaning.famousPeople.join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

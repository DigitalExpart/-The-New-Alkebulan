"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { spiritualPractices } from "@/data/culture-data"
import type { SpiritualPractice } from "@/types/culture"

export function SpiritualitySection() {
  const [expandedPractice, setExpandedPractice] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedPractice(expandedPractice === id ? null : id)
  }

  const getCategoryColor = (category: SpiritualPractice["category"]) => {
    const colors = {
      belief: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      ceremony: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      ritual: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      healing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      symbol: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    return colors[category]
  }

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-amber-600 mr-3" />
            <h2 className="text-3xl sm:text-4xl font-bold text-amber-900 dark:text-amber-100">
              Culture & Spirituality
            </h2>
          </div>
          <p className="text-lg text-amber-700 dark:text-amber-300 max-w-3xl mx-auto">
            Discover the sacred traditions, beliefs, and practices that have guided African communities for millennia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spiritualPractices.map((practice) => (
            <Card
              key={practice.id}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-amber-900 dark:text-amber-100 mb-2">{practice.name}</CardTitle>
                    <Badge className={getCategoryColor(practice.category)}>{practice.category}</Badge>
                  </div>
                  <img
                    src={practice.image || "/placeholder.svg"}
                    alt={practice.name}
                    className="w-16 h-16 rounded-lg object-cover ml-4"
                  />
                </div>
              </CardHeader>

              <CardContent>
                <CardDescription className="text-amber-700 dark:text-amber-300 mb-4">
                  {practice.description}
                </CardDescription>

                <div className="mb-4">
                  <div className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Regions:</div>
                  <div className="flex flex-wrap gap-1">
                    {practice.regions.map((region) => (
                      <Badge key={region} variant="outline" className="text-xs">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(practice.id)}
                  className="w-full text-amber-700 hover:text-amber-900 hover:bg-amber-100 dark:text-amber-300 dark:hover:text-amber-100"
                >
                  {expandedPractice === practice.id ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Learn More
                    </>
                  )}
                </Button>

                {expandedPractice === practice.id && (
                  <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                    <div className="mb-3">
                      <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">Significance:</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">{practice.significance}</p>
                    </div>

                    {practice.relatedPractices.length > 0 && (
                      <div>
                        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">Related Practices:</h4>
                        <div className="flex flex-wrap gap-1">
                          {practice.relatedPractices.map((related) => (
                            <Badge key={related} variant="secondary" className="text-xs">
                              {related.replace("-", " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

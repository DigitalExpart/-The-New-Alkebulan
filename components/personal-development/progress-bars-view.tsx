"use client"

import type React from "react"

import { useState } from "react"
import type { DevelopmentArea } from "@/types/personal-development"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Star, Focus, Calendar } from "lucide-react"

interface ProgressBarsViewProps {
  areas: DevelopmentArea[]
  focusArea?: string
  onSetFocus: (areaId: string) => void
}

export function ProgressBarsView({ areas, focusArea, onSetFocus }: ProgressBarsViewProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)

  const getProgressPercentage = (level: number, maxLevel: number) => {
    return (level / maxLevel) * 100
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {areas.map((area) => {
        const progressPercentage = getProgressPercentage(area.level, area.maxLevel)
        const isFocusArea = focusArea === area.id
        const isHovered = hoveredArea === area.id

        return (
          <Card
            key={area.id}
            className={`transition-all duration-300 ${
              isFocusArea ? "ring-2 ring-primary shadow-lg" : ""
            } ${isHovered ? "shadow-md" : ""}`}
            onMouseEnter={() => setHoveredArea(area.id)}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: area.color }} />
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {area.name}
                        {isFocusArea && (
                          <Badge variant="secondary" className="text-xs">
                            <Focus className="w-3 h-3 mr-1" />
                            Focus Area
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{area.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: area.color }}>
                      Level {area.level}
                    </div>
                    <div className="text-xs text-muted-foreground">of {area.maxLevel}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress
                    value={progressPercentage}
                    className="h-3"
                    style={
                      {
                        "--progress-background": area.color,
                      } as React.CSSProperties
                    }
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {formatDate(area.lastUpdated)}</span>
                    </div>
                    <span>{Math.round(progressPercentage)}% Complete</span>
                  </div>
                </div>

                {/* Quote and Actions */}
                <div className="flex items-center justify-between pt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1 cursor-help">
                          <p className="text-sm italic text-muted-foreground line-clamp-1">
                            "{area.motivationalQuote}"
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>"{area.motivationalQuote}"</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {!isFocusArea && (
                    <Button variant="ghost" size="sm" onClick={() => onSetFocus(area.id)} className="ml-4">
                      <Star className="w-4 h-4 mr-1" />
                      Set Focus
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

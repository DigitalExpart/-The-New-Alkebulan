"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProgressBarsView } from "./progress-bars-view"
import { PentagonView } from "./pentagon-view"
import { personalDevelopmentData } from "@/data/personal-development"
import type { ViewMode } from "@/types/personal-development"
import { BarChart3, Pentagon, Focus, Calendar } from "lucide-react"

export function PersonalDevelopmentProgress() {
  const [viewMode, setViewMode] = useState<ViewMode>("bars")
  const [focusArea, setFocusArea] = useState(personalDevelopmentData.focusArea)

  const handleSetFocus = (areaId: string) => {
    setFocusArea(areaId)
    // In a real app, this would update the user's data
  }

  const focusAreaData = personalDevelopmentData.areas.find((area) => area.id === focusArea)
  const averageLevel =
    personalDevelopmentData.areas.reduce((sum, area) => sum + area.level, 0) / personalDevelopmentData.areas.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Personal Development Progress</CardTitle>
              <CardDescription>Track your growth across six core life domains</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "bars" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("bars")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Progress Bars
              </Button>
              <Button
                variant={viewMode === "pentagon" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("pentagon")}
              >
                <Pentagon className="w-4 h-4 mr-2" />
                Pentagon View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{averageLevel.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Average Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {personalDevelopmentData.areas.filter((area) => area.level >= 3).length}
              </div>
              <div className="text-sm text-muted-foreground">Areas Level 3+</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Updated {new Date(personalDevelopmentData.lastOverallUpdate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Focus Area Banner */}
      {focusAreaData && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Focus className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Currently focusing on:</span>
                  <Badge variant="secondary" className="font-semibold">
                    {focusAreaData.name}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{focusAreaData.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: focusAreaData.color }}>
                  Level {focusAreaData.level}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Views */}
      <div className="space-y-6">
        {viewMode === "bars" ? (
          <ProgressBarsView areas={personalDevelopmentData.areas} focusArea={focusArea} onSetFocus={handleSetFocus} />
        ) : (
          <PentagonView areas={personalDevelopmentData.areas} focusArea={focusArea} />
        )}
      </div>
    </div>
  )
}

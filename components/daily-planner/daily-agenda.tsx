"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Plus, Check, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import type { TimeBlock } from "@/types/daily-planner"

interface DailyAgendaProps {
  timeBlocks: TimeBlock[]
  onToggleComplete: (id: string) => void
  onAddTimeBlock: () => void
}

export function DailyAgenda({ timeBlocks, onToggleComplete, onAddTimeBlock }: DailyAgendaProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("day")

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      work: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      personal: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      health: "bg-green-500/20 text-green-300 border-green-500/30",
      learning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      social: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    }
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground border-border"
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (view === "day") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    } else if (view === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Calendar className="w-5 h-5 text-primary" />
            Daily Agenda
          </CardTitle>
          <Button onClick={onAddTimeBlock} size="sm" className="gap-1 h-8 px-3 text-xs bg-primary hover:bg-primary/80">
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate("prev")} className="h-7 w-7 p-0">
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <h3 className="text-sm font-semibold px-3 text-foreground">{formatDate(currentDate)}</h3>
            <Button variant="outline" size="sm" onClick={() => navigateDate("next")} className="h-7 w-7 p-0">
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week" | "month")}>
            <TabsList className="grid w-full grid-cols-3 h-8 bg-muted">
              <TabsTrigger value="day" className="text-xs">
                Day
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs">
                Week
              </TabsTrigger>
              <TabsTrigger value="month" className="text-xs">
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={view} className="w-full">
          <TabsContent value="day" className="space-y-3 mt-0">
            {timeBlocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No events scheduled</p>
                <Button onClick={onAddTimeBlock} className="mt-3 h-8 px-4 text-xs bg-primary hover:bg-primary/80">
                  Add Your First Event
                </Button>
              </div>
            ) : (
              timeBlocks.map((block) => (
                <div
                  key={block.id}
                  className={`p-4 rounded border-l-4 transition-all duration-200 hover:shadow-sm ${
                    block.completed
                      ? "bg-primary/10 border-l-primary opacity-75"
                      : "bg-card border-l-muted-foreground hover:border-l-primary"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {block.startTime} - {block.endTime}
                          </span>
                        </div>
                        <Badge variant="outline" className={`${getCategoryColor(block.category)} text-xs px-2 py-1`}>
                          {block.category}
                        </Badge>
                      </div>

                      <h4
                        className={`font-semibold text-sm ${
                          block.completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {block.title}
                      </h4>

                      {block.description && (
                        <p
                          className={`text-xs mt-1 ${
                            block.completed ? "text-muted-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {block.description}
                        </p>
                      )}
                    </div>

                    <Button
                      variant={block.completed ? "default" : "outline"}
                      size="sm"
                      onClick={() => onToggleComplete(block.id)}
                      className={`ml-3 h-8 w-8 p-0 ${
                        block.completed ? "bg-primary hover:bg-primary/80 text-primary-foreground" : ""
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="week" className="space-y-4 mt-0">
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Weekly view coming soon</p>
              <p className="text-xs mt-1">Switch to day view to manage your schedule</p>
            </div>
          </TabsContent>

          <TabsContent value="month" className="space-y-4 mt-0">
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Monthly view coming soon</p>
              <p className="text-xs mt-1">Switch to day view to manage your schedule</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

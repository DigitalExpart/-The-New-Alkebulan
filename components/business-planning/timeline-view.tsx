"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Target, CheckCircle, AlertCircle, Circle } from "lucide-react"
import type { TimelineEvent, BusinessIdea } from "@/types/business-planning"

interface TimelineViewProps {
  events: TimelineEvent[]
  businessIdeas: BusinessIdea[]
  selectedIdeaId?: string
  onEventClick?: (event: TimelineEvent) => void
}

export function TimelineView({ events, businessIdeas, selectedIdeaId, onEventClick }: TimelineViewProps) {
  const [viewMode, setViewMode] = useState<"month" | "quarter" | "year">("month")
  const [filterType, setFilterType] = useState<string>("all")

  const getEventIcon = (type: string, status: string) => {
    if (status === "completed") {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (status === "overdue") {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }

    switch (type) {
      case "milestone":
        return <Target className="h-4 w-4 text-blue-500" />
      case "task":
        return <Circle className="h-4 w-4 text-gray-500" />
      case "goal":
        return <Target className="h-4 w-4 text-purple-500" />
      case "meeting":
        return <Calendar className="h-4 w-4 text-orange-500" />
      case "deadline":
        return <Clock className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "upcoming":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const filteredEvents = events.filter((event) => {
    if (selectedIdeaId && event.businessIdeaId !== selectedIdeaId) return false
    if (filterType !== "all" && event.type !== filterType) return false
    return true
  })

  const sortedEvents = filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const groupEventsByMonth = (events: TimelineEvent[]) => {
    const groups: { [key: string]: TimelineEvent[] } = {}
    events.forEach((event) => {
      const date = new Date(event.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!groups[key]) groups[key] = []
      groups[key].push(event)
    })
    return groups
  }

  const eventGroups = groupEventsByMonth(sortedEvents)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="milestone">Milestones</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="goal">Goals</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
              </SelectContent>
            </Select>
            <Select value={viewMode} onValueChange={(value: "month" | "quarter" | "year") => setViewMode(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {Object.entries(eventGroups).map(([monthKey, monthEvents]) => {
              const [year, month] = monthKey.split("-")
              const monthName = new Date(Number.parseInt(year), Number.parseInt(month)).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })

              return (
                <div key={monthKey} className="space-y-4">
                  <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{monthName}</h3>
                  </div>

                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                    <div className="space-y-4">
                      {monthEvents.map((event, index) => {
                        const businessIdea = businessIdeas.find((idea) => idea.id === event.businessIdeaId)

                        return (
                          <div
                            key={event.id}
                            className="relative flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-3 rounded-lg transition-colors"
                            onClick={() => onEventClick?.(event)}
                          >
                            {/* Timeline Dot */}
                            <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-full">
                              {getEventIcon(event.type, event.status)}
                            </div>

                            {/* Event Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</h4>
                                    <Badge className={getStatusColor(event.status)} variant="secondary">
                                      {event.status.replace("-", " ")}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{event.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                    {businessIdea && (
                                      <span className="flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        {businessIdea.title}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {event.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}

            {sortedEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedIdeaId
                    ? "No events for the selected business idea"
                    : "Create your first business plan to see timeline events"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

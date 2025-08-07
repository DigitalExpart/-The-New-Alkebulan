"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Copy,
  Users,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  X,
  RefreshCw,
} from "lucide-react"
import type { AIBusinessSuggestion } from "@/types/business-planning"

interface AISuggestionsPanelProps {
  suggestions: AIBusinessSuggestion[]
  onApplySuggestion?: (suggestionId: string) => void
  onDismissSuggestion?: (suggestionId: string) => void
  onRefreshSuggestions?: () => void
  isLoading?: boolean
}

export function AISuggestionsPanel({
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
  onRefreshSuggestions,
  isLoading = false,
}: AISuggestionsPanelProps) {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set())

  const toggleExpanded = (suggestionId: string) => {
    const newExpanded = new Set(expandedSuggestions)
    if (newExpanded.has(suggestionId)) {
      newExpanded.delete(suggestionId)
    } else {
      newExpanded.add(suggestionId)
    }
    setExpandedSuggestions(newExpanded)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "improvement":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case "risk":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "opportunity":
        return <Lightbulb className="h-4 w-4 text-green-500" />
      case "duplicate":
        return <Copy className="h-4 w-4 text-orange-500" />
      case "resource":
        return <Users className="h-4 w-4 text-purple-500" />
      default:
        return <Zap className="h-4 w-4 text-gray-500" />
    }
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case "improvement":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "risk":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "opportunity":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "duplicate":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "resource":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 dark:text-green-400"
    if (confidence >= 0.6) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const sortedSuggestions = suggestions.sort((a, b) => {
    // Sort by confidence (high to low) then by type priority
    const typePriority = { risk: 0, opportunity: 1, improvement: 2, duplicate: 3, resource: 4 }
    const aPriority = typePriority[a.type as keyof typeof typePriority] ?? 5
    const bPriority = typePriority[b.type as keyof typeof typePriority] ?? 5

    if (aPriority !== bPriority) return aPriority - bPriority
    return b.confidence - a.confidence
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            AI Suggestions
            {suggestions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {suggestions.length}
              </Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefreshSuggestions} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : sortedSuggestions.length > 0 ? (
            <div className="space-y-4">
              {sortedSuggestions.map((suggestion) => (
                <Collapsible
                  key={suggestion.id}
                  open={expandedSuggestions.has(suggestion.id)}
                  onOpenChange={() => toggleExpanded(suggestion.id)}
                >
                  <Card className="border-l-4 border-l-blue-500">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getSuggestionIcon(suggestion.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getSuggestionColor(suggestion.type)} variant="secondary">
                                  {suggestion.type}
                                </Badge>
                                <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                                  {Math.round(suggestion.confidence * 100)}% confidence
                                </span>
                              </div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {suggestion.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {expandedSuggestions.has(suggestion.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 dark:text-gray-300">{suggestion.description}</div>

                          {suggestion.relatedItems.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Related to:</p>
                              <div className="flex flex-wrap gap-1">
                                {suggestion.relatedItems.map((item) => (
                                  <Badge key={item} variant="outline" className="text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2">
                            {suggestion.actionable && (
                              <Button
                                size="sm"
                                onClick={() => onApplySuggestion?.(suggestion.id)}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Apply
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDismissSuggestion?.(suggestion.id)}
                              className="flex items-center gap-1"
                            >
                              <X className="h-3 w-3" />
                              Dismiss
                            </Button>
                          </div>

                          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
                            Generated {new Date(suggestion.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No suggestions yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                AI will analyze your business plans and provide personalized suggestions
              </p>
              <Button onClick={onRefreshSuggestions} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Suggestions
              </Button>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

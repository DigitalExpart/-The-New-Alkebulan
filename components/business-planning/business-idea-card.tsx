"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Calendar, DollarSign, Users, Share, Edit, Trash2, Eye } from "lucide-react"
import type { BusinessIdea } from "@/types/business-planning"

interface BusinessIdeaCardProps {
  idea: BusinessIdea
  onEdit?: (idea: BusinessIdea) => void
  onDelete?: (ideaId: string) => void
  onShare?: (idea: BusinessIdea) => void
  onView?: (idea: BusinessIdea) => void
}

export function BusinessIdeaCard({ idea, onEdit, onDelete, onShare, onView }: BusinessIdeaCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concept":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      case "planning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "in-progress":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "on-hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
      case "medium":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
      case "high":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
      case "critical":
        return "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const calculateProgress = () => {
    const now = new Date()
    const start = new Date(idea.startDate)
    const end = new Date(idea.targetLaunchDate)

    if (now < start) return 0
    if (now > end) return 100

    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.round((elapsed / total) * 100)
  }

  const progress = calculateProgress()
  const budgetUsed = (idea.budget.spent / idea.budget.estimated) * 100

  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(idea)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(idea.status)} variant="secondary">
                {idea.status.replace("-", " ")}
              </Badge>
              <Badge className={getPriorityColor(idea.priority)} variant="outline">
                {idea.priority}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{idea.title}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{idea.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onView?.(idea)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.(idea)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onShare?.(idea)
                }}
              >
                <Share className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(idea.id)
                }}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Timeline Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Launch Date</p>
                <p className="text-sm font-medium">{new Date(idea.targetLaunchDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Budget Used</p>
                <p className="text-sm font-medium">{budgetUsed.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {idea.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {idea.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{idea.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Collaborators */}
          {idea.collaborators.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div className="flex -space-x-2">
                {idea.collaborators.slice(0, 3).map((collaborator, index) => (
                  <Avatar key={collaborator} className="h-6 w-6 border-2 border-white dark:border-gray-800">
                    <AvatarImage src={`/placeholder.svg?height=24&width=24&text=${index + 1}`} />
                    <AvatarFallback className="text-xs">U{index + 1}</AvatarFallback>
                  </Avatar>
                ))}
                {idea.collaborators.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <span className="text-xs font-medium">+{idea.collaborators.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isHovered && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.(idea)
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onShare?.(idea)
                }}
              >
                <Share className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

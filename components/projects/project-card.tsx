"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Eye, Star, Users, Calendar, MapPin, Heart, MessageCircle, ExternalLink } from "lucide-react"
import type { Project } from "@/types/project"

interface ProjectCardProps {
  project: Project
  onViewDetails: (project: Project) => void
  onJoinProject: (projectId: string) => void
  onFollowProject: (projectId: string) => void
}

export function ProjectCard({ project, onViewDetails, onJoinProject, onFollowProject }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      case "Seeking Support":
        return "bg-yellow-100 text-yellow-800"
      case "On Hold":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getImpactScaleColor = (scale: string) => {
    switch (scale) {
      case "Local":
        return "bg-blue-100 text-blue-800"
      case "Regional":
        return "bg-purple-100 text-purple-800"
      case "Global":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const fundingPercentage = project.funding ? Math.round((project.funding.raised / project.funding.target) * 100) : 0

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <div className="relative">
        <img
          src={project.coverImage || "/placeholder.svg"}
          alt={project.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={getImpactScaleColor(project.impactScale)}>{project.impactScale}</Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
          </div>
        </div>

        {/* Owner Info */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={project.owner.avatar || "/placeholder.svg"} alt={project.owner.name} />
            <AvatarFallback>{project.owner.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{project.owner.name}</p>
            <p className="text-xs text-muted-foreground">{project.owner.title}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Funding (if available) */}
        {project.funding && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Funding</span>
              <span className="text-sm text-muted-foreground">{fundingPercentage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">${project.funding.raised.toLocaleString()}</span>
              <span className="font-medium">${project.funding.target.toLocaleString()}</span>
            </div>
            <Progress value={fundingPercentage} className="h-2 mt-1" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{project.teamSize} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{project.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{project.rating}/5</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{project.region}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={() => onViewDetails(project)} className="flex-1" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button onClick={() => onFollowProject(project.id)} variant="outline" size="sm">
            <Heart className="h-4 w-4" />
          </Button>
          <Button onClick={() => onJoinProject(project.id)} variant="outline" size="sm">
            <Users className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {project.followers}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {project.comments.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

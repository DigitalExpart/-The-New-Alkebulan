"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { sampleProjects } from "@/data/projects-data"
import type { Project } from "@/types/project"
import {
  Eye,
  Users,
  Calendar,
  Heart,
  MessageSquare,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  Send,
  ArrowLeft,
  Share2,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    const projectId = params.id as string
    const foundProject = sampleProjects.find((p) => p.id === projectId)
    setProject(foundProject || null)
  }, [params.id])

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/projects">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Seeking Support":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "On Hold":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8">
          {project.bannerImage && (
            <img
              src={project.bannerImage || "/placeholder.svg"}
              alt={project.title}
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className={`${getStatusColor(project.status)} border`}>{project.status}</Badge>
            <Badge variant="secondary" className="bg-black/70 text-white border-0">
              {project.category}
            </Badge>
          </div>
        </div>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{project.description}</p>

              {/* Owner Info */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.owner.avatar || "/placeholder.svg"} alt={project.owner.name} />
                  <AvatarFallback>{project.owner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.owner.name}</p>
                  <p className="text-sm text-muted-foreground">{project.owner.title}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 md:w-48">
              <Button className="bg-yellow-500 hover:bg-yellow-600">Join Project</Button>
              <Button variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Follow
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Views</span>
              </div>
              <div className="text-xl font-semibold">{project.views}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Team</span>
              </div>
              <div className="text-xl font-semibold">{project.teamSize}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Followers</span>
              </div>
              <div className="text-xl font-semibold">{project.followers}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Star className="h-4 w-4" />
                <span className="text-sm">Rating</span>
              </div>
              <div className="text-xl font-semibold">{project.rating}</div>
            </div>
          </div>

          {/* Progress and Funding */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {project.funding && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Funding</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Raised</span>
                      <span className="font-medium">
                        {formatCurrency(project.funding.raised, project.funding.currency)} /{" "}
                        {formatCurrency(project.funding.target, project.funding.currency)}
                      </span>
                    </div>
                    <Progress value={(project.funding.raised / project.funding.target) * 100} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{project.fullDescription}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Region: {project.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Created: {format(new Date(project.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                    {project.endDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">End Date: {format(new Date(project.endDate), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Impact Scale:</span> {project.impactScale}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Visibility:</span> {project.visibility}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Last Updated:</span>{" "}
                      {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4 mt-6">
            {project.milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {milestone.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Clock className="h-6 w-6 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-lg mb-2">{milestone.title}</h4>
                      <p className="text-muted-foreground mb-3">{milestone.description}</p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>Due: {format(new Date(milestone.dueDate), "MMM dd, yyyy")}</span>
                        {milestone.completed && milestone.completedDate && (
                          <span className="text-green-600">
                            Completed: {format(new Date(milestone.completedDate), "MMM dd, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="team" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={project.owner.avatar || "/placeholder.svg"} alt={project.owner.name} />
                    <AvatarFallback>{project.owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-lg">{project.owner.name}</p>
                    <p className="text-muted-foreground">{project.owner.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {project.team.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Members ({project.team.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.team.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="discussion" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Discussion ({project.comments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Comment */}
                <div className="space-y-3 mb-6">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button className="bg-yellow-500 hover:bg-yellow-600">
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {project.comments.length > 0 ? (
                    project.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4 p-4 border rounded-lg">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">{comment.author.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No comments yet. Be the first to start the discussion!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

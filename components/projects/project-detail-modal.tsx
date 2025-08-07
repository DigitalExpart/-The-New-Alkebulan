"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, FileText, MessageCircle, Heart, Share2, CheckCircle, Clock } from "lucide-react"
import type { Project } from "@/types/project"

interface ProjectDetailModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onJoinProject: (projectId: string) => void
  onFollowProject: (projectId: string) => void
}

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onJoinProject,
  onFollowProject,
}: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!project) return null

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

  const fundingPercentage = project.funding ? Math.round((project.funding.raised / project.funding.target) * 100) : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{project.title}</DialogTitle>
              <DialogDescription className="text-base">{project.description}</DialogDescription>
            </div>
            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
          </div>
        </DialogHeader>

        {/* Banner Image */}
        {project.bannerImage && (
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <img
              src={project.bannerImage || "/placeholder.svg"}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{project.progress}%</div>
            <div className="text-sm text-muted-foreground">Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{project.teamSize}</div>
            <div className="text-sm text-muted-foreground">Team Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{project.views}</div>
            <div className="text-sm text-muted-foreground">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{project.followers}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{project.fullDescription}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span>
                      <p className="text-muted-foreground">{project.category}</p>
                    </div>
                    <div>
                      <span className="font-medium">Region:</span>
                      <p className="text-muted-foreground">{project.region}</p>
                    </div>
                    <div>
                      <span className="font-medium">Impact Scale:</span>
                      <p className="text-muted-foreground">{project.impactScale}</p>
                    </div>
                    <div>
                      <span className="font-medium">Visibility:</span>
                      <p className="text-muted-foreground">{project.visibility}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Funding & Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progress & Funding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3" />
                  </div>

                  {project.funding && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Funding Progress</span>
                        <span className="text-sm text-muted-foreground">{fundingPercentage}%</span>
                      </div>
                      <Progress value={fundingPercentage} className="h-3" />
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-muted-foreground">
                          Raised: ${project.funding.raised.toLocaleString()}
                        </span>
                        <span className="font-medium">Target: ${project.funding.target.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <p className="text-muted-foreground">{new Date(project.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {project.endDate && (
                    <div>
                      <span className="font-medium">End Date:</span>
                      <p className="text-muted-foreground">{new Date(project.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Project Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={project.owner.avatar || "/placeholder.svg"} alt={project.owner.name} />
                    <AvatarFallback className="text-lg">{project.owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-lg">{project.owner.name}</h4>
                    <p className="text-muted-foreground">{project.owner.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {project.team.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            {project.milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                        {milestone.completed && milestone.completedDate && (
                          <span>Completed: {new Date(milestone.completedDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {project.comments.length > 0 ? (
              project.comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{comment.author.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No comments yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={() => onJoinProject(project.id)} className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Join Project
          </Button>
          <Button onClick={() => onFollowProject(project.id)} variant="outline">
            <Heart className="h-4 w-4 mr-2" />
            Follow
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

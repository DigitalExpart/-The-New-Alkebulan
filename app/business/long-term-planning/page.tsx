"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Lightbulb,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  BarChart3,
  Rocket,
  Globe,
  Zap,
} from "lucide-react"
import { BusinessIdeaCard } from "@/components/business-planning/business-idea-card"
import { TimelineView } from "@/components/business-planning/timeline-view"
import { AISuggestionsPanel } from "@/components/business-planning/ai-suggestions-panel"

export default function BusinessLongTermPlanningPage() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock business planning data
  const businessGoals = [
    {
      id: 1,
      title: "Expand to 5 New Markets",
      description: "Enter European and Asian markets",
      progress: 60,
      deadline: "Q4 2024",
      status: "on-track",
      priority: "high",
    },
    {
      id: 2,
      title: "Launch Premium Product Line",
      description: "High-end artisan collection",
      progress: 35,
      deadline: "Q2 2024",
      status: "behind",
      priority: "high",
    },
    {
      id: 3,
      title: "Build Strategic Partnerships",
      description: "Partner with 10 cultural organizations",
      progress: 80,
      deadline: "Q3 2024",
      status: "ahead",
      priority: "medium",
    },
    {
      id: 4,
      title: "Implement Sustainability Program",
      description: "Carbon-neutral operations",
      progress: 25,
      deadline: "Q1 2025",
      status: "planning",
      priority: "medium",
    },
  ]

  const businessIdeas = [
    {
      id: 1,
      title: "Cultural Learning Platform",
      description: "Online courses teaching traditional crafts and skills",
      category: "Education",
      potential: "High",
      investment: "$50K",
      timeline: "6 months",
      status: "concept",
    },
    {
      id: 2,
      title: "Diaspora Food Delivery",
      description: "Authentic cuisine delivery service",
      category: "Food & Beverage",
      potential: "Medium",
      investment: "$100K",
      timeline: "12 months",
      status: "research",
    },
    {
      id: 3,
      title: "Virtual Cultural Events",
      description: "Online festivals and celebrations",
      category: "Entertainment",
      potential: "High",
      investment: "$30K",
      timeline: "3 months",
      status: "planning",
    },
  ]

  const milestones = [
    {
      id: 1,
      title: "Q1 2024 - Market Research Complete",
      description: "Comprehensive analysis of target markets",
      date: "2024-03-31",
      status: "completed",
      type: "research",
    },
    {
      id: 2,
      title: "Q2 2024 - Product Development",
      description: "Launch premium product line",
      date: "2024-06-30",
      status: "in-progress",
      type: "product",
    },
    {
      id: 3,
      title: "Q3 2024 - Partnership Agreements",
      description: "Finalize strategic partnerships",
      date: "2024-09-30",
      status: "upcoming",
      type: "partnership",
    },
    {
      id: 4,
      title: "Q4 2024 - Market Expansion",
      description: "Enter 3 new international markets",
      date: "2024-12-31",
      status: "upcoming",
      type: "expansion",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "on-track":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "behind":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "ahead":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "planning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "upcoming":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "on-track":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case "behind":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "ahead":
        return <Rocket className="h-4 w-4 text-green-500" />
      case "planning":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "in-progress":
        return <Zap className="h-4 w-4 text-blue-500" />
      case "upcoming":
        return <Calendar className="h-4 w-4 text-gray-500" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">My Business Plans</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Strategic planning and long-term vision for your business growth in the global diaspora market.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">2 on track, 1 behind</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Business Ideas</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">1 in planning phase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.5M</div>
              <p className="text-xs text-muted-foreground">By end of 2025</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Expansion</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">New markets planned</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Planning Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Current Goals Progress */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Goals Progress</CardTitle>
                    <CardDescription>Track your business objectives</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {businessGoals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(goal.status)}
                            <h4 className="font-medium">{goal.title}</h4>
                          </div>
                          <Badge variant="secondary" className={getStatusColor(goal.status)}>
                            {goal.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                        <div className="flex items-center gap-4">
                          <Progress value={goal.progress} className="flex-1" />
                          <span className="text-sm font-medium">{goal.progress}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Due: {goal.deadline}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Planning tools</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Goal
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Create Business Idea
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Review
                    </Button>
                  </CardContent>
                </Card>

                {/* Upcoming Milestones */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Upcoming Milestones</CardTitle>
                    <CardDescription>Next 3 months</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {milestones
                      .filter((m) => m.status === "upcoming" || m.status === "in-progress")
                      .slice(0, 3)
                      .map((milestone) => (
                        <div key={milestone.id} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{milestone.title}</p>
                            <p className="text-xs text-muted-foreground">{milestone.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{milestone.date}</p>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Business Goals</h3>
                <p className="text-muted-foreground">Track and manage your strategic objectives</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </div>

            <div className="grid gap-6">
              {businessGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(goal.status)}
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          <CardDescription>{goal.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            goal.priority === "high"
                              ? "border-red-200 text-red-700"
                              : goal.priority === "medium"
                                ? "border-yellow-200 text-yellow-700"
                                : "border-green-200 text-green-700"
                          }
                        >
                          {goal.priority} priority
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(goal.status)}>
                          {goal.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Progress value={goal.progress} className="flex-1" />
                        <span className="text-sm font-medium">{goal.progress}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Deadline: {goal.deadline}</span>
                        <Button variant="ghost" size="sm">
                          Edit Goal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ideas Tab */}
          <TabsContent value="ideas" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Business Ideas</h3>
                <p className="text-muted-foreground">Explore new opportunities and ventures</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Idea
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessIdeas.map((idea) => (
                <BusinessIdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <TimelineView milestones={milestones} />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights">
            <AISuggestionsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

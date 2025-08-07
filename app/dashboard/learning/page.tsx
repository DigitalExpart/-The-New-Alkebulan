"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  Award,
  Clock,
  Plus,
  Edit,
  CheckCircle,
  Play,
  FileText,
  Headphones,
} from "lucide-react"
import { PersonalDevelopmentProgress } from "@/components/personal-development/personal-development-progress"

export default function LearningDashboardPage() {
  const [newGoal, setNewGoal] = useState("")
  const [newReflection, setNewReflection] = useState("")

  const learningGoals = [
    {
      id: 1,
      title: "Complete Entrepreneurship Course",
      description: "Finish the 12-lesson entrepreneurship course by end of month",
      progress: 75,
      targetDate: "2024-02-28",
      category: "Business",
      status: "in-progress",
    },
    {
      id: 2,
      title: "Read 3 Cultural Identity Books",
      description: "Expand understanding of cultural identity and personal growth",
      progress: 33,
      targetDate: "2024-03-15",
      category: "Personal Development",
      status: "in-progress",
    },
    {
      id: 3,
      title: "Listen to Success Stories Podcast",
      description: "Complete all 24 episodes of the success stories series",
      progress: 100,
      targetDate: "2024-01-31",
      category: "Inspiration",
      status: "completed",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: "course",
      title: "Entrepreneurship in the Diaspora",
      lesson: "Lesson 9: Building Your Network",
      progress: 75,
      completedAt: "2024-01-20",
      duration: "45 minutes",
    },
    {
      id: 2,
      type: "ebook",
      title: "Cultural Identity & Personal Growth",
      chapter: "Chapter 3: Navigating Two Worlds",
      progress: 45,
      completedAt: "2024-01-19",
      duration: "30 minutes",
    },
    {
      id: 3,
      type: "audio",
      title: "Success Stories Podcast",
      episode: "Episode 24: Tech Entrepreneur Journey",
      progress: 100,
      completedAt: "2024-01-18",
      duration: "35 minutes",
    },
  ]

  const journalEntries = [
    {
      id: 1,
      contentTitle: "Entrepreneurship in the Diaspora - Lesson 9",
      reflection:
        "The networking strategies discussed really resonated with me. I particularly found the advice about maintaining cultural authenticity while building professional relationships valuable. I plan to implement the 'cultural bridge' approach in my next networking event.",
      date: "2024-01-20",
      tags: ["networking", "authenticity", "business"],
    },
    {
      id: 2,
      contentTitle: "Cultural Identity & Personal Growth - Chapter 3",
      reflection:
        "This chapter helped me understand the challenges of living between two cultures. The concept of 'cultural code-switching' is something I do daily but never had a name for. It's validating to know this is a common experience.",
      date: "2024-01-19",
      tags: ["identity", "culture", "validation"],
    },
  ]

  const stats = {
    totalHours: 127,
    completedCourses: 8,
    currentStreak: 15,
    totalCertificates: 5,
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "course":
        return Play
      case "ebook":
        return FileText
      case "audio":
        return Headphones
      default:
        return BookOpen
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Learning Journey</h1>
        <p className="text-muted-foreground">Track your progress, set goals, and reflect on your learning experience</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}</div>
            <p className="text-xs text-muted-foreground">+12 hours this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">courses & books</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">earned this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Development Progress */}
      <PersonalDevelopmentProgress />

      {/* Main Content Tabs */}
      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="goals">Learning Goals</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Learning Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Learning Goals</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Learning Goal</DialogTitle>
                  <DialogDescription>
                    Set a specific learning objective with a target completion date.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal-title">Goal Title</Label>
                    <Input
                      id="goal-title"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="e.g., Complete Digital Marketing Course"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-description">Description</Label>
                    <Textarea id="goal-description" placeholder="Describe what you want to achieve..." />
                  </div>
                  <div>
                    <Label htmlFor="target-date">Target Date</Label>
                    <Input id="target-date" type="date" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Goal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {learningGoals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {goal.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Target className="h-5 w-5 text-primary" />
                        )}
                        {goal.title}
                      </CardTitle>
                      <CardDescription>{goal.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={goal.status === "completed" ? "default" : "secondary"}>{goal.category}</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                      </div>
                      <Badge variant={goal.status === "completed" ? "default" : "outline"}>
                        {goal.status === "completed" ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <h2 className="text-2xl font-bold">Recent Activity</h2>

          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = getIcon(activity.type)

              return (
                <Card key={activity.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold">{activity.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {activity.lesson || activity.chapter || activity.episode}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Completed: {new Date(activity.completedAt).toLocaleDateString()}</span>
                          <span>Duration: {activity.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={activity.progress} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{activity.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Journal Tab */}
        <TabsContent value="journal" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Learning Journal</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reflection
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Learning Reflection</DialogTitle>
                  <DialogDescription>Reflect on your recent learning experience and key insights.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="content-title">Content Title</Label>
                    <Input id="content-title" placeholder="e.g., Entrepreneurship Course - Lesson 5" />
                  </div>
                  <div>
                    <Label htmlFor="reflection">Your Reflection</Label>
                    <Textarea
                      id="reflection"
                      value={newReflection}
                      onChange={(e) => setNewReflection(e.target.value)}
                      placeholder="What did you learn? How will you apply it? What questions do you have?"
                      className="min-h-[120px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" placeholder="e.g., networking, business, insights" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Reflection</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {journalEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{entry.contentTitle}</CardTitle>
                      <CardDescription>{new Date(entry.date).toLocaleDateString()}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed mb-4">{entry.reflection}</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <h2 className="text-2xl font-bold">Achievements & Certificates</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Entrepreneurship Expert</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Completed advanced entrepreneurship course with distinction
                </p>
                <Badge>Earned Jan 2024</Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Cultural Scholar</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Read 10+ books on cultural identity and personal growth
                </p>
                <Badge>Earned Dec 2023</Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Consistent Learner</h3>
                <p className="text-sm text-muted-foreground mb-4">Maintained a 30-day learning streak</p>
                <Badge>Earned Jan 2024</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

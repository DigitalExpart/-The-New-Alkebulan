"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Users,
  Video,
  Award,
  Search,
  Filter,
  Clock,
  Star,
  Play,
  Download,
  ArrowRight,
  GraduationCap,
  Target,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

export default function LearningPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const stats = [
    { label: "Courses Available", value: "500+", icon: BookOpen },
    { label: "Expert Mentors", value: "150+", icon: Users },
    { label: "Students Enrolled", value: "25K+", icon: GraduationCap },
    { label: "Completion Rate", value: "89%", icon: Target },
  ]

  const featuredCourses = [
    {
      id: 1,
      title: "African Business Leadership",
      instructor: "Dr. Amina Hassan",
      duration: "8 weeks",
      level: "Intermediate",
      rating: 4.8,
      students: 1250,
      price: "€199",
      image: "/placeholder.svg?height=200&width=300",
      category: "Business",
    },
    {
      id: 2,
      title: "Digital Marketing for African Entrepreneurs",
      instructor: "Kwame Osei",
      duration: "6 weeks",
      level: "Beginner",
      rating: 4.9,
      students: 2100,
      price: "€149",
      image: "/placeholder.svg?height=200&width=300",
      category: "Marketing",
    },
    {
      id: 3,
      title: "African History & Cultural Heritage",
      instructor: "Prof. Zara Okafor",
      duration: "10 weeks",
      level: "All Levels",
      rating: 4.7,
      students: 3200,
      price: "€99",
      image: "/placeholder.svg?height=200&width=300",
      category: "Culture",
    },
    {
      id: 4,
      title: "Sustainable Agriculture in Africa",
      instructor: "Dr. Joseph Mbeki",
      duration: "12 weeks",
      level: "Advanced",
      rating: 4.6,
      students: 890,
      price: "€249",
      image: "/placeholder.svg?height=200&width=300",
      category: "Agriculture",
    },
  ]

  const learningPaths = [
    {
      title: "Entrepreneurship Mastery",
      description: "Complete pathway from idea to successful business",
      courses: 8,
      duration: "6 months",
      level: "Beginner to Advanced",
    },
    {
      title: "Cultural Leadership",
      description: "Develop leadership skills rooted in African values",
      courses: 6,
      duration: "4 months",
      level: "Intermediate",
    },
    {
      title: "Digital Innovation",
      description: "Master digital tools and technologies",
      courses: 10,
      duration: "8 months",
      level: "All Levels",
    },
  ]

  const mentors = [
    {
      name: "Dr. Amara Johnson",
      expertise: "Business Strategy",
      experience: "15+ years",
      rating: 4.9,
      sessions: 500,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Prof. Kwame Asante",
      expertise: "Technology & Innovation",
      experience: "12+ years",
      rating: 4.8,
      sessions: 350,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Dr. Zara Okafor",
      expertise: "Cultural Studies",
      experience: "20+ years",
      rating: 4.9,
      sessions: 750,
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Learning Hub</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock your potential with courses, mentorship, and resources designed for the African diaspora
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses, mentors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-transparent">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="courses" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-card border-border">
            <TabsTrigger
              value="courses"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Courses
            </TabsTrigger>
            <TabsTrigger
              value="paths"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Learning Paths
            </TabsTrigger>
            <TabsTrigger
              value="mentorship"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Mentorship
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Featured Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredCourses.map((course) => (
                  <Card key={course.id} className="bg-card border-border hover:border-primary transition-colors group">
                    <div className="relative">
                      <img
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary text-primary-foreground">{course.category}</Badge>
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Play className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-foreground line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">by {course.instructor}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {course.duration}
                          </div>
                          <Badge variant="outline" className="border-border text-foreground">
                            {course.level}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="mr-1 h-4 w-4 text-primary fill-current" />
                            {course.rating} ({course.students} students)
                          </div>
                          <span className="text-lg font-bold text-primary">{course.price}</span>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                          Enroll Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="paths" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Learning Paths</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {learningPaths.map((path, index) => (
                  <Card key={index} className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">{path.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground">{path.courses}</span> courses
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{path.duration}</span> duration
                          </div>
                        </div>
                        <Badge variant="outline" className="border-border text-foreground">
                          {path.level}
                        </Badge>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                          Start Learning Path
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mentorship" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Expert Mentors</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mentors.map((mentor, index) => (
                  <Card key={index} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <img
                          src={mentor.image || "/placeholder.svg"}
                          alt={mentor.name}
                          className="w-20 h-20 rounded-full mx-auto object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-foreground">{mentor.name}</h3>
                          <p className="text-sm text-primary">{mentor.expertise}</p>
                          <p className="text-xs text-muted-foreground">{mentor.experience}</p>
                        </div>
                        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Star className="mr-1 h-4 w-4 text-primary fill-current" />
                            {mentor.rating}
                          </div>
                          <div>{mentor.sessions} sessions</div>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                          Book Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Learning Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "E-Books Library",
                    description: "Access thousands of books on African culture, business, and history",
                    icon: BookOpen,
                    count: "2,500+ books",
                  },
                  {
                    title: "Video Lectures",
                    description: "Watch recorded lectures from leading African scholars",
                    icon: Video,
                    count: "1,200+ videos",
                  },
                  {
                    title: "Certificates",
                    description: "Earn recognized certificates upon course completion",
                    icon: Award,
                    count: "50+ programs",
                  },
                ].map((resource, index) => (
                  <Card key={index} className="bg-card border-border">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                        <resource.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-foreground">{resource.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-primary font-medium">{resource.count}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border text-foreground hover:bg-muted bg-transparent"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Access
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="bg-card border-border mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Start Learning?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of learners in our community and unlock your potential with expert-led courses and
              mentorship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Browse All Courses
                <TrendingUp className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-muted bg-transparent"
              >
                <Link href="/learning/mentorship">Find a Mentor</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle, Calendar, Star, Plus, Search } from "lucide-react"

interface Mentor {
  id: string
  name: string
  expertise: string[]
  experience: string
  rating: number
  sessions: number
  availability: string[]
  bio: string
  status: "available" | "busy" | "unavailable"
}

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<Mentor[]>([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      expertise: ["Business Strategy", "Marketing", "Leadership"],
      experience: "15+ years",
      rating: 4.9,
      sessions: 127,
      availability: ["Monday", "Wednesday", "Friday"],
      bio: "Experienced business consultant helping entrepreneurs scale their businesses",
      status: "available"
    },
    {
      id: "2",
      name: "Michael Chen",
      expertise: ["Technology", "Startups", "Product Development"],
      experience: "12+ years",
      rating: 4.7,
      sessions: 89,
      availability: ["Tuesday", "Thursday", "Saturday"],
      bio: "Tech entrepreneur and product strategist with multiple successful exits",
      status: "available"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExpertise, setSelectedExpertise] = useState("")

  const expertiseOptions = ["Business Strategy", "Marketing", "Leadership", "Technology", "Startups", "Finance", "Sales"]

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.bio.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesExpertise = !selectedExpertise || mentor.expertise.includes(selectedExpertise)
    return matchesSearch && matchesExpertise
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "busy": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "unavailable": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Mentorship Hub
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Connect with experienced mentors to accelerate your growth and success
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search mentors by name or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Expertise Areas</option>
              {expertiseOptions.map(expertise => (
                <option key={expertise} value={expertise}>{expertise}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{mentor.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {mentor.bio}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(mentor.status)}>
                    {mentor.status.charAt(0).toUpperCase() + mentor.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.expertise.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Mentor Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{mentor.experience}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">{mentor.rating}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{mentor.sessions}</p>
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available on:</p>
                  <div className="flex flex-wrap gap-1">
                    {mentor.availability.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No mentors found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria or check back later for new mentors
              </p>
            </CardContent>
          </Card>
        )}

        {/* Become a Mentor CTA */}
        <Card className="mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-white" />
            <h3 className="text-2xl font-bold mb-2">Share Your Knowledge</h3>
            <p className="text-indigo-100 mb-6">
              Have valuable experience to share? Become a mentor and help others grow
            </p>
            <Button variant="outline" className="bg-white text-indigo-600 hover:bg-indigo-50">
              <Plus className="h-4 w-4 mr-2" />
              Apply to be a Mentor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

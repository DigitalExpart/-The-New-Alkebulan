"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle, Star, Plus, Search } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface MentorCardData {
  id: string
  name: string
  expertise: string[]
  rating: number
  sessions: number
  availability: string[]
  bio: string
  status: "available" | "unavailable"
  firstUpcomingSessionId?: string
  upcomingSessions?: { id: string; start_time: string }[]
}

export default function MentorshipPage() {
  const { toast } = useToast()
  const [mentors, setMentors] = useState<MentorCardData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExpertise, setSelectedExpertise] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getSupabaseClient()

        // 1) Load upcoming sessions
        const { data: sessions, error: sErr } = await supabase
          .from("mentor_sessions")
          .select("id, mentor_user_id, title, start_time, end_time")
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })

        if (sErr) throw sErr
        const byMentor: Record<string, { sessionIds: string[]; days: Set<string>; sessions: { id: string; start_time: string }[] }> = {}
        for (const s of sessions || []) {
          const start = new Date(s.start_time)
          const day = start.toLocaleDateString(undefined, { weekday: "long" })
          const m = byMentor[s.mentor_user_id] || { sessionIds: [], days: new Set<string>(), sessions: [] }
          m.sessionIds.push(s.id)
          m.sessions.push({ id: s.id, start_time: s.start_time })
          m.days.add(day)
          byMentor[s.mentor_user_id] = m
        }

        const mentorIds = Object.keys(byMentor)
        if (mentorIds.length === 0) {
          setMentors([])
          return
        }

        // 2) Load mentor profile basics
        const { data: profiles, error: pErr } = await supabase
          .from("mentor_profiles")
          .select("user_id, headline, bio, expertise, rating, total_sessions")
          .in("user_id", mentorIds)

        if (pErr) throw pErr

        // 3) Load names from public profiles table for nicer display
        const { data: userProfiles, error: uErr } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", mentorIds)

        if (uErr) throw uErr
        const nameMap: Record<string, string> = {}
        for (const up of userProfiles || []) {
          const first = (up as any).first_name || ""
          const last = (up as any).last_name || ""
          const full = `${first} ${last}`.trim()
          nameMap[(up as any).id] = full || "Mentor"
        }

        const result: MentorCardData[] = (profiles || []).map((mp: any) => {
          const availability = Array.from(byMentor[mp.user_id]?.days || [])
          const firstSessionId = byMentor[mp.user_id]?.sessionIds?.[0]
          const upcomingSessions = (byMentor[mp.user_id]?.sessions || []).sort((a, b) => a.start_time.localeCompare(b.start_time))
          return {
            id: mp.user_id,
            name: nameMap[mp.user_id] || "Mentor",
            expertise: Array.isArray(mp.expertise) ? mp.expertise : [],
            rating: Number(mp.rating || 0),
            sessions: Number(mp.total_sessions || 0),
            availability,
            bio: mp.bio || mp.headline || "",
            status: availability.length > 0 ? "available" : "unavailable",
            firstUpcomingSessionId: firstSessionId,
            upcomingSessions
          }
        })

        setMentors(result)
      } catch (err: any) {
        toast({ title: "Failed to load mentors", description: String(err?.message || err), variant: "destructive" })
      }
    }
    load()
  }, [toast])

  const expertiseOptions = useMemo(() => {
    const set = new Set<string>()
    mentors.forEach(m => (m.expertise || []).forEach(x => set.add(x)))
    return Array.from(set)
  }, [mentors])

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (mentor.bio || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesExpertise = !selectedExpertise || mentor.expertise.includes(selectedExpertise)
    return matchesSearch && matchesExpertise
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Availability</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{mentor.availability.length > 0 ? "Open" : "Closed"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">{mentor.rating.toFixed(1)}</span>
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

                {/* Upcoming Sessions */}
                {mentor.upcomingSessions && mentor.upcomingSessions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upcoming sessions:</p>
                    <div className="flex flex-col gap-2">
                      {mentor.upcomingSessions.slice(0, 3).map(s => (
                        <Button key={s.id} asChild variant="outline" className="justify-start">
                          <Link href={`/mentor/book/${s.id}`}>
                            {new Date(s.start_time).toLocaleString()}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {mentor.firstUpcomingSessionId ? (
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1">
                      <Link href={`/mentor/book/${mentor.firstUpcomingSessionId}`}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Book Session
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled className="flex-1">No Upcoming Sessions</Button>
                  )}
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/mentor/dashboard">
                      <Users className="h-4 w-4 mr-2" />
                      View Profile
                    </Link>
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

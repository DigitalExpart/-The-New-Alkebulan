"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, MessageCircle, Star, TrendingUp } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

export default function MentorDashboardPage() {
  const [upcoming, setUpcoming] = useState(0)
  const [mentees, setMentees] = useState(0)
  const [rating, setRating] = useState(0)
  const [growth, setGrowth] = useState(12)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      const userId = session?.user?.id
      if (!userId) return
      const { data: sessions } = await getSupabaseClient()
        .from('mentor_sessions')
        .select('id')
        .eq('mentor_user_id', userId)
        .gte('start_time', new Date().toISOString())
      setUpcoming(sessions?.length || 0)
      const { data: profile } = await getSupabaseClient()
        .from('mentor_profiles')
        .select('rating,total_sessions')
        .eq('user_id', userId)
        .single()
      setRating(profile?.rating || 0)
      setMentees(profile?.total_sessions || 0)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-2">
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground">Manage sessions, track mentees and share your knowledge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming</span>
                <Calendar className="w-4 h-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{upcoming}</p>
              <p className="text-xs text-muted-foreground">sessions this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Mentees</span>
                <Users className="w-4 h-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mentees}</p>
              <p className="text-xs text-muted-foreground">active mentees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Rating</span>
                <Star className="w-4 h-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{rating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">average feedback</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Growth</span>
                <TrendingUp className="w-4 h-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">+{growth}%</p>
              <p className="text-xs text-muted-foreground">month over month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Button asChild>
                <Link href="/mentor/schedule">
                  <Calendar className="w-4 h-4 mr-2" /> Schedule Session
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/messages">
                  <MessageCircle className="w-4 h-4 mr-2" /> Message Mentees
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/growth/mentorship">
                  <Users className="w-4 h-4 mr-2" /> Find New Mentees
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/mentor/students">
                  <Users className="w-4 h-4 mr-2" /> View Students
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <Link href="/mentor/profile" className="underline underline-offset-4">Complete your mentor profile</Link>
                <Badge>New</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Add expertise, availability and intro to attract mentees.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

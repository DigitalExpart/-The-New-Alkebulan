"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, MessageCircle, Star, TrendingUp } from "lucide-react"

export default function MentorDashboardPage() {
  useEffect(() => {
    // Placeholder for future data fetch (sessions, mentees, etc.)
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground">Manage sessions, track mentees and share your knowledge.</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming</span>
                <Calendar className="w-4 h-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
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
              <p className="text-2xl font-bold">12</p>
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
              <p className="text-2xl font-bold">4.8</p>
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
              <p className="text-2xl font-bold">+12%</p>
              <p className="text-xs text-muted-foreground">month over month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Button asChild>
                <Link href="#">
                  <Calendar className="w-4 h-4 mr-2" /> Schedule Session
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#">
                  <MessageCircle className="w-4 h-4 mr-2" /> Message Mentees
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/growth/mentorship">
                  <Users className="w-4 h-4 mr-2" /> Find New Mentees
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
                <span>Complete your mentor profile</span>
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

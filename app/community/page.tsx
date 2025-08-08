"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Users, 
  MessageCircle, 
  Heart, 
  TrendingUp, 
  Calendar,
  Globe,
  Filter
} from "lucide-react"
import { SocialFeed } from "@/components/social-feed/social-feed"
import { CommunityStats } from "@/components/community/community-stats"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-green-600">Community Feed</h1>
                  <p className="text-muted-foreground mt-1">
                    Connect, share, and grow with the Alkebulan community
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-sm">
                    <Globe className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>

              {/* Social Feed */}
              <Suspense fallback={
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading community feed...</p>
                  </CardContent>
                </Card>
              }>
                <SocialFeed />
              </Suspense>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Community Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CommunityStats />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Discussion
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Find Members
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Events
                </Button>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <p className="font-medium">Be Respectful</p>
                  <p className="text-muted-foreground">
                    Treat all members with kindness and respect.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="font-medium">Share Meaningfully</p>
                  <p className="text-muted-foreground">
                    Contribute valuable content that helps the community grow.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="font-medium">Stay On Topic</p>
                  <p className="text-muted-foreground">
                    Keep discussions relevant to our community's mission.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Mail,
  MapPin,
  Calendar,
  Shield,
  Settings,
  Edit,
  Camera,
  Award,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  Globe,
  Phone,
  Briefcase,
  GraduationCap,
} from "lucide-react"

export default function ProfilePage() {
  // Mock user data
  const user = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=120&width=120",
    location: "New York, USA",
    joinDate: "January 2023",
    bio: "Passionate entrepreneur and community builder focused on connecting diaspora communities worldwide. I believe in the power of technology to bridge cultures and create opportunities.",
    website: "https://johndoe.com",
    phone: "+1 (555) 123-4567",
    occupation: "Product Manager",
    education: "MBA, Harvard Business School",
    verified: true,
    stats: {
      communities: 8,
      posts: 127,
      followers: 1247,
      following: 892,
      reputation: 4.8,
    },
    badges: [
      { name: "Early Adopter", icon: "🚀", color: "bg-blue-100 text-blue-800" },
      { name: "Community Leader", icon: "👑", color: "bg-purple-100 text-purple-800" },
      { name: "Verified Creator", icon: "✅", color: "bg-green-100 text-green-800" },
      { name: "Top Contributor", icon: "⭐", color: "bg-yellow-100 text-yellow-800" },
    ],
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="text-2xl">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                      asChild
                    >
                      <Link href="/profile/edit">
                        <Camera className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      {user.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Shield className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {user.joinDate}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" asChild>
                        <Link href="/profile/edit">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{user.stats.communities}</div>
                    <div className="text-sm text-muted-foreground">Communities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{user.stats.posts}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{user.stats.followers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{user.stats.following}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{user.stats.reputation}</div>
                    <div className="text-sm text-muted-foreground">Reputation</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements & Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.badges.map((badge, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <div className="font-medium">{badge.name}</div>
                        <Badge variant="secondary" className={badge.color}>
                          Earned
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Website</div>
                    <a href={user.website} className="text-sm text-blue-600 hover:underline">
                      {user.website}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="text-sm">{user.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Occupation</div>
                    <div className="text-sm">{user.occupation}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Education</div>
                    <div className="text-sm">{user.education}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/profile/account-protection">
                    <Shield className="mr-2 h-4 w-4" />
                    Account Protection
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/profile/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings & Privacy
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/community/my-community">
                    <Users className="mr-2 h-4 w-4" />
                    My Communities
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/dashboard/investments">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    My Investments
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <MessageSquare className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Posted in Amsterdam Music Hub</div>
                    <div className="text-muted-foreground">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Joined AI Creation Hub</div>
                    <div className="text-muted-foreground">1 day ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Star className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Earned "Top Contributor" badge</div>
                    <div className="text-muted-foreground">3 days ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Completed investment in Green Energy Project</div>
                    <div className="text-muted-foreground">1 week ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

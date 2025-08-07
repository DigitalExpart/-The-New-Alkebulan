"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
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
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // Create default profile if none exists
        await createDefaultProfile()
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultProfile = async () => {
    if (!user || !supabase) return

    const defaultProfile = {
      user_id: user.id,
      email: user.email,
      full_name: (user as any)?.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      bio: '',
      location: '',
      website: '',
      phone: '',
      occupation: '',
      education: '',
      avatar_url: null,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([defaultProfile])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Default stats and badges
  const defaultStats = {
    communities: 0,
    posts: 0,
    followers: 0,
    following: 0,
    reputation: 0,
  }

  const defaultBadges = [
    { name: "New Member", icon: "🌟", color: "bg-blue-100 text-blue-800" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const userData = profile || {
    full_name: (user as any)?.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email,
    bio: '',
    location: '',
    website: '',
    phone: '',
    occupation: '',
    education: '',
    avatar_url: null,
    created_at: new Date().toISOString(),
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
                      <AvatarImage src={userData.avatar_url || "/placeholder.svg"} alt={userData.full_name} />
                      <AvatarFallback className="text-2xl">
                        {userData.full_name
                          .split(" ")
                          .map((n: string) => n[0])
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
                      <h2 className="text-2xl font-bold">{userData.full_name}</h2>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Shield className="mr-1 h-3 w-3" />
                        Member
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {userData.email}
                      </div>
                      {userData.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {userData.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {userData.bio || "No bio added yet. Click 'Edit Profile' to add your bio."}
                    </p>

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
                    <div className="text-2xl font-bold text-green-600">{defaultStats.communities}</div>
                    <div className="text-sm text-muted-foreground">Communities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{defaultStats.posts}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{defaultStats.followers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{defaultStats.following}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{defaultStats.reputation}</div>
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
                  {defaultBadges.map((badge: any, index: number) => (
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
                {userData.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Website</div>
                      <a href={userData.website} className="text-sm text-blue-600 hover:underline">
                        {userData.website}
                      </a>
                    </div>
                  </div>
                )}
                {userData.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="text-sm">{userData.phone}</div>
                    </div>
                  </div>
                )}
                {userData.occupation && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Occupation</div>
                      <div className="text-sm">{userData.occupation}</div>
                    </div>
                  </div>
                )}
                {userData.education && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Education</div>
                      <div className="text-sm">{userData.education}</div>
                    </div>
                  </div>
                )}
                {!userData.website && !userData.phone && !userData.occupation && !userData.education && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No contact information added yet.</p>
                    <p className="text-xs mt-1">Click "Edit Profile" to add your details.</p>
                  </div>
                )}
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

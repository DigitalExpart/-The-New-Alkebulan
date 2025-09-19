"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { Users, Plus, Calendar, MapPin, Tag } from "lucide-react"
import { toast } from "sonner"

interface Community {
  id: string
  name: string
  description: string
  member_count: number
  category: string
  location: string
  is_public: boolean
  tags: string[]
  created_at: string
  role: string
  joined_at: string
}

export default function MyCommunitiesPage() {
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserCommunities()
    }
  }, [user])

  const fetchUserCommunities = async () => {
    if (!user || !supabase) return

    try {
      setLoading(true)
      
      // Get communities where user is a member
      const { data: memberships, error: membershipError } = await supabase
        .from('community_members')
        .select(`
          community_id,
          role,
          joined_at,
          communities (
            id,
            name,
            description,
            member_count,
            category,
            location,
            is_public,
            tags,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (membershipError) {
        console.error('Error fetching memberships:', membershipError)
        toast.error('Failed to load communities')
        return
      }

      const userCommunities: Community[] = (memberships || [])
        .map((membership: any) => ({
          ...membership.communities,
          role: membership.role,
          joined_at: membership.joined_at
        }))
        .filter(Boolean)

      setCommunities(userCommunities)
    } catch (error) {
      console.error('Error fetching user communities:', error)
      toast.error('Failed to load communities')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your communities...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Communities</h1>
          <p className="text-muted-foreground mt-2">
            Communities you're part of
          </p>
        </div>
        <Button asChild>
          <Link href="/communities/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Community
          </Link>
        </Button>
      </div>

      {communities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Communities Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't joined any communities yet. Explore and join communities that interest you!
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/communities">
                  Browse Communities
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/communities/create">
                  Create Community
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Card key={community.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{community.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {community.description}
                    </p>
                  </div>
                  <Badge variant={community.role === 'admin' ? 'default' : 'secondary'}>
                    {community.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {community.member_count} members
                  </div>
                  
                  {community.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {community.location}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {new Date(community.joined_at).toLocaleDateString()}
                  </div>

                  {community.tags && community.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {community.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {community.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{community.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button asChild className="w-full">
                      <Link href={`/communities/${community.id}`}>
                        View Community
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

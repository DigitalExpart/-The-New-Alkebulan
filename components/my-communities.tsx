"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  MapPin, 
  Calendar, 
  Edit, 
  Trash2, 
  Settings,
  Plus,
  MessageSquare,
  Heart
} from "lucide-react"
import { toast } from "sonner"

interface Community {
  id: string
  name: string
  description: string
  category: string
  location: string | null
  member_count: number
  created_at: string
  status: string
  tags: string[]
}

export default function MyCommunities() {
  const router = useRouter()
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMyCommunities()
    }
  }, [user])

  const fetchMyCommunities = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching communities:', error)
        toast.error('Failed to load communities')
        return
      }

      setCommunities(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load communities')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCommunity = async (communityId: string, communityName: string) => {
    if (!confirm(`Are you sure you want to delete "${communityName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const supabase = getSupabaseClient()
      
      // Delete community members first
      await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)

      // Delete community posts
      await supabase
        .from('community_posts')
        .delete()
        .eq('community_id', communityId)

      // Delete the community
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId)

      if (error) {
        throw error
      }

      toast.success(`Community "${communityName}" deleted successfully`)
      fetchMyCommunities() // Refresh the list
    } catch (error) {
      console.error('Error deleting community:', error)
      toast.error('Failed to delete community')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground text-sm">Loading communities...</p>
      </div>
    )
  }

  if (communities.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No communities yet</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Create your first community to start building connections
        </p>
        <Button onClick={() => router.push("/communities/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {communities.map((community) => (
        <Card key={community.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{community.name}</h3>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {community.category}
                  </Badge>
                  {community.status === 'active' && (
                    <Badge variant="default" className="text-xs bg-green-500">
                      Active
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {community.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  {community.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{community.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{community.member_count} member{community.member_count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDate(community.created_at)}</span>
                  </div>
                </div>

                {community.tags && community.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {community.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
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
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/communities/${community.id}`)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/communities/${community.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/communities/${community.id}/manage`)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Manage
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCommunity(community.id, community.name)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

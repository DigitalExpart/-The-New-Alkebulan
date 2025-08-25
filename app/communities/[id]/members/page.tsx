"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Users, Crown, User, Calendar, MapPin, Mail, Building2, Search, ArrowLeft } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface CommunityMember {
  id: string
  user_id: string
  role: string
  joined_at: string
  user: {
    first_name: string
    last_name: string
    avatar_url?: string
    bio?: string
    location?: string
    company?: string
    job_title?: string
  } | null
}

interface Community {
  id: string
  name: string
  description: string
  category: string
  location: string
  member_count: number
  tags: string[]
  created_at: string
  created_by: string
}

export default function CommunityMembersPage() {
  const params = useParams()
  const router = useRouter()
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const communityId = params.id as string
  
  // Debug logging
  console.log('CommunityMembersPage loaded with ID:', communityId)
  console.log('Params:', params)

  useEffect(() => {
    fetchCommunity()
  }, [communityId])

  // Fetch members after community data is loaded
  useEffect(() => {
    if (community) {
      fetchMembers()
    }
  }, [community])

  const fetchCommunity = async () => {
    try {
      console.log('Fetching community with ID:', communityId)
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Community data received:', data)
      console.log('Community member count:', data?.member_count)
      setCommunity(data)
    } catch (error) {
      console.error('Error fetching community:', error)
      toast.error("Failed to load community")
    }
  }

  const fetchMembers = async () => {
    try {
      const supabase = getSupabaseClient()

      // Fetch members with their profile (first_name, last_name, avatar_url)
      const { data: rows, error } = await supabase
        .from('community_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles:profiles!community_members_user_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: true })

      if (error) throw error

      if (!rows || rows.length === 0) {
        // Fallback: show owner as the only member if table is empty
        if (community?.created_by) {
          setMembers([
            {
              id: 'fallback-owner',
              user_id: community.created_by,
              role: 'owner',
              joined_at: community.created_at,
              user: {
                first_name: 'Community',
                last_name: 'Owner',
                avatar_url: null,
                bio: null,
                location: null,
                company: null,
                job_title: null
              }
            }
          ])
        } else {
          setMembers([])
        }
        return
      }

      const mapped: CommunityMember[] = rows.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        role: r.role,
        joined_at: r.joined_at,
        user: {
          first_name: r.profiles?.first_name ?? 'User',
          last_name: r.profiles?.last_name ?? '',
          avatar_url: r.profiles?.avatar_url ?? null,
          bio: null,
          location: null,
          company: null,
          job_title: null
        }
      }))

      setMembers(mapped)
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load community members')
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (member: CommunityMember) => {
    const profile = member.user
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return `User ${member.user_id.slice(0, 8)}`
  }

  const getRoleBadge = (role: string, isOwner: boolean) => {
    if (isOwner) {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-yellow-600">
          <Crown className="h-3 w-3" />
          Owner
        </Badge>
      )
    }
    
    switch (role) {
      case 'admin':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Admin
          </Badge>
        )
      case 'moderator':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Moderator
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            Member
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewProfile = (member: CommunityMember) => {
    // Navigate to user profile page
    router.push(`/profile/${member.user_id}`)
  }

  const handleAddFriend = async (member: CommunityMember) => {
    try {
      // Add friend logic here
      toast.success(`Friend request sent to ${getDisplayName(member)}`)
    } catch (error) {
      toast.error('Failed to send friend request')
    }
  }

  const handleSendMessage = (member: CommunityMember) => {
    // Navigate to messages page with user pre-selected
    router.push(`/messages?user=${member.user_id}`)
  }

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true
    
    const displayName = getDisplayName(member).toLowerCase()
    const role = member.role.toLowerCase()
    
    return displayName.includes(searchQuery.toLowerCase()) || 
           role.includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground mb-4">Loading community members...</p>
          <p className="text-xs text-muted-foreground">Community ID: {communityId}</p>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Community not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">
            {community ? `${community.name} - Members` : 'Loading...'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {community ? `Connect with the ${members.length} members of this community` : 'Loading community...'}
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const isOwner = member.user_id === community.created_by
            return (
              <Card key={member.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.user?.avatar_url} />
                      <AvatarFallback className="text-xl">
                        {getDisplayName(member).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg truncate">{getDisplayName(member)}</h3>
                        {getRoleBadge(member.role, isOwner)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        Joined {formatDate(member.joined_at)}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(member)}
                          className="text-xs"
                        >
                          <User className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddFriend(member)}
                          className="text-xs"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Add Friend
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendMessage(member)}
                          className="text-xs"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No members found matching your search' : 'No members yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search to find the member you\'re looking for.'
                    : 'This community doesn\'t have any members yet.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

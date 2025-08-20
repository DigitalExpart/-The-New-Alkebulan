"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Users, Crown, User, Calendar, MapPin, Mail, Building2, Search, Loader2, ArrowLeft } from "lucide-react"
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
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null)
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
      console.log('Fetching members for community ID:', communityId)
      const supabase = getSupabaseClient()
      
      // First, get the community members
      console.log('Fetching members from community_members table for community ID:', communityId)
      
      let membersData = null
      let membersError = null
      
      try {
        console.log('Querying community_members table for community_id:', communityId)
        const { data, error } = await supabase
          .from('community_members')
          .select('id, user_id, role, joined_at')
          .eq('community_id', communityId)
          .order('joined_at', { ascending: true })
        
        if (error) {
          console.log('Supabase query error:', error)
          membersError = error
        } else {
          console.log('Raw query result:', data)
          membersData = data
        }
      } catch (tableError) {
        console.log('Exception accessing community_members table:', tableError)
        membersError = tableError
      }

      if (membersError) {
        console.error('Supabase members error:', membersError)
        // Try to create a basic member entry for the community owner
        console.log('Attempting to create basic member data for community owner')
        if (community?.created_by) {
          const basicMember = {
            id: 'temp-id',
            user_id: community.created_by,
            role: 'owner',
            joined_at: community.created_at,
            user: {
              id: community.created_by,
              first_name: 'Community',
              last_name: 'Owner',
              avatar_url: null,
              bio: null,
              location: null,
              company: null,
              job_title: null
            }
          }
          setMembers([basicMember])
          return
        }
        // If community data isn't loaded yet, just show empty state
        console.log('Community data not loaded yet, showing empty state')
        setMembers([])
        return
      }

      if (!membersData || membersData.length === 0) {
        console.log('No members found in community_members table')
        
        // If no members found, create a basic entry for the community owner
        if (community?.created_by) {
          console.log('Creating basic member entry for community owner:', community.created_by)
          const basicMember = {
            id: 'owner-temp-id',
            user_id: community.created_by,
            role: 'owner',
            joined_at: community.created_at,
            user: {
              id: community.created_by,
              first_name: 'Community',
              last_name: 'Owner',
              avatar_url: null,
              bio: null,
              location: null,
              company: null,
              job_title: null
            }
          }
          setMembers([basicMember])
          return
        }
        
        setMembers([])
        return
      }

      console.log('Raw members data:', membersData)

      // Then, get the user profiles for each member
      const userIds = membersData.map(member => member.user_id)
      console.log('Fetching profiles for user IDs:', userIds)
      
      let profilesData = null
      let profilesError = null
      
      // Try to fetch from profiles table first
      try {
        console.log('Attempting to fetch from profiles table...')
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, bio, location, company, job_title')
          .in('id', userIds)
        
        if (error) {
          console.log('Profiles table error:', error)
          profilesError = error
        } else {
          console.log('Successfully fetched from profiles table:', data)
          profilesData = data
        }
      } catch (profileError) {
        console.log('Exception fetching from profiles table:', profileError)
        profilesError = profileError
      }

      // If profiles table failed, try auth.users as fallback
      if (!profilesData && !profilesError) {
        try {
          console.log('Attempting to fetch from auth.users...')
          const { data, error } = await supabase
            .from('auth.users')
            .select('id, email')
            .in('id', userIds)
          
          if (error) {
            console.log('Auth.users table error:', error)
            profilesError = error
          } else {
            console.log('Successfully fetched from auth.users:', data)
            profilesData = data
          }
        } catch (authError) {
          console.log('Exception fetching from auth.users:', authError)
          profilesError = authError
        }
      }

      // If both failed, try to get user data from the current auth session
      if (!profilesData && !profilesError) {
        try {
          console.log('Attempting to get user data from auth session...')
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            console.log('Current user found:', user)
            // Create a basic profile for the current user if they're in the member list
            if (userIds.includes(user.id)) {
              profilesData = [{
                id: user.id,
                email: user.email,
                first_name: user.email?.split('@')[0] || 'User',
                last_name: '',
                avatar_url: null,
                bio: null,
                location: null,
                company: null,
                job_title: null
              }]
            }
          }
        } catch (authSessionError) {
          console.log('Error getting auth session:', authSessionError)
        }
      }

      if (profilesError) {
        console.error('Supabase profiles error:', profilesError)
        console.log('Error details:', JSON.stringify(profilesError, null, 2))
        // Don't throw error, just continue with basic member data
        console.log('Continuing with basic member data only')
      }

      console.log('Raw profiles data:', profilesData)

      // Combine the data
      const combinedMembers = membersData.map(member => {
        let profile = null
        
        if (profilesData) {
          profile = profilesData.find(p => p.id === member.user_id) || null
          
          // If we got email data from auth.users, format it properly
          if (profile && profile.email && !profile.first_name) {
            profile = {
              id: member.user_id,
              first_name: profile.email.split('@')[0],
              last_name: '',
              avatar_url: null,
              bio: null,
              location: null,
              company: null,
              job_title: null
            }
          }
          
          // If we have partial profile data, fill in missing fields
          if (profile) {
            profile = {
              id: member.user_id,
              first_name: profile.first_name || 'User',
              last_name: profile.last_name || '',
              avatar_url: profile.avatar_url || null,
              bio: profile.bio || null,
              location: profile.location || null,
              company: profile.company || null,
              job_title: profile.job_title || null
            }
          }
        }
        
        // If no profile data, create a basic one
        if (!profile) {
          // Try to create a more user-friendly name from the user ID
          const userId = member.user_id
          const firstName = `User_${userId.slice(0, 4)}`
          const lastName = userId.slice(4, 8)
          
          profile = {
            id: member.user_id,
            first_name: firstName,
            last_name: lastName,
            avatar_url: null,
            bio: null,
            location: null,
            company: null,
            job_title: null
          }
        }
        
        return {
          ...member,
          user: profile
        }
      })

      console.log('Members data received:', combinedMembers)
      setMembers(combinedMembers)
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
            {community ? `Connect with the ${community.member_count} members of this community` : 'Loading community...'}
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
              <Dialog key={member.id}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer w-full"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.user?.avatar_url} />
                        <AvatarFallback className="text-lg">
                          {getDisplayName(member).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium truncate">{getDisplayName(member)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleBadge(member.role, isOwner)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {formatDate(member.joined_at)}
                        </p>
                      </div>
                    </div>
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Member Profile
                    </DialogTitle>
                  </DialogHeader>
                  
                  {selectedMember && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Avatar className="h-20 w-20 mx-auto mb-3">
                          <AvatarImage src={selectedMember.user?.avatar_url} />
                          <AvatarFallback className="text-2xl">
                            {getDisplayName(selectedMember).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-semibold">{getDisplayName(selectedMember)}</h3>
                        <div className="flex justify-center mt-2">
                          {getRoleBadge(selectedMember.role, selectedMember.user_id === community.created_by)}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedMember.user?.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedMember.user.location}</span>
                          </div>
                        )}
                        
                        {selectedMember.user?.company && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedMember.user.company}</span>
                            {selectedMember.user?.job_title && (
                              <span className="text-muted-foreground">• {selectedMember.user.job_title}</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Member since {formatDate(selectedMember.joined_at)}
                          </span>
                        </div>
                        
                        {selectedMember.user?.bio && (
                          <div className="pt-2">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {selectedMember.user.bio}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
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

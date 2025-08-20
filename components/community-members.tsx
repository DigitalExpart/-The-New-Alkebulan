"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Users, Crown, User, Calendar, MapPin, Mail, Building2, Search, Loader2 } from "lucide-react"
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

interface CommunityMembersProps {
  communityId: string
  memberCount: number
}

export default function CommunityMembers({ communityId, memberCount }: CommunityMembersProps) {
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchMembers()
  }, [communityId])

  const fetchMembers = async () => {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          user:profiles!community_members_user_id_fkey(
            first_name,
            last_name,
            avatar_url,
            bio,
            location,
            company,
            job_title
          )
        `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: true })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load community members')
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (member: CommunityMember) => {
    const profile = member.user.profiles
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return member.user.email.split('@')[0]
  }

  const getRoleBadge = (role: string) => {
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
    const email = member.user.email.toLowerCase()
    const role = member.role.toLowerCase()
    
    return displayName.includes(searchQuery.toLowerCase()) || 
           email.includes(searchQuery.toLowerCase()) || 
           role.includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Members ({memberCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm mb-4">Loading members...</p>
            <Button 
              variant="outline" 
              onClick={fetchMembers}
              size="sm"
            >
              <Loader2 className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Community Members ({filteredMembers.length}
          {searchQuery && filteredMembers.length !== members.length && ` of ${members.length}`})
        </CardTitle>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No members found matching your search' : 'No members yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Dialog key={member.id}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.user.profiles?.avatar_url} />
                        <AvatarFallback className="text-lg">
                          {getDisplayName(member).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium truncate">{getDisplayName(member)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleBadge(member.role)}
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
                          <AvatarImage src={selectedMember.user.profiles?.avatar_url} />
                          <AvatarFallback className="text-2xl">
                            {getDisplayName(selectedMember).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-semibold">{getDisplayName(selectedMember)}</h3>
                        <div className="flex justify-center mt-2">
                          {getRoleBadge(selectedMember.role)}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{selectedMember.user.email}</span>
                        </div>
                        
                        {selectedMember.user.profiles?.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedMember.user.profiles.location}</span>
                          </div>
                        )}
                        
                        {selectedMember.user.profiles?.company && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedMember.user.profiles.company}</span>
                            {selectedMember.user.profiles?.job_title && (
                              <span className="text-muted-foreground">• {selectedMember.user.profiles.job_title}</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Member since {formatDate(selectedMember.joined_at)}
                          </span>
                        </div>
                        
                        {selectedMember.user.profiles?.bio && (
                          <div className="pt-2">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {selectedMember.user.profiles.bio}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

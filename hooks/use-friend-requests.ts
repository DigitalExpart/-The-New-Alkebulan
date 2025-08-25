"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

export interface FriendRequest {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  profile: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

export function useFriendRequests() {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch pending friend requests
  const fetchPendingRequests = async () => {
    if (!user) return

    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, status, created_at')
        .eq('friend_id', user.id)
        .eq('status', 'pending')

      if (error) {
        console.error('Error fetching friend requests:', error)
        return
      }

      const senderIds = (data || []).map((i: any) => i.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', senderIds)

      const requests = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        friend_id: item.friend_id,
        status: item.status,
        created_at: item.created_at,
        profile: profiles?.find(p => p.id === item.user_id) || null
      }))

      setPendingRequests(requests)
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch sent (outgoing) friend requests
  const fetchSentRequests = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'pending')

      if (error) {
        console.error('Error fetching sent friend requests:', error)
        return
      }

      const recipientIds = (data || []).map((i: any) => i.friend_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', recipientIds)

      const requests = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        friend_id: item.friend_id,
        status: item.status,
        created_at: item.created_at,
        profile: profiles?.find(p => p.id === item.friend_id) || null
      }))

      setSentRequests(requests)
    } catch (error) {
      console.error('Error fetching sent friend requests:', error)
    }
  }

  // Accept friend request
  const acceptRequest = async (requestId: string) => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      // Update friendship status to accepted
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      if (error) {
        toast.error('Failed to accept friend request')
        return
      }

      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== requestId))
      
      toast.success('Friend request accepted!')
      
      // Refresh the list
      await fetchPendingRequests()
    } catch (error) {
      console.error('Error accepting friend request:', error)
      toast.error('Failed to accept friend request')
    }
  }

  // Reject friend request
  const rejectRequest = async (requestId: string) => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      // Update friendship status to rejected
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (error) {
        toast.error('Failed to reject friend request')
        return
      }

      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== requestId))
      
      toast.success('Friend request rejected')
      
      // Refresh the list
      await fetchPendingRequests()
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      toast.error('Failed to reject friend request')
    }
  }

  // Send friend request
  const sendRequest = async (friendId: string) => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      // Check if request already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .single()

      if (existing) {
        if (existing.status === 'pending') {
          toast.error('Friend request already sent')
        } else if (existing.status === 'accepted') {
          toast.error('You are already friends')
        } else if (existing.status === 'rejected') {
          toast.error('Friend request was previously rejected')
        }
        return
      }

      // Create new friendship request
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        })

      if (error) {
        toast.error('Failed to send friend request')
        return
      }

      toast.success('Friend request sent!')
    } catch (error) {
      console.error('Error sending friend request:', error)
      toast.error('Failed to send friend request')
    }
  }

  // Fetch requests on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchPendingRequests()
      fetchSentRequests()
    }
  }, [user])

  // Realtime updates
  useEffect(() => {
    if (!user) return
    const supabase = getSupabaseClient()

    const channelIncoming = supabase
      .channel(`friendships-incoming-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friendships', filter: `friend_id=eq.${user.id}` },
        () => {
          fetchPendingRequests()
          fetchSentRequests()
        }
      )
      .subscribe()

    const channelOutgoing = supabase
      .channel(`friendships-outgoing-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friendships', filter: `user_id=eq.${user.id}` },
        () => {
          fetchPendingRequests()
          fetchSentRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelIncoming)
      supabase.removeChannel(channelOutgoing)
    }
  }, [user])

  return {
    pendingRequests,
    sentRequests,
    loading,
    acceptRequest,
    rejectRequest,
    sendRequest,
    fetchPendingRequests,
    fetchSentRequests
  }
}

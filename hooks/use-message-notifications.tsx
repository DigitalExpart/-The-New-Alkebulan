"use client"

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from './use-auth'

export function useMessageNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!user?.id || !supabase) {
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        // Get all conversations where user is a participant
        const { data: conversations, error: convError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id)

        if (convError) {
          console.error('Error fetching conversations:', convError)
          return
        }

        if (!conversations || conversations.length === 0) {
          setUnreadCount(0)
          setLoading(false)
          return
        }

        const conversationIds = conversations.map(c => c.conversation_id)

        // Detect if the messages table has an is_read column
        let hasIsRead = true
        const { error: isReadTestError } = await supabase
          .from('messages')
          .select('is_read')
          .limit(1)

        if (isReadTestError) {
          // If Postgres says the column does not exist (code 42703), disable is_read usage
          const msg = (isReadTestError as any)?.message || ''
          if ((isReadTestError as any)?.code === '42703' || /column\s+.*is_read.*\s+does not exist/i.test(msg)) {
            hasIsRead = false
          }
        }

        // Use count-only queries for efficiency
        if (hasIsRead) {
          const { count, error } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .eq('is_read', false)
            .neq('sender_id', user.id)

          if (error) {
            console.error('Error fetching unread messages with is_read:', error)
            setUnreadCount(0)
          } else {
            setUnreadCount(count ?? 0)
          }
        } else {
          // Fallback: count all messages not sent by current user
          const { count, error } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .neq('sender_id', user.id)

          if (error) {
            console.error('Error fetching fallback unread messages:', error)
            setUnreadCount(0)
          } else {
            setUnreadCount(count ?? 0)
          }
        }
      } catch (error) {
        console.error('Error in fetchUnreadCount:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()

    // Set up real-time subscription for new messages
    const messageChannel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as any
          
          // Only count messages not sent by current user
          if (newMessage.sender_id !== user.id) {
            // Check if this message is in a conversation where current user is a participant
            supabase
              .from('conversation_participants')
              .select('id')
              .eq('conversation_id', newMessage.conversation_id)
              .eq('user_id', user.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setUnreadCount(prev => prev + 1)
                }
              })
          }
        }
      )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages' },
          (payload) => {
            const updatedMessage = payload.new as any
            
            // If a message was marked as read, decrease unread count
            // Only if is_read column exists
            if (updatedMessage.is_read !== undefined && updatedMessage.is_read && updatedMessage.sender_id !== user.id) {
              setUnreadCount(prev => Math.max(0, prev - 1))
            }
          }
        )
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
    }
  }, [user?.id, supabase])

  const markMessageAsRead = async (messageId: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) {
        console.error('Error marking message as read:', error)
      }
    } catch (error) {
      console.error('Error in markMessageAsRead:', error)
    }
  }

  const markAllMessagesAsRead = async () => {
    if (!user?.id || !supabase) return

    try {
      // Get all conversations where user is a participant
      const { data: conversations, error: convError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)

      if (convError) {
        console.error('Error fetching conversations:', convError)
        return
      }

      if (!conversations || conversations.length === 0) return

      const conversationIds = conversations.map(c => c.conversation_id)

      // Mark all unread messages as read
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .neq('sender_id', user.id)

      if (error) {
        console.error('Error marking all messages as read:', error)
      } else {
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error in markAllMessagesAsRead:', error)
    }
  }

  return {
    unreadCount,
    loading,
    markMessageAsRead,
    markAllMessagesAsRead
  }
}

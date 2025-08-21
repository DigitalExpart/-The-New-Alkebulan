"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface User {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
  isOnline?: boolean
  lastSeen?: Date
}

interface Message {
  id: string
  sender_id: string
  content: string
  timestamp: Date
  is_read: boolean
  type: string
}

interface Conversation {
  id: string
  participants: User[]
  lastMessage: Message
  unreadCount: number
  updatedAt: Date
  isTyping: boolean
}

interface ConversationListProps {
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
  isOpen: boolean
  onClose: () => void
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
  isOpen,
  onClose,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const selectedUserId = searchParams.get('user')

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to view messages")
        return
      }

      // Get all conversations where current user is a participant
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          conversation_participants!inner(
            user_id,
            profiles(
              id,
              first_name,
              last_name,
              avatar_url
            )
          ),
          messages(
            id,
            sender_id,
            content,
            timestamp,
            is_read
          )
        `)
        .eq('conversation_participants.user_id', user.id)

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError)
        toast.error('Failed to load conversations')
        return
      }

      // Transform the data
      const transformedConversations: Conversation[] = conversationsData.map(conv => {
        const participants = conv.conversation_participants
          .filter(p => p.user_id !== user.id)
          .map(p => ({
            id: p.user_id,
            first_name: p.profiles?.first_name || 'User',
            last_name: p.profiles?.last_name || '',
            avatar_url: p.profiles?.avatar_url || null,
            isOnline: Math.random() > 0.5, // TODO: Implement real online status
            lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
          }))

        const messages = conv.messages || []
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null
        
        // Calculate unread count
        const unreadCount = messages.filter(m => 
          m.sender_id !== user.id && !m.is_read
        ).length

        return {
          id: conv.id,
          participants,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            sender_id: lastMessage.sender_id,
            content: lastMessage.content,
            timestamp: new Date(lastMessage.timestamp),
            is_read: lastMessage.is_read,
            type: lastMessage.type || 'text'
          } : {
            id: 'no-message',
            sender_id: user.id,
            content: 'No messages yet',
            timestamp: new Date(conv.created_at),
            is_read: true,
            type: 'text'
          },
          unreadCount,
          updatedAt: new Date(conv.updated_at || conv.created_at),
          isTyping: false
        }
      })

      setConversations(transformedConversations)

      // If a user is selected from URL, find or create conversation
      if (selectedUserId && selectedUserId !== user.id) {
        const existingConversation = transformedConversations.find(conv => 
          conv.participants.some(p => p.id === selectedUserId)
        )

        if (existingConversation) {
          onSelectConversation(existingConversation.id)
        } else {
          // Create new conversation
          await createConversation(selectedUserId)
        }
      }

    } catch (error) {
      console.error('Error fetching conversations:', error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
        
        if (error.message.includes('relation "conversations" does not exist')) {
          toast.error('Messaging system not set up. Please contact support.')
        } else if (error.message.includes('permission denied')) {
          toast.error('Access denied. Please sign in again.')
        } else {
          toast.error(`Failed to load conversations: ${error.message}`)
        }
      } else {
        console.error('Unknown error type:', typeof error, error)
        toast.error('Failed to load conversations')
      }
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (otherUserId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (convError) throw convError

      // Add participants
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: user.id },
          { conversation_id: conversation.id, user_id: otherUserId }
        ])

      if (participantError) throw participantError

      // Refresh conversations
      await fetchConversations()

    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to create conversation')
    }
  }

  const filteredConversations = conversations.filter((conversation) =>
    conversation.participants.some(
      (participant) =>
        participant.id !== "current-user" && 
        `${participant.first_name} ${participant.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  )

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = diff / (1000 * 60 * 60)

    if (hours < 1) {
      return "now"
    } else if (hours < 24) {
      return `${Math.floor(hours)}h`
    } else if (hours < 48) {
      return "1d"
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const TypingIndicator = () => (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
      </div>
      <span className="text-xs text-primary ml-1">typing</span>
    </div>
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-80 lg:w-80 
        bg-background border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col
      `}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchQuery ? "No conversations found" : "No messages yet"}
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants[0] // Get first participant (other than current user)
              if (!otherParticipant) return null

              const displayName = `${otherParticipant.first_name} ${otherParticipant.last_name}`.trim() || 'User'

              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    onSelectConversation(conversation.id)
                    onClose() // Close sidebar on mobile after selection
                  }}
                  className={`
                    p-4 border-b border-border cursor-pointer 
                    hover:bg-accent transition-colors
                    ${selectedConversationId === conversation.id ? "bg-accent" : ""}
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherParticipant.avatar_url || undefined} alt={displayName} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {otherParticipant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium truncate">{displayName}</h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          {conversation.isTyping ? (
                            <TypingIndicator />
                          ) : (
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.sender_id === "current-user" ? "You: " : ""}
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs ml-2 min-w-[20px] h-5 flex items-center justify-center">
                            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

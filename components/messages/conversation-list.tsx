"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
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
  message_type?: string;
  media_url?: string;
}

interface Conversation {
  id: string
  participants: User[]
  lastMessage: Message
  unreadCount: number
  updatedAt: Date
  isTyping: boolean
  isArchived: boolean
  isLocked: boolean
  isMuted: boolean
  notificationLevel: "all" | "mentions" | "none"
  theme: "default" | "gold" | "forest" | "contrast"
  clearedAt: Date | null
}

interface ConversationListProps {
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
  isOpen: boolean
  onClose: () => void
  chatPartnerId?: string // New prop to receive user ID from URL
  initialShowArchived?: boolean
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
  isOpen,
  onClose,
  chatPartnerId, // Destructure new prop
  initialShowArchived = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(!!initialShowArchived)
  const supabase = getSupabaseClient()
  // const searchParams = useSearchParams() // No longer directly used here for initial user ID
  // const selectedUserId = searchParams.get('user') // No longer directly used here for initial user ID

  // Effect to fetch all existing conversations for the current user
  useEffect(() => {
    fetchConversations()
  }, [supabase, chatPartnerId, onSelectConversation, showArchived]) // Refetch when switching inbox/archived

  // Listen for global refresh events (e.g., archive/unarchive from ChatWindow)
  useEffect(() => {
    const handler = () => {
      fetchConversations()
    }
    // @ts-ignore - CustomEvent type in browser
    window.addEventListener('conversations:refresh', handler)
    return () => {
      // @ts-ignore
      window.removeEventListener('conversations:refresh', handler)
    }
  }, [])

  // Effect to handle initial chat setup if a chatPartnerId is provided via URL
  useEffect(() => {
    const handleInitialChatSetup = async () => {
      // Run only once for initial deep-link; don't override user's manual selection
      if (!chatPartnerId || selectedConversationId) return

      // Only run if a conversation is not already selected for this chatPartnerId
      const isChatPartnerConversationSelected = conversations.some(conv => 
        conv.participants.some(p => p.id === chatPartnerId) && conv.id === selectedConversationId
      )
      if (isChatPartnerConversationSelected) return

      setLoading(true) // Start loading for initial chat setup

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error("Please sign in to view messages")
          setLoading(false)
          return
        }

        // Find if a conversation already exists with this chatPartnerId in the *current* conversations state
        const existingConversation = conversations.find(conv => 
          conv.participants.some(p => p.id === chatPartnerId)
        )

        if (existingConversation) {
          // Only select if not already selected to prevent infinite loop
          if (selectedConversationId !== existingConversation.id) {
            onSelectConversation(existingConversation.id)
          }
        } else {
          // Only create if not already creating (to prevent duplicate RPC calls for a new chat partner)
          // Check if we're already in the process of creating for this specific chatPartnerId
          const isCreatingForThisPartner = conversations.some(conv => conv.id === `creating-${chatPartnerId}`)
          if (isCreatingForThisPartner) {
            setLoading(false)
            return
          }

          console.log(`Attempting to create conversation with ${chatPartnerId}`)
          const { data: newConversationId, error: rpcError } = await supabase
            .rpc('create_conversation_and_participants', { other_user_id: chatPartnerId })

          if (rpcError) throw rpcError

          if (newConversationId) {
            console.log(`New conversation created: ${newConversationId}`)
            // Explicitly set a temporary conversation to avoid immediate re-trigger and re-creation
            // This temporary ID will be replaced once fetchConversations updates the list with the real one
            setConversations(prev => [
              ...prev,
              {
                id: `creating-${chatPartnerId}`,
                participants: [],
                lastMessage: { id: '', sender_id: '', content: 'Creating conversation...', timestamp: new Date(), is_read: false, type: 'text' },
                unreadCount: 0,
                updatedAt: new Date(),
                isTyping: false,
                isArchived: false,
                isLocked: false,
                isMuted: false,
                notificationLevel: "all",
                theme: "default",
                clearedAt: null,
              },
            ])

            await fetchConversations() // Re-fetch to get the newly created conversation with full data
            onSelectConversation(newConversationId) // Select the newly created one
          }
        }
      } catch (error: any) {
        console.error('Error during initial chat setup:', error)
        toast.error(`Failed to start conversation: ${error.message || "Unknown error"}`)
      } finally {
        setLoading(false) // Always stop loading for this effect
      }
    }

    handleInitialChatSetup()
  }, [chatPartnerId, conversations, supabase, onSelectConversation, selectedConversationId]) // Removed `loading` from deps

  const fetchConversations = async () => {
    try {
      if (!chatPartnerId) {
        setLoading(true)
      }
      
      // Check if Supabase is configured
      if (!supabase) {
        console.warn('Supabase not configured - skipping conversation fetch')
        setConversations([])
        setLoading(false)
        return
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to view messages")
        return
      }

      // Step 1: find conversation ids where user participates
      const { data: myParticipantRows, error: partErr } = await supabase
        .from('conversation_participants')
        .select('conversation_id, is_archived, is_locked, is_muted, notification_level, theme, cleared_at')
        .eq('user_id', user.id)

      if (partErr) {
        console.warn('Supabase Error (Step 1 - Fetching participant conversations):', partErr.message || partErr)
        
        // Check if this is a "table doesn't exist" error
        if (partErr.message?.includes('relation "conversation_participants" does not exist')) {
          console.warn('Messaging tables not set up yet. Please run the setup-messaging-tables.sql script in Supabase.')
          toast.error("Messaging system not set up. Please contact support.")
        }
        
        setLoading(false)
        return
      }

      const conversationIdsRaw = (myParticipantRows || [])
        .filter(r => (showArchived ? r.is_archived === true : r.is_archived !== true))
        .map(r => r.conversation_id)
      const conversationIds = Array.from(
        new Set(
          (conversationIdsRaw || []).filter((id: any) => typeof id === 'string' && id.length > 0)
        )
      )

      // If no conversations found for the user and no specific chat partner is requested, return early.
      if (conversationIds.length === 0 && !chatPartnerId) {
        setConversations([])
        setLoading(false)
        return
      }

      // If there are no conversation IDs to fetch, and a chat partner is being set up,
      // do not proceed with fetching conversations. The `handleInitialChatSetup`
      // will take care of creating it and triggering a re-fetch.
      if (conversationIds.length === 0 && chatPartnerId) {
        setLoading(false)
        return
      }

      // We try to fetch conversations meta, but if it fails we will synthesize records
      let convs: any[] = []
      const { data: convData, error: convErr } = await supabase
        .from('conversations')
        .select('id, created_at, updated_at')
        .in('id', conversationIds)

      if (convErr) {
        console.warn('Skipping conversations meta due to error:', convErr.message || convErr)
        // Synthesize minimal records to keep the UI working
        convs = conversationIds.map(id => ({ id, created_at: null, updated_at: null }))
      } else {
        convs = convData || []
      }

      // Step 3: fetch all participants for those conversations
      const { data: participantsRows, error: partsErr } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', conversationIds)

      if (partsErr) {
        console.warn('Supabase Error (Step 3 - Fetching all participants):', partsErr.message || partsErr)
      }

      // Determine "other" user ids per conversation
      const otherUserIdsByConv = new Map<string, string>()
      ;(participantsRows || []).forEach(row => {
        if (row.user_id !== user.id) {
          otherUserIdsByConv.set(row.conversation_id, row.user_id)
        }
      })

      // Fallback: if participants didn't return and we have a chatPartnerId, assume 1:1 with first conv id
      if (otherUserIdsByConv.size === 0 && chatPartnerId && conversationIds.length > 0) {
        otherUserIdsByConv.set(conversationIds[0], chatPartnerId)
      }

      let allOtherUserIds = Array.from(new Set(Array.from(otherUserIdsByConv.values())))

      // Add the chatPartnerId if it's not already in the list of other user IDs
      if (chatPartnerId && chatPartnerId !== user.id && !allOtherUserIds.includes(chatPartnerId)) {
        allOtherUserIds.push(chatPartnerId)
      }

      // Step 4: fetch profiles for the other participants
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', allOtherUserIds)

      if (profErr) {
        console.warn('Supabase Error (Step 4 - Fetching profiles):', profErr.message || profErr)
      }

      // Step 5: fetch messages per conversation (parallel) to avoid large IN queries that can fail
      let safeMsgs: any[] = []
      try {
        const results = await Promise.all(
          conversationIds.map(async (cid: string) => {
            const { data, error } = await supabase
              .from('messages')
              .select('id, conversation_id, sender_id, content, timestamp, is_read, type, message_type, media_url')
              .eq('conversation_id', cid)
              .order('timestamp', { ascending: true })

            if (error) {
              console.warn(`Supabase Error (Step 5 - messages for ${cid}):`, error.message || error)
              return []
            }
            return data || []
          })
        )
        safeMsgs = results.flat()
      } catch (e: any) {
        console.error('Supabase Error (Step 5 - Fetching messages):', e?.message || e)
        safeMsgs = []
      }

      const messagesByConv = new Map<string, any[]>()
      ;(safeMsgs || []).forEach(m => {
        const arr = messagesByConv.get(m.conversation_id) || []
        arr.push(m)
        messagesByConv.set(m.conversation_id, arr)
      })

      const transformedConversationsAll: (Conversation | null)[] = (convs || [])
        .map((conv: any) => {
          const convMsgs = messagesByConv.get(conv.id) || []
          const otherId = otherUserIdsByConv.get(conv.id)
          if (!otherId) return null
          const prof = profiles?.find(p => p.id === otherId)
          if (!prof) return null

          const last = convMsgs.length > 0 ? convMsgs[convMsgs.length - 1] as Message : null;
          const unreadCount = convMsgs.filter(m => m.sender_id !== user.id && !m.is_read).length

          const displayUser: User = {
            id: otherId,
            first_name: prof.first_name || 'User',
            last_name: prof.last_name || '',
            avatar_url: prof.avatar_url || null,
            isOnline: false,
            lastSeen: last ? new Date(last.timestamp) : new Date(conv.updated_at || conv.created_at || new Date())
          }

          return {
            id: conv.id,
            participants: [displayUser],
            lastMessage: {
              id: last?.id || 'no-message',
              sender_id: last?.sender_id || user.id,
              content: last?.content || 'No messages yet',
              timestamp: new Date(last?.timestamp || conv.updated_at || conv.created_at || new Date()),
              is_read: last?.is_read || true,
              type: last?.type || 'text',
              message_type: last?.message_type ?? 'text',
              media_url: last?.media_url ?? null,
            } as Message,
            unreadCount,
            updatedAt: new Date(last?.timestamp || conv.updated_at || conv.created_at || new Date()),
            isTyping: false,
            isArchived: myParticipantRows?.find((p: any) => p.conversation_id === conv.id)?.is_archived || false,
            isLocked: myParticipantRows?.find((p: any) => p.conversation_id === conv.id)?.is_locked || false,
            isMuted: myParticipantRows?.find((p: any) => p.conversation_id === conv.id)?.is_muted || false,
            notificationLevel: myParticipantRows?.find((p: any) => p.conversation_id === conv.id)?.notification_level || 'all',
            theme: myParticipantRows?.find((p: any) => p.conversation_id === conv.id)?.theme || 'default',
            clearedAt: myParticipantRows?.find((p: any) => p.conversation_id === conv.id)?.cleared_at ? new Date(myParticipantRows.find((p: any) => p.conversation_id === conv.id)?.cleared_at) : null,
          }
        });

      const filteredConversations: Conversation[] = transformedConversationsAll.filter((c): c is Conversation => c !== null);

      // Deduplicate by other participant id: keep the thread with more messages, then latest activity
      const bestByPeer = new Map<string, { conv: Conversation; msgCount: number; lastTs: number }>()
      for (const conv of filteredConversations) {
        const peerId = conv.participants[0]?.id
        if (!peerId) continue
        const msgCount = (messagesByConv.get(conv.id) || []).length
        const lastTs = conv.lastMessage?.timestamp?.getTime?.() || conv.updatedAt.getTime()
        const existing = bestByPeer.get(peerId)
        if (!existing || msgCount > existing.msgCount || (msgCount === existing.msgCount && lastTs > existing.lastTs)) {
          bestByPeer.set(peerId, { conv, msgCount, lastTs })
        }
      }
      const transformedConversations = Array.from(bestByPeer.values())
        .map(v => v.conv)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      setConversations(transformedConversations);
      
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

      // Call the RPC function to create the conversation and add participants
      const { data: newConversationId, error: rpcError } = await supabase
        .rpc('create_conversation_and_participants', { other_user_id: otherUserId })

      if (rpcError) throw rpcError

      // Refresh conversations (which will now include the newly created one)
      await fetchConversations()

      // Explicitly select the newly created conversation
      if (newConversationId) {
        onSelectConversation(newConversationId)
      }

    } catch (error: any) {
      console.error('Error creating conversation via RPC:', error)
      toast.error(`Failed to create conversation: ${error.message || "Unknown error"}`)
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
          <div className="mt-3 flex items-center justify-between">
            <Link href="/messages">
              <Button
                variant="outline"
                size="sm"
                className={!showArchived ? 'bg-accent' : ''}
                onClick={(e) => {
                  // Let navigation occur; maintain visual state
                }}
              >
                Inbox
              </Button>
            </Link>
            <Link href="/messages/archived">
              <Button
                variant="outline"
                size="sm"
                className={showArchived ? 'bg-accent' : ''}
                onClick={(e) => {
                  // Let navigation occur; maintain visual state
                }}
              >
                Archived chats
              </Button>
            </Link>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchQuery ? "No conversations found" : (
                <div>
                  <p className="mb-2">No messages yet</p>
                  <p className="text-xs">Start a conversation by messaging someone!</p>
                </div>
              )}
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

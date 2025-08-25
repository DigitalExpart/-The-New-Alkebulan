"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MoreVertical, Paperclip, Smile, Loader2, Menu } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"

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

interface ChatWindowProps {
  conversationId: string
  onOpenSidebar: () => void
}

export function ChatWindow({ conversationId, onOpenSidebar }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [conversationParticipants, setConversationParticipants] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchChatData = async () => {
      setLoading(true)
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !authUser) {
          toast.error("Authentication required to view chat.")
          setLoading(false)
          return
        }
        setCurrentUser({ id: authUser.id, first_name: authUser.user_metadata.first_name, last_name: authUser.user_metadata.last_name, avatar_url: authUser.user_metadata.avatar_url })

        // Fetch conversation details and participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('user_id, profiles(id, first_name, last_name, avatar_url)')
          .eq('conversation_id', conversationId)

        if (participantsError) throw participantsError

        const participantUsers: User[] = (participantsData || []).map((p: any) => ({
          id: p.user_id,
          first_name: p.profiles?.first_name || 'User',
          last_name: p.profiles?.last_name || '',
          avatar_url: p.profiles?.avatar_url || null,
        }))
        setConversationParticipants(participantUsers)

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, sender_id, content, timestamp, is_read, type')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: true })

        if (messagesError) throw messagesError

        setMessages(messagesData || [])
      } catch (error: any) {
        console.error("Error fetching chat data:", error.message)
        toast.error("Failed to load chat.")
      } finally {
        setLoading(false)
      }
    }

    fetchChatData()

    // Set up real-time listener for new messages
    const messageChannel = supabase
      .channel(`chat_conversation_${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prevMessages) => [...prevMessages, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
    }
  }, [conversationId, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !currentUser) return

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        is_read: false,
        type: 'text'
      })

      if (error) {
        console.error("Supabase error sending message:", error)
        throw error
      }

      // Optimistically add the message to the UI
      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: newMessage,
        timestamp: new Date(),
        is_read: false,
        type: 'text'
      }
      setMessages((prevMessages) => [...prevMessages, optimisticMessage])

      setNewMessage("")
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast.error(`Failed to send message: ${error.message || "Unknown error"}`)
    }
  }

  const getParticipant = (userId: string) => {
    return conversationParticipants.find(p => p.id === userId)
  }

  const otherUser = conversationParticipants.find(p => p.id !== currentUser?.id)
  const otherUserName = otherUser ? `${otherUser.first_name} ${otherUser.last_name}`.trim() : 'Unknown User'

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading chat...</h3>
          <p className="text-muted-foreground">Preparing your conversation.</p>
        </div>
      </div>
    )
  }

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#142b20]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-2">Conversation not found</h3>
          <p className="text-gray-400">Please select a conversation from the sidebar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser?.avatar_url || undefined} alt={otherUserName} />
            <AvatarFallback>{otherUserName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{otherUserName}</h3>
            {/* <p className="text-sm text-muted-foreground">Online</p> */}
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const sender = getParticipant(message.sender_id)
          const isCurrentUser = message.sender_id === currentUser?.id
          const senderName = isCurrentUser ? "You" : `${sender?.first_name || 'User'} ${sender?.last_name || ''}`.trim()
          const senderAvatar = isCurrentUser ? currentUser?.avatar_url : sender?.avatar_url

          return (
            <div key={message.id} className={`flex items-start gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              {!isCurrentUser && (
                <Avatar className="h-9 w-9">
                  <AvatarImage src={senderAvatar || undefined} alt={senderName} />
                  <AvatarFallback>{senderName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}>
                <div className={`rounded-lg px-4 py-2 ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {format(new Date(message.timestamp), 'h:mm a')}
                </span>
              </div>
              {isCurrentUser && (
                <Avatar className="h-9 w-9">
                  <AvatarImage src={senderAvatar || undefined} alt={senderName} />
                  <AvatarFallback>{senderName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-border bg-card p-4 flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon">
          <Smile className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Input
          placeholder="Type your message..."
          className="flex-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage()
            }
          }}
        />
        <Button type="submit" onClick={handleSendMessage}>
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}

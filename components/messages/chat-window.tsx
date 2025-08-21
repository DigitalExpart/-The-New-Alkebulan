"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Phone, Video, MoreVertical, Smile, Paperclip, Menu } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface User {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
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
  const [isTyping, setIsTyping] = useState(false)
  const [conversation, setConversation] = useState<any>(null)
  const [otherParticipant, setOtherParticipant] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (conversationId) {
      fetchConversation()
      fetchMessages()
      subscribeToMessages()
    }
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Simulate typing indicator
    if (newMessage.length > 0) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [newMessage])

  const fetchConversation = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data: conversationData, error: convError } = await supabase
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
          )
        `)
        .eq('id', conversationId)
        .single()

      if (convError) throw convError

      // Find the other participant
      const otherUser = conversationData.conversation_participants
        .find(p => p.user_id !== user.id)

      if (otherUser) {
        setOtherParticipant({
          id: otherUser.user_id,
          first_name: otherUser.profiles?.first_name || 'User',
          last_name: otherUser.profiles?.last_name || '',
          avatar_url: otherUser.profiles?.avatar_url || null
        })
      }

      setConversation(conversationData)

    } catch (error) {
      console.error('Error fetching conversation:', error)
      toast.error('Failed to load conversation')
    }
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })

      if (messagesError) throw messagesError

      const transformedMessages = messagesData.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        is_read: msg.is_read,
        type: msg.type || 'text'
      }))

      setMessages(transformedMessages)

    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    const supabase = getSupabaseClient()
    
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Message change:', payload)
          if (payload.eventType === 'INSERT') {
            const newMessage = {
              id: payload.new.id,
              sender_id: payload.new.sender_id,
              content: payload.new.content,
              timestamp: new Date(payload.new.timestamp),
              is_read: payload.new.is_read,
              type: payload.new.type || 'text'
            }
            setMessages(prev => [...prev, newMessage])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return

    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please sign in to send messages')
        return
      }

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          timestamp: new Date().toISOString(),
          is_read: false,
          type: 'text'
        })

      if (messageError) throw messageError

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      setNewMessage("")
      inputRef.current?.focus()

    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = []
    let currentDate = ""
    let currentGroup: Message[] = []

    messages.forEach((message) => {
      const messageDate = formatDate(message.timestamp)
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup })
        }
        currentDate = messageDate
        currentGroup = [message]
      } else {
        currentGroup.push(message)
      }
    })

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup })
    }

    return groups
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!otherParticipant) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Conversation not found</p>
        </div>
      </div>
    )
  }

  const displayName = `${otherParticipant.first_name} ${otherParticipant.last_name}`.trim() || 'User'
  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onOpenSidebar}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherParticipant.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-semibold">{displayName}</h3>
            <p className="text-sm text-muted-foreground">Active now</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messageGroups.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center mb-4">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {group.date}
              </span>
            </div>
            
            <div className="space-y-3">
              {group.messages.map((message) => {
                const isCurrentUser = message.sender_id === "current-user"
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? "flex-row-reverse space-x-reverse" : ""}`}>
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={otherParticipant.avatar_url || undefined} alt={displayName} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {displayName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      
                      <span className="text-xs text-muted-foreground mb-1">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={otherParticipant.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <span className="text-xs text-primary ml-1">typing</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Phone, Video, MoreVertical, Smile, Paperclip, Menu } from "lucide-react"
import type { Message } from "@/types/message"
import { sampleMessages, sampleConversations } from "@/data/messages-data"

interface ChatWindowProps {
  conversationId: string
  onOpenSidebar: () => void
}

export function ChatWindow({ conversationId, onOpenSidebar }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const conversation = sampleConversations.find((c) => c.id === conversationId)
  const otherParticipant = conversation?.participants.find((p) => p.id !== "current-user")

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: "current-user",
      senderName: "You",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=ME",
      content: newMessage,
      timestamp: new Date(),
      isRead: false,
      type: "text",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
    inputRef.current?.focus()
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

  if (!conversation || !otherParticipant) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">
            Choose a conversation from the sidebar to start messaging with your community members.
          </p>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={onOpenSidebar}>
              <Menu className="h-4 w-4" />
            </Button>

            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} alt={otherParticipant.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {otherParticipant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {otherParticipant.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>

            <div>
              <h3 className="font-medium">{otherParticipant.name}</h3>
              <p className="text-sm text-muted-foreground">
                {otherParticipant.isOnline
                  ? conversation.isTyping
                    ? "typing..."
                    : "Active now"
                  : `Last seen ${otherParticipant.lastSeen?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Date Separator */}
            <div className="text-center my-6">
              <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">{group.date}</span>
            </div>

            {/* Messages for this date */}
            <div className="space-y-4">
              {group.messages.map((message, index) => {
                const isCurrentUser = message.senderId === "current-user"
                const showAvatar =
                  !isCurrentUser && (index === 0 || group.messages[index - 1]?.senderId !== message.senderId)
                const showTime =
                  index === group.messages.length - 1 || group.messages[index + 1]?.senderId !== message.senderId

                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                        isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {!isCurrentUser && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {showAvatar && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {message.senderName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col">
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isCurrentUser
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        </div>

                        {showTime && (
                          <p
                            className={`text-xs text-muted-foreground mt-1 ${
                              isCurrentUser ? "text-right" : "text-left"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {conversation.isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
              <Avatar className="h-8 w-8">
                <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} alt={otherParticipant.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {otherParticipant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder={`Message ${otherParticipant.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10 resize-none"
              maxLength={1000}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Conversation } from "@/types/message"
import { sampleConversations } from "@/data/messages-data"

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
  const [conversations] = useState<Conversation[]>(sampleConversations)

  const filteredConversations = conversations.filter((conversation) =>
    conversation.participants.some(
      (participant) =>
        participant.id !== "current-user" && participant.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
              const otherParticipant = conversation.participants.find((p) => p.id !== "current-user")
              if (!otherParticipant) return null

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
                        <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} alt={otherParticipant.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {otherParticipant.name
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
                        <h3 className="font-medium truncate">{otherParticipant.name}</h3>
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
                              {conversation.lastMessage.senderId === "current-user" ? "You: " : ""}
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

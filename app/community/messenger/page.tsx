"use client"

import { useState } from "react"
import { ConversationList } from "@/components/messages/conversation-list"
import { ChatWindow } from "@/components/messages/chat-window"

export default function MessengerPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  const handleOpenSidebar = () => {
    setSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="flex h-[calc(100vh-4rem)]">
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
        />

        <ChatWindow conversationId={selectedConversationId || ""} onOpenSidebar={handleOpenSidebar} />
      </div>
    </div>
  )
}

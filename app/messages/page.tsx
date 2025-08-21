"use client"

import { useState } from "react"
import { ConversationList } from "@/components/messages/conversation-list"
import { ChatWindow } from "@/components/messages/chat-window"

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleOpenSidebar = () => {
    setSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#142b20]">
      <div className="flex h-screen">
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
        />

        {selectedConversationId ? (
          <ChatWindow 
            conversationId={selectedConversationId} 
            onOpenSidebar={handleOpenSidebar}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#142b20]">
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">Welcome to Messages</h3>
              <p className="text-gray-400">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

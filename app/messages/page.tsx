"use client"

import { useState, useEffect } from "react"
import { ConversationList } from "@/components/messages/conversation-list"
import { ChatWindow } from "@/components/messages/chat-window"
import { useSearchParams } from 'next/navigation'

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const searchParams = useSearchParams()
  const chatPartnerId = searchParams.get('user') // This is a user ID, not a conversation ID

  // selectedConversationId will be set by ConversationList's onSelectConversation callback
  // after it finds or creates the actual conversation ID.

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
          chatPartnerId={chatPartnerId}
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

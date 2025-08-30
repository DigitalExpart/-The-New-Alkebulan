"use client"

import { useState } from "react"
import { ConversationList } from "@/components/messages/conversation-list"
import { ChatWindow } from "@/components/messages/chat-window"

export default function ArchivedMessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#142b20]">
      <div className="flex h-screen">
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          initialShowArchived={true}
        />

        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#142b20]">
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">Archived Messages</h3>
              <p className="text-gray-400">Select an archived conversation to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



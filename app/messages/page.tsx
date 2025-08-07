"use client"

import { useState } from "react"
import { ConversationList } from "@/components/messages/conversation-list"
import { ChatWindow } from "@/components/messages/chat-window"

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>()

  return (
    <div className="min-h-screen bg-[#142b20]">
      <div className="flex h-screen">
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />

        {selectedConversationId ? (
          <ChatWindow conversationId={selectedConversationId} />
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

"use client"

import { useState, useEffect } from "react"
import { useFriendRequests } from "@/hooks/use-friend-requests"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, UserPlus } from "lucide-react"
import { toast } from "sonner"

export function FriendRequestNotification() {
  const { pendingRequests, acceptRequest, rejectRequest } = useFriendRequests()
  const [showNotification, setShowNotification] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<any>(null)

  // Show notification when new friend request arrives
  useEffect(() => {
    if (pendingRequests.length > 0 && !showNotification) {
      const latestRequest = pendingRequests[0]
      setCurrentRequest(latestRequest)
      setShowNotification(true)
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [pendingRequests, showNotification])

  const handleAccept = async () => {
    if (currentRequest) {
      await acceptRequest(currentRequest.id)
      setShowNotification(false)
      setCurrentRequest(null)
    }
  }

  const handleReject = async () => {
    if (currentRequest) {
      await rejectRequest(currentRequest.id)
      setShowNotification(false)
      setCurrentRequest(null)
    }
  }

  const handleClose = () => {
    setShowNotification(false)
    setCurrentRequest(null)
  }

  if (!showNotification || !currentRequest) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-in slide-in-from-right-2 duration-300">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="w-12 h-12">
          <AvatarImage src={currentRequest.profile?.avatar_url || ""} />
          <AvatarFallback className="bg-green-100 text-green-600">
            {currentRequest.profile?.first_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              New Friend Request
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            <span className="font-medium">
              {currentRequest.profile?.first_name} {currentRequest.profile?.last_name}
            </span>{" "}
            sent you a friend request
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              className="border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 h-8 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 p-1 h-6 w-6"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

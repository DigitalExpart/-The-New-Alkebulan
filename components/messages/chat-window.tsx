"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Send,
  MoreVertical,
  Paperclip,
  Smile,
  Loader2,
  Menu,
  Search as SearchIcon,
  Trash2,
  Lock,
  Unlock,
  Palette,
  Bell,
  BellOff,
  Archive,
  UserX,
  UserCheck,
  Phone,
  Video,
  Mic,
  Square,
  Image as ImageIcon,
  File as FileIcon,
  MapPin
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import { usePathname, useRouter } from "next/navigation"
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
  const searchInputRef = useRef<HTMLInputElement>(null)
  const supabase = getSupabaseClient()
  const router = useRouter()
  const pathname = usePathname()

  // Local UI states for chat actions
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLocked, setIsLocked] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [notificationLevel, setNotificationLevel] = useState<"all" | "mentions" | "none">("all")
  const [chatTheme, setChatTheme] = useState<"default" | "gold" | "forest" | "contrast">("default")
  const [isArchived, setIsArchived] = useState(false)
  const [clearedAfter, setClearedAfter] = useState<Date | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

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
          .select('user_id, is_muted, notification_level, theme, is_archived, is_locked, cleared_at, profiles(id, first_name, last_name, avatar_url)')
          .eq('conversation_id', conversationId)

        if (participantsError) throw participantsError

        const participantUsers: User[] = (participantsData || []).map((p: any) => ({
          id: p.user_id,
          first_name: p.profiles?.first_name || 'User',
          last_name: p.profiles?.last_name || '',
          avatar_url: p.profiles?.avatar_url || null,
        }))
        setConversationParticipants(participantUsers)

        // Apply current user's per-conversation settings
        const meParticipant = (participantsData || []).find((p: any) => p.user_id === authUser.id)
        if (meParticipant) {
          setIsMuted(Boolean(meParticipant.is_muted))
          setNotificationLevel((meParticipant.notification_level as any) || 'all')
          setChatTheme((meParticipant.theme as any) || 'default')
          setIsArchived(Boolean(meParticipant.is_archived))
          setIsLocked(Boolean(meParticipant.is_locked))
          setClearedAfter(meParticipant.cleared_at ? new Date(meParticipant.cleared_at) : null)
        }

        // Determine if current user has blocked the other user
        const other = (participantsData || []).find((p: any) => p.user_id !== authUser.id)
        if (other) {
          const { data: blockedRow, error: blockErr } = await supabase
            .from('user_blocks')
            .select('blocker_id, blocked_id')
            .eq('blocker_id', authUser.id)
            .eq('blocked_id', other.user_id)
            .maybeSingle()
          if (!blockErr) {
            setIsBlocked(Boolean(blockedRow))
          }
        }

        // Fetch messages
        let messagesQuery = supabase
          .from('messages')
          .select('id, sender_id, content, timestamp, is_read, type')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: true })

        const clearedAfterLocal = meParticipant?.cleared_at ? new Date(meParticipant.cleared_at) : null
        if (clearedAfterLocal) {
          messagesQuery = messagesQuery.gte('timestamp', clearedAfterLocal.toISOString())
        }

        const { data: messagesData, error: messagesError } = await messagesQuery

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
          const newMessage = payload.new as any
          setMessages((prevMessages) => {
            if (prevMessages.some(m => m.id === newMessage.id)) return prevMessages
            return [...prevMessages, newMessage]
          })
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

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0)
    }
  }, [isSearchOpen])

  // Identify other user early so effects below can reference it
  const otherUser = conversationParticipants.find(p => p.id !== currentUser?.id)
  const otherUserName = otherUser ? `${otherUser.first_name} ${otherUser.last_name}`.trim() : 'Unknown User'

  // Presence and last seen updater (read other user's presence)
  useEffect(() => {
    let presenceInterval: any
    const presenceEl = typeof document !== 'undefined' ? document.getElementById('chat-presence-line') : null

    const updatePresence = async () => {
      try {
        const other = otherUser?.id
        if (!other) return
        // Read online flag and last_seen from profiles if present
        const { data, error } = await supabase
          .from('profiles')
          .select('id, is_online, last_seen')
          .eq('id', other)
          .maybeSingle()
        if (error || !data) return
        const isOnline = Boolean((data as any).is_online)
        const lastSeenTs = (data as any).last_seen ? new Date((data as any).last_seen) : null
        if (presenceEl) {
          if (isOnline) {
            presenceEl.textContent = 'Online'
          } else if (lastSeenTs) {
            const hm = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(lastSeenTs)
            presenceEl.textContent = `Last seen ${hm}`
          } else {
            presenceEl.textContent = 'Offline'
          }
        }
      } catch {}
    }

    updatePresence()
    presenceInterval = setInterval(updatePresence, 20000)

    return () => {
      if (presenceInterval) clearInterval(presenceInterval)
    }
  }, [otherUser?.id, supabase])

  // Heartbeat for current user's presence
  useEffect(() => {
    if (!currentUser?.id) return
    let hb: any
    const markOnline = async (online: boolean) => {
      try {
        await supabase
          .from('profiles')
          .update({ is_online: online, last_seen: new Date().toISOString() })
          .eq('id', currentUser.id)
      } catch {}
    }
    markOnline(true)
    hb = setInterval(() => markOnline(true), 60000)
    const beforeUnload = () => { markOnline(false) }
    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      if (hb) clearInterval(hb)
      window.removeEventListener('beforeunload', beforeUnload)
      markOnline(false)
    }
  }, [currentUser?.id, supabase])

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !currentUser) return

    try {
      const { data, error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        is_read: false,
        type: 'text'
      }).select('id, sender_id, content, timestamp, is_read, type').single()

      if (error) {
        console.error("Supabase error sending message:", error)
        throw error
      }

      // Optimistically add the message to the UI
      const optimisticMessage: Message = {
        id: data?.id || `optimistic-${Date.now()}`,
        sender_id: currentUser.id,
        content: newMessage,
        timestamp: new Date(data?.timestamp || new Date()),
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

  // Attachments handling
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'image' | 'video' | 'file') => {
    try {
      if (!e.target.files || !currentUser) return
      const files = Array.from(e.target.files)
      for (const file of files) {
        // For demo: send a placeholder message with file name
        const { error } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: `${kind.toUpperCase()}: ${file.name}`,
          timestamp: new Date().toISOString(),
          is_read: false,
          type: kind === 'file' ? 'file' : kind
        })
        if (error) throw error
      }
      toast.success('Attachment queued')
      e.target.value = ''
    } catch (err: any) {
      console.error('Attachment send failed:', err?.message)
      toast.error('Failed to send attachment')
    }
  }

  const handleShareLocation = async () => {
    try {
      if (!navigator.geolocation || !currentUser) {
        toast.error('Location not available')
        return
      }
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords
        const url = `https://maps.google.com/?q=${latitude},${longitude}`
        const { error } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: url,
          timestamp: new Date().toISOString(),
          is_read: false,
          type: 'location'
        })
        if (error) throw error
        toast.success('Location shared')
      })
    } catch (err: any) {
      console.error('Share location failed:', err?.message)
      toast.error('Failed to share location')
    }
  }

  // Voice note recording (simplified)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      recordedChunksRef.current = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data)
      }
      mediaRecorder.onstop = async () => {
        try {
          if (!currentUser) return
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
          // For demo: just send a placeholder message. Hook up storage upload later.
          const { error } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: currentUser.id,
            content: `VOICE_NOTE (${Math.round(blob.size / 1024)} KB)`,
            timestamp: new Date().toISOString(),
            is_read: false,
            type: 'audio'
          })
          if (error) throw error
          toast.success('Voice note sent')
        } catch (err: any) {
          console.error('Voice note send failed:', err?.message)
          toast.error('Failed to send voice note')
        } finally {
          setIsRecording(false)
        }
      }
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err: any) {
      console.error('Recording start failed:', err?.message)
      toast.error('Cannot start recording')
    }
  }

  const stopRecording = () => {
    try {
      const mr = mediaRecorderRef.current
      if (mr && mr.state !== 'inactive') mr.stop()
    } catch {}
  }

  const getParticipant = (userId: string) => {
    return conversationParticipants.find(p => p.id === userId)
  }

  const displayedMessages = searchQuery.trim()
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

  const containerThemeClass =
    chatTheme === 'gold' ? 'bg-yellow-50 dark:bg-[#12100b]'
    : chatTheme === 'forest' ? 'bg-emerald-50 dark:bg-[#0f1a14]'
    : chatTheme === 'contrast' ? 'bg-white text-black dark:bg-black dark:text-white'
    : 'bg-background'

  const handleClearChat = async () => {
    if (!conversationId) return
    const confirmed = window.confirm('Clear all messages in this chat?')
    if (!confirmed) return
    try {
      const nowIso = new Date().toISOString()
      if (!currentUser) return
      const { error } = await supabase
        .from('conversation_participants')
        .update({ cleared_at: nowIso })
        .eq('conversation_id', conversationId)
        .eq('user_id', currentUser.id)
      if (error) throw error
      setClearedAfter(new Date(nowIso))
      setMessages(prev => prev.filter(m => new Date(m.timestamp) >= new Date(nowIso)))
      toast.success('Chat cleared for you')
    } catch (err: any) {
      console.error('Failed to clear chat:', err?.message)
      toast.error('Failed to clear chat')
    }
  }

  const handleArchiveChat = async () => {
    try {
      if (!currentUser) return
      const next = !isArchived
      const { error } = await supabase
        .from('conversation_participants')
        .update({ is_archived: next })
        .eq('conversation_id', conversationId)
        .eq('user_id', currentUser.id)
      if (error) throw error
      setIsArchived(next)
      toast.success(next ? 'Chat archived' : 'Chat unarchived')
      // If we unarchive while on the archived page, send the user back to inbox
      if (!next && pathname?.startsWith('/messages/archived')) {
        router.push('/messages')
      }
      // Notify conversation list to refresh so the chat moves between sections
      try { window.dispatchEvent(new Event('conversations:refresh')) } catch {}
    } catch (err: any) {
      console.error('Failed to toggle archive:', err?.message)
      toast.error('Failed to update archive state')
    }
  }

  const handleToggleBlockUser = async () => {
    try {
      if (!currentUser || !otherUser) return
      if (isBlocked) {
        const { error } = await supabase
          .from('user_blocks')
          .delete()
          .eq('blocker_id', currentUser.id)
          .eq('blocked_id', otherUser.id)
        if (error) throw error
        setIsBlocked(false)
        toast.success(`Unblocked ${otherUser.first_name}`)
      } else {
        const { error } = await supabase
          .from('user_blocks')
          .upsert({ blocker_id: currentUser.id, blocked_id: otherUser.id }, { onConflict: 'blocker_id,blocked_id' })
        if (error) throw error
        setIsBlocked(true)
        toast.success(`Blocked ${otherUser.first_name}`)
      }
    } catch (err: any) {
      console.error('Failed to toggle block:', err?.message)
      toast.error('Failed to update block state')
    }
  }

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
    <div className={`flex flex-col flex-1 ${containerThemeClass}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between py-5 px-4 border-b border-border bg-card">
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
            <p className="text-sm text-muted-foreground" id="chat-presence-line"></p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => toast.info('Voice call coming soon')}>
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toast.info('Video call coming soon')}>
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Conversation</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsSearchOpen(true)} className="cursor-pointer">
              <SearchIcon className="w-4 h-4" />
              Search in chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleClearChat} className="cursor-pointer">
              <Trash2 className="w-4 h-4" />
              Clear chat
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={async () => {
                try {
                  if (!currentUser) return
                  const next = !isLocked
                  const { error } = await supabase
                    .from('conversation_participants')
                    .update({ is_locked: next })
                    .eq('conversation_id', conversationId)
                    .eq('user_id', currentUser.id)
                  if (error) throw error
                  setIsLocked(next)
                  toast.success(next ? 'Chat locked' : 'Chat unlocked')
                } catch (err: any) {
                  console.error('Failed to toggle lock:', err?.message)
                  toast.error('Failed to update lock state')
                }
              }}
            >
              {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isLocked ? 'Unlock chat' : 'Lock chat'}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="w-4 h-4" />
                Change chat theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuRadioGroup
                  value={chatTheme}
                  onValueChange={async (v) => {
                    try {
                      if (!currentUser) return
                      const { error } = await supabase
                        .from('conversation_participants')
                        .update({ theme: v })
                        .eq('conversation_id', conversationId)
                        .eq('user_id', currentUser.id)
                      if (error) throw error
                      setChatTheme(v as any)
                    } catch (err: any) {
                      console.error('Failed to update theme:', err?.message)
                      toast.error('Failed to change theme')
                    }
                  }}
                >
                  <DropdownMenuRadioItem value="default">Default</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="gold">Gold</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="forest">Forest</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="contrast">High Contrast</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Bell className="w-4 h-4" />
                Notifications
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuRadioGroup
                  value={notificationLevel}
                  onValueChange={async (v) => {
                    try {
                      if (!currentUser) return
                      const { error } = await supabase
                        .from('conversation_participants')
                        .update({ notification_level: v, is_muted: v === 'none' })
                        .eq('conversation_id', conversationId)
                        .eq('user_id', currentUser.id)
                      if (error) throw error
                      setNotificationLevel(v as any)
                      setIsMuted(v === 'none')
                    } catch (err: any) {
                      console.error('Failed to update notifications:', err?.message)
                      toast.error('Failed to update notifications')
                    }
                  }}
                >
                  <DropdownMenuRadioItem value="all">All messages</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mentions">Mentions only</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={async () => {
                try {
                  if (!currentUser) return
                  const next = !isMuted
                  const nextLevel = next ? 'none' : 'all'
                  const { error } = await supabase
                    .from('conversation_participants')
                    .update({ is_muted: next, notification_level: nextLevel })
                    .eq('conversation_id', conversationId)
                    .eq('user_id', currentUser.id)
                  if (error) throw error
                  setIsMuted(next)
                  setNotificationLevel(nextLevel as any)
                  toast.success(next ? 'Chat muted' : 'Chat unmuted')
                } catch (err: any) {
                  console.error('Failed to toggle mute:', err?.message)
                  toast.error('Failed to update mute state')
                }
              }}
            >
              <BellOff className="w-4 h-4" />
              Mute chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchiveChat} className="cursor-pointer">
              <Archive className="w-4 h-4" />
              {isArchived ? 'Unarchive chat' : 'Archive chat'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggleBlockUser} className="text-red-600 cursor-pointer">
              {isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
              {isBlocked ? 'Unblock user' : 'Block user'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isSearchOpen && (
          <div className="sticky top-0 z-10 mb-2 bg-card/80 backdrop-blur rounded-lg p-2 border border-border flex items-center gap-2">
            <SearchIcon className="w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search in conversation"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-8"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setIsSearchOpen(false); setSearchQuery("") }}
            >
              Clear
            </Button>
          </div>
        )}
        {displayedMessages.map((message) => {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <label className="w-full flex items-center gap-2 cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                <span>Image</span>
                <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFilesSelected(e, 'image')} />
              </label>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <label className="w-full flex items-center gap-2 cursor-pointer">
                <Video className="w-4 h-4" />
                <span>Video</span>
                <input type="file" accept="video/*" multiple hidden onChange={(e) => handleFilesSelected(e, 'video')} />
              </label>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <label className="w-full flex items-center gap-2 cursor-pointer">
                <FileIcon className="w-4 h-4" />
                <span>Document</span>
                <input type="file" multiple hidden onChange={(e) => handleFilesSelected(e, 'file')} />
              </label>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareLocation} className="cursor-pointer">
              <MapPin className="w-4 h-4" />
              Share location
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
          disabled={isLocked}
        />
        <Button type="submit" onClick={handleSendMessage} disabled={isLocked}>
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
        <Button
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLocked}
        >
          {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          <span className="sr-only">{isRecording ? 'Stop recording' : 'Record voice note'}</span>
        </Button>
      </div>
    </div>
  )
}

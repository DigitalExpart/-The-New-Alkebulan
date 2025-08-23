"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Check, CheckCheck, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface Message {
  id: string
  conversation_id: string
  sender_type: "user" | "company"
  sender_id: string
  content: string
  created_at: string
  status?: "sent" | "delivered" | "read"
  delivered_at?: string | null
  read_at?: string | null
}

export default function CompanyChatPage() {
  const params = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const [companyName, setCompanyName] = useState<string>("")
  const [companyOwnerId, setCompanyOwnerId] = useState<string | null>(null)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [conversationUserId, setConversationUserId] = useState<string | null>(null)
  const [otherName, setOtherName] = useState<string>("")
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null)
  const [convSearch, setConvSearch] = useState("")
  const [ownerConversations, setOwnerConversations] = useState<Array<{ id: string; user_id: string; last_message: string | null; last_message_at: string | null }>>([])
  const [ownerProfiles, setOwnerProfiles] = useState<Record<string, { full_name: string | null; email: string | null; avatar_url: string | null }>>({})

  useEffect(() => {
    if (!user?.id || !params?.id) return
    const supabase = getSupabaseClient()

    const ensureConversation = async () => {
      const withUserId = searchParams?.get('with') || null
      if (isOwner) {
        if (withUserId) {
          const { data } = await supabase
            .from("company_conversations")
            .select("id,user_id")
            .eq("company_id", params.id)
            .eq("user_id", withUserId)
            .maybeSingle()
          if (data?.id) {
            setConversationId(data.id)
            setConversationUserId(data.user_id)
            return data.id
          }
        }
        const { data: latest } = await supabase
            .from("company_conversations")
            .select("id,user_id")
            .eq("company_id", params.id)
            .order("last_message_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        if (latest?.id) {
          setConversationId(latest.id)
          setConversationUserId(latest.user_id)
          return latest.id
        }
        return null
      } else {
        const { data, error } = await supabase
          .from("company_conversations")
          .select("id")
          .eq("company_id", params.id)
          .eq("user_id", user.id)
          .maybeSingle()

        if (error) console.error(error)

        if (data?.id) {
          setConversationId(data.id)
          setConversationUserId(user.id)
          return data.id
        }

        const { data: created, error: createErr } = await supabase
          .from("company_conversations")
          .insert({ company_id: params.id, user_id: user.id })
          .select("id,user_id")
          .single()
        if (!createErr) {
          setConversationId(created.id)
          setConversationUserId(created.user_id)
          return created.id
        }
        return null
      }
    }

    const init = async () => {
      // Fetch company name for header
      const { data: companyRow } = await supabase
        .from("companies")
        .select("name, owner_id, logo")
        .eq("id", params.id)
        .maybeSingle()
      if (companyRow?.name) setCompanyName(companyRow.name)
      if (companyRow?.owner_id) setCompanyOwnerId(companyRow.owner_id)
      if (companyRow?.logo) setCompanyLogo(companyRow.logo)
      if (companyRow?.owner_id && user?.id) setIsOwner(companyRow.owner_id === user.id)

      const convId = await ensureConversation()
      if (!convId) return

      const { data: initial } = await supabase
        .from("company_messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at")
      setMessages((initial as Message[]) || [])

      const channel = supabase
        .channel(`company_messages_${convId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "company_messages", filter: `conversation_id=eq.${convId}` },
          (payload) => {
            const incoming = payload.new as Message
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev
              return [...prev, incoming]
            })
            // If I am not the sender, mark delivered and read
            if (incoming.sender_id !== (user?.id || "")) {
              markDelivered(incoming.id)
              markRead([incoming.id])
            }
            setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 0)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const sub = init()
    return () => {
      // best effort cleanup
      ;(async () => (await sub)?.() )()
    }
  }, [user?.id, params?.id])

  // Load other participant profile (for company owner views)
  useEffect(() => {
    const loadProfile = async () => {
      if (!conversationUserId) return
      const supabase = getSupabaseClient()
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, email")
        .eq("user_id", conversationUserId)
        .maybeSingle()
      if (data) {
        setOtherName(data.full_name || data.email || "User")
        setOtherAvatar(data.avatar_url || null)
      }
    }
    loadProfile()
  }, [conversationUserId])

  // Owner: load conversations list for sidebar
  useEffect(() => {
    const loadConversations = async () => {
      if (!isOwner || !params?.id) return
      const supabase = getSupabaseClient()
      const { data: convs } = await supabase
        .from("company_conversations")
        .select("id,user_id,last_message,last_message_at")
        .eq("company_id", params.id)
        .order("last_message_at", { ascending: false })
      setOwnerConversations((convs || []) as any)
      const userIds = Array.from(new Set(((convs || []) as any).map((c: any) => c.user_id)))
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id,full_name,email,avatar_url")
          .in("user_id", userIds)
        const map: Record<string, any> = {}
        ;(profs || []).forEach((p: any) => { map[p.user_id] = p })
        setOwnerProfiles(map)
      }
    }
    loadConversations()
  }, [isOwner, params?.id])

  const filteredConversations = ownerConversations.filter((c) => {
    if (!convSearch) return true
    const p = ownerProfiles[c.user_id]
    const name = (p?.full_name || p?.email || "").toLowerCase()
    return name.includes(convSearch.toLowerCase()) || (c.last_message || "").toLowerCase().includes(convSearch.toLowerCase())
  })

  const openConversationForUser = async (targetUserId: string) => {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from("company_conversations")
      .select("id,user_id")
      .eq("company_id", params.id as string)
      .eq("user_id", targetUserId)
      .maybeSingle()
    if (data?.id) {
      setConversationId(data.id)
      setConversationUserId(data.user_id)
      // fetch messages for this conv
      const { data: msgs } = await supabase
        .from("company_messages")
        .select("*")
        .eq("conversation_id", data.id)
        .order("created_at")
      setMessages((msgs as any) || [])
      // update url param for shareability
      router.replace(`/marketplace/companies/${params.id}/chat?with=${targetUserId}`)
    }
  }

  const markDelivered = async (messageId: string) => {
    const supabase = getSupabaseClient()
    await supabase
      .from("company_messages")
      .update({ status: "delivered", delivered_at: new Date().toISOString() })
      .eq("id", messageId)
  }

  const markRead = async (messageIds: string[]) => {
    if (messageIds.length === 0) return
    const supabase = getSupabaseClient()
    await supabase
      .from("company_messages")
      .update({ status: "read", read_at: new Date().toISOString() })
      .in("id", messageIds)
  }

  const sendMessage = async () => {
    if (!input.trim() || !user?.id) return
    const supabase = getSupabaseClient()
    const content = input.trim()
    setInput("")

    // Ensure conversation exists before sending
    let convId = conversationId
    if (!convId && params?.id) {
      const { data: conv, error: convErr } = await supabase
        .from("company_conversations")
        .insert({ company_id: params.id as string, user_id: user.id })
        .select("id")
        .single()
      if (convErr) {
        toast.error(`Could not start conversation: ${convErr.message}`)
        return
      }
      convId = conv.id
      setConversationId(convId)
    }
    if (!convId) {
      if (isOwner) toast("No conversations yet")
      return
    }

    const { data: inserted, error } = await supabase
      .from("company_messages")
      .insert({
        conversation_id: convId,
        sender_type: isOwner ? "company" : "user",
        sender_id: user.id,
        content,
        status: "sent",
      })
      .select("*")
      .single()

    if (error) {
      toast.error(`Message failed: ${error.message}`)
      return
    }

    // Optimistic append
    if (inserted) {
      setMessages((prev) => [...prev, inserted as Message])
      // Mark delivered after DB ack
      markDelivered(inserted.id)
    }

    // Create a notification for the company owner
    try {
      if (isOwner) {
        if (conversationUserId) {
          await supabase.from("notifications").insert({
            user_id: conversationUserId,
            type: "message",
            title: `New message from ${companyName || 'company'}`,
            message: content.slice(0, 140),
            related_id: params.id as string,
            is_read: false,
          })
        }
      } else if (companyOwnerId && companyOwnerId !== user.id) {
        await supabase.from("notifications").insert({
          user_id: companyOwnerId,
          type: "message",
          title: `New message from customer`,
          message: content.slice(0, 140),
          related_id: params.id as string,
          is_read: false,
        })
      }
    } catch (notifyErr) {
      console.warn("Failed to create notification", notifyErr)
    }

    const { error: convUpdateErr } = await supabase
      .from("company_conversations")
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq("id", convId)
    if (convUpdateErr) console.warn("Failed to update conversation last_message", convUpdateErr)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4">
          {isOwner && (
            <Card className="w-[320px] flex-shrink-0 hidden md:block">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <Input placeholder="Search" value={convSearch} onChange={(e) => setConvSearch(e.target.value)} />
                </div>
                <div className="space-y-2">
                  {filteredConversations.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No conversations</div>
                  ) : (
                    filteredConversations.map((c) => {
                      const p = ownerProfiles[c.user_id]
                      const name = p?.full_name || p?.email || 'User'
                      return (
                        <button key={c.id} onClick={() => openConversationForUser(c.user_id)} className="w-full text-left p-2 rounded-md border hover:bg-muted/50 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={p?.avatar_url || undefined} />
                            <AvatarFallback>{name.substring(0,1)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{name}</div>
                            <div className="text-xs text-muted-foreground truncate">{c.last_message || ''}</div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <Link href={`/marketplace/companies/${params.id}/conversations`} className="underline">Open full list</Link>
                </div>
              </CardContent>
            </Card>
          )}
        <Card className="flex-1">
          <CardHeader className="sticky top-0 z-10 flex !flex-row items-center justify-between space-y-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={isOwner ? (otherAvatar || undefined) : (companyLogo || undefined)} />
                <AvatarFallback>{(isOwner ? otherName : companyName)?.substring(0,1) || 'C'}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-left">{isOwner ? (otherName || 'Conversation') : (companyName ? `Chat with ${companyName}` : 'Chat with Company')}</CardTitle>
            </div>
            <Button variant="outline" size="icon" onClick={() => router.push('/marketplace/companies')} aria-label="Close chat">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div ref={listRef} className="h-[65vh] overflow-y-auto space-y-3 border rounded-md p-3 mb-3 bg-background/40">
              {messages.map((m) => {
                const isMine = m.sender_id === (user?.id || "")
                const status = m.status || (m.read_at ? "read" : m.delivered_at ? "delivered" : "sent")
                const timeStr = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} items-end gap-2`}>
                    {!isMine && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={isOwner ? (otherAvatar || undefined) : (companyLogo || undefined)} />
                        <AvatarFallback>{(isOwner ? otherName : companyName)?.substring(0,1) || 'C'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${isMine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                      <div className={`flex ${isMine ? 'justify-end' : ''} items-end gap-1`}>
                        <span className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</span>
                        <span className={`ml-1 inline-flex items-center gap-0.5 text-[10px] ${isMine ? 'text-primary-foreground/90' : 'text-foreground/70'}`}>
                          <span>{timeStr}</span>
                          {isMine && (
                            <>
                              {status === "sent" && <Check className="h-3 w-3" />}
                              {status === "delivered" && <CheckCheck className="h-3 w-3" />}
                              {status === "read" && <CheckCheck className="h-3 w-3 text-green-300" />}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isOwner ? `Message ${otherName || 'user'}...` : `Message ${companyName || 'company'}...`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}



"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Check, CheckCheck, X } from "lucide-react"

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
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const [companyName, setCompanyName] = useState<string>("")
  const [companyOwnerId, setCompanyOwnerId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id || !params?.id) return
    const supabase = getSupabaseClient()

    const ensureConversation = async () => {
      const { data, error } = await supabase
        .from("company_conversations")
        .select("id")
        .eq("company_id", params.id)
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) console.error(error)

      if (data?.id) {
        setConversationId(data.id)
        return data.id
      }

      const { data: created, error: createErr } = await supabase
        .from("company_conversations")
        .insert({ company_id: params.id, user_id: user.id })
        .select("id")
        .single()
      if (!createErr) {
        setConversationId(created.id)
        return created.id
      }
      return null
    }

    const init = async () => {
      // Fetch company name for header
      const { data: companyRow } = await supabase
        .from("companies")
        .select("name, owner_id")
        .eq("id", params.id)
        .maybeSingle()
      if (companyRow?.name) setCompanyName(companyRow.name)
      if (companyRow?.owner_id) setCompanyOwnerId(companyRow.owner_id)

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
            // If I am the recipient (message from company), mark delivered and read
            if (incoming.sender_type !== "user") {
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
    if (!convId) return

    const { data: inserted, error } = await supabase
      .from("company_messages")
      .insert({
        conversation_id: convId,
        sender_type: "user",
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
      if (companyOwnerId && companyOwnerId !== user.id) {
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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader className="flex !flex-row items-center justify-between space-y-0">
            <CardTitle className="text-left">{companyName ? `Chat with ${companyName}` : 'Chat with Company'}</CardTitle>
            <Button variant="outline" size="icon" onClick={() => router.push('/marketplace/companies')} aria-label="Close chat">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div ref={listRef} className="h-[60vh] overflow-y-auto space-y-3 border rounded-md p-3 mb-3">
              {messages.map((m) => {
                const isMine = m.sender_type === "user"
                const status = m.status || (m.read_at ? "read" : m.delivered_at ? "delivered" : "sent")
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <div className={`flex ${isMine ? 'justify-end' : ''} items-end gap-1`}>
                        <span className="whitespace-pre-wrap break-words">{m.content}</span>
                        {isMine && (
                          <span className="flex items-center gap-0.5 text-[10px] opacity-80">
                            {status === "sent" && <Check className="h-3 w-3" />}
                            {status === "delivered" && <CheckCheck className="h-3 w-3" />}
                            {status === "read" && <CheckCheck className="h-3 w-3 text-green-500" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }} />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



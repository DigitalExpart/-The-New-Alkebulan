"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

interface Message {
  id: string
  conversation_id: string
  sender_type: "user" | "company"
  sender_id: string
  content: string
  created_at: string
}

export default function CompanyChatPage() {
  const params = useParams<{ id: string }>()
  const { user } = useAuth()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const listRef = useRef<HTMLDivElement>(null)

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
            setMessages((prev) => [...prev, payload.new as Message])
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

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || !user?.id) return
    const supabase = getSupabaseClient()
    const content = input.trim()
    setInput("")
    await supabase.from("company_messages").insert({
      conversation_id: conversationId,
      sender_type: "user",
      sender_id: user.id,
      content,
    })
    await supabase
      .from("company_conversations")
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq("id", conversationId)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Chat with Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={listRef} className="h-[60vh] overflow-y-auto space-y-3 border rounded-md p-3 mb-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.sender_type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
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



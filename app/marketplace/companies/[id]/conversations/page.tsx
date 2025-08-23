"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Search } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface ConversationRow {
  id: string
  user_id: string
  last_message: string | null
  last_message_at: string | null
}

interface ProfileRow {
  user_id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
}

export default function CompanyConversationsPage() {
  const params = useParams<{ id: string }>()
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({})
  const [company, setCompany] = useState<{ name: string | null; logo: string | null } | null>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id || !params?.id) return
    const supabase = getSupabaseClient()

    const load = async () => {
      setLoading(true)
      // Load company profile (for header / fallback)
      const { data: comp } = await supabase
        .from('companies')
        .select('name, logo')
        .eq('id', params.id)
        .maybeSingle()
      setCompany(comp as any)
      // Get all conversations for this company
      const { data: convs } = await supabase
        .from("company_conversations")
        .select("id,user_id,last_message,last_message_at")
        .eq("company_id", params.id)
        .order("last_message_at", { ascending: false })

      setConversations((convs || []) as ConversationRow[])

      const userIds = Array.from(new Set((convs || []).map((c: any) => c.user_id)))
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id,full_name,email,avatar_url")
          .in("user_id", userIds)
        const map: Record<string, ProfileRow> = {}
        ;(profs || []).forEach((p: any) => {
          map[p.user_id] = p as ProfileRow
        })
        setProfiles(map)
      } else {
        setProfiles({})
      }
      setLoading(false)
    }

    load()
  }, [user?.id, params?.id])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return conversations
    return conversations.filter((c) => {
      const p = profiles[c.user_id]
      const name = (p?.full_name || p?.email || "").toLowerCase()
      const msg = (c.last_message || "").toLowerCase()
      return name.includes(q) || msg.includes(q)
    })
  }, [search, conversations, profiles])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {company?.name ? `${company.name} · Conversations` : 'Conversations'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or message" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading conversations...</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground">No conversations yet.</div>
            ) : (
              <div className="space-y-2">
                {filtered.map((c) => {
                  const p = profiles[c.user_id]
                  const name = p?.full_name || p?.email || "User"
                  return (
                    <Link key={c.id} href={`/marketplace/companies/${params.id}/chat?with=${c.user_id}`}>
                      <div className="flex items-center justify-between p-3 rounded-md border hover:bg-muted cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={p?.avatar_url || undefined} alt={name} />
                            <AvatarFallback>{name.substring(0,1)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[220px]">{c.last_message || ""}</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Open</Button>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



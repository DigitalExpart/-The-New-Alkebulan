"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Flag, Users, Trash2, EyeOff, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface CommunityLite { id: string; name: string }
interface PostLite { id: string; title?: string | null; content?: string | null }

export default function AdminContentPage() {
  const [communities, setCommunities] = useState<CommunityLite[]>([])
  const [posts, setPosts] = useState<PostLite[]>([])

  const load = async () => {
    if (!supabase) return
    try {
      const { data: comms } = await supabase
        .from("communities")
        .select("id, name")
        .limit(20)
      setCommunities(comms || [])
    } catch {}
    try {
      const { data: p } = await supabase
        .from("posts")
        .select("id, title, content, is_published")
        .order("id", { ascending: false })
        .limit(20)
      setPosts(p || [])
    } catch {
      toast.message("Posts table may be missing; this is a placeholder.")
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Content Moderation</h1>
                <p className="text-muted-foreground">Review communities and posts</p>
              </div>
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </div>

          <Tabs defaultValue="communities" className="space-y-4">
            <TabsList>
              <TabsTrigger value="communities">Communities</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>

            <TabsContent value="communities">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communities.map((c) => (
                  <Card key={c.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Users className="w-4 h-4" /> {c.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <Badge variant="secondary">ID: {c.id.slice(0, 8)}...</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="destructive" onClick={async () => {
                          const { error } = await supabase.from('communities').delete().eq('id', c.id)
                          if (error) { toast.error('Delete failed') } else { toast.success('Deleted'); load() }
                        }}>Remove</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="posts">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((p) => (
                  <Card key={p.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Flag className="w-4 h-4" /> {p.title || p.content?.slice(0, 24) || "Untitled"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <Badge variant="secondary">ID: {p.id.slice(0, 8)}...</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline" onClick={async () => {
                          const { error } = await supabase.from('posts').update({ is_published: !(p as any).is_published }).eq('id', p.id)
                          if (error) { toast.error('Update failed') } else { toast.success('Toggled'); load() }
                        }}>{(p as any).is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                        <Button size="sm" variant="destructive" onClick={async () => {
                          const { error } = await supabase.from('posts').delete().eq('id', p.id)
                          if (error) { toast.error('Delete failed') } else { toast.success('Deleted'); load() }
                        }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  )
}



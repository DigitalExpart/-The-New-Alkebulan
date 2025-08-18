"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"

interface CreatePostProps {
  communityId: string
  onPostCreated: () => void
}

export default function CreatePost({ communityId, onPostCreated }: CreatePostProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("You must be logged in to create a post")
      return
    }

    if (!content.trim()) {
      toast.error("Please fill in the content")
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      
      // First check if user is a member of the community
      const { data: membership, error: membershipError } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membership) {
        toast.error("You must be a member of this community to post")
        return
      }

      // Create the post
      const { error: postError } = await supabase
        .from('community_posts')
        .insert({
          community_id: communityId,
          user_id: user.id,
          content: content.trim(),
          likes_count: 0,
          comments_count: 0
        })

      if (postError) {
        console.error('Post creation error:', postError)
        throw postError
      }

      // Update community post count if needed
      await supabase
        .from('communities')
        .update({ 
          updated_at: new Date().toISOString() 
        })
        .eq('id', communityId)

      toast.success("Post created successfully!")
      setContent("")
      onPostCreated() // Refresh the posts list
      
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error("Failed to create post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please log in to create posts
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Create a Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts with the community..."
              rows={4}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              "Creating..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create Post
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

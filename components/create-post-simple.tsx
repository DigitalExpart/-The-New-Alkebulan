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

interface CreatePostSimpleProps {
  communityId: string
  onPostCreated: () => void
}

export default function CreatePostSimple({ communityId, onPostCreated }: CreatePostSimpleProps) {
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
      toast.error("Please add some content to your post")
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

      // Create the post with only basic fields
      const { data: post, error: postError } = await supabase
        .from('community_posts')
        .insert({
          community_id: communityId,
          user_id: user.id,
          content: content.trim(),
          likes_count: 0,
          comments_count: 0
        })
        .select()
        .single()

      if (postError) {
        console.error('Post creation error:', postError)
        console.log('Error details:', JSON.stringify(postError, null, 2))
        console.log('Error message:', postError.message)
        console.log('Error code:', postError.code)
        console.log('Error details:', postError.details)
        console.log('Error hint:', postError.hint)
        console.log('Error where:', postError.where)
        console.log('Error schema:', postError.schema)
        console.log('Error table:', postError.table)
        console.log('Error column:', postError.column)
        console.log('Error dataType:', postError.dataType)
        console.log('Error constraint:', postError.constraint)
        
        // Create a more informative error object
        const enhancedError = {
          originalError: postError,
          message: postError.message || 'Unknown error',
          code: postError.code || 'UNKNOWN',
          details: postError.details || 'No details available',
          hint: postError.hint || 'No hint available',
          where: postError.where || 'Unknown location',
          schema: postError.schema || 'Unknown schema',
          table: postError.table || 'Unknown table',
          column: postError.column || 'Unknown column',
          dataType: postError.dataType || 'Unknown data type',
          constraint: postError.constraint || 'Unknown constraint'
        }
        
        console.log('Enhanced error object:', enhancedError)
        throw enhancedError
      }

      toast.success("Post created successfully!")
      setContent("")
      onPostCreated() // Refresh the posts list
      
    } catch (error) {
      console.error('Error creating post:', error)
      console.log('Error type:', typeof error)
      console.log('Error details:', JSON.stringify(error, null, 2))
      
      // Handle enhanced error objects
      let errorMessage = "Failed to create post. Please try again."
      let errorDetails = "Unknown error"
      
      if (error && typeof error === 'object') {
        // Check if it's our enhanced error object
        if ('originalError' in error) {
          errorMessage = `Post creation failed: ${error.message || 'Unknown error'}`
          errorDetails = error.details || 'No details available'
          
          // Log additional context
          if (error.table) console.log('Table with issue:', error.table)
          if (error.column) console.log('Column with issue:', error.column)
          if (error.constraint) console.log('Constraint issue:', error.constraint)
          if (error.hint) console.log('Error hint:', error.hint)
        } else if ('message' in error) {
          errorMessage = `Post creation failed: ${error.message}`
          errorDetails = error.details || error.message
        }
      }
      
      console.log('Final error message:', errorMessage)
      console.log('Final error details:', errorDetails)
      
      toast.error(errorMessage)
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
          Create a Post (Simple Version)
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

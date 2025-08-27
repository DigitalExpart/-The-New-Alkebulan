"use client"

import { useState, useEffect, FormEvent } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  user: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

interface CommentsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
}

export default function CommentsModal({ open, onOpenChange, postId }: CommentsModalProps) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loadingComments, setLoadingComments] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      fetchComments()
    }
  }, [open, postId])

  const fetchComments = async () => {
    setLoadingComments(true)
    try {
      const sb = getSupabaseClient()
      if (!sb) return

      const { data: commentsData, error } = await sb
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!post_comments_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const mappedComments: Comment[] = (commentsData || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        user_id: c.user_id,
        user: {
          first_name: c.profiles?.first_name || 'User',
          last_name: c.profiles?.last_name || '',
          avatar_url: c.profiles?.avatar_url || ''
        }
      }))
      setComments(mappedComments)
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast.error("Failed to load comments.")
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !profile || !newComment.trim()) {
      toast.error("Please log in and write a comment.")
      return
    }

    setIsSubmitting(true)
    try {
      const sb = getSupabaseClient()
      if (!sb) return

      const { data, error } = await sb
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select()
        .single()

      if (error) throw error

      // Optimistically add the new comment to the list
      const newMappedComment: Comment = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        user_id: user.id,
        user: {
          first_name: profile.first_name || 'User',
          last_name: profile.last_name || '',
          avatar_url: profile.avatar_url || ''
        }
      }
      setComments((prevComments) => [...prevComments, newMappedComment])
      setNewComment("")
      toast.success("Comment added successfully!")
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast.error("Failed to add comment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>View and add comments to this post.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-4">
          {loadingComments ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={comment.user.avatar_url} />
                  <AvatarFallback>{comment.user.first_name[0]}{comment.user.last_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.user.first_name} {comment.user.last_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground break-words">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSubmitComment} className="flex gap-2 pt-4 border-t">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>{profile?.first_name?.[0]}{profile?.last_name?.[0]}</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmitComment(e)
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


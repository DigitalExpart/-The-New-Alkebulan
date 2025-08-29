"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  Image as ImageIcon,
  Link as LinkIcon,
  BarChart3,
  Send,
  Edit,
  Trash2,
  Flag
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import type { PostWithStats } from "@/types/social-feed"

interface PostCardProps {
  post: PostWithStats;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

export function PostCard({ post, onPostUpdated, onPostDeleted }: PostCardProps) {
  const { user, profile } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (!user || !supabase) {
      toast.error('Please sign in to like posts')
      return
    }

    setIsLiking(true)
    try {
      if (post.user_has_liked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)

        if (error) throw error

        toast.success('Post unliked')
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert([{
            post_id: post.id,
            user_id: user.id
          }])

        if (error) throw error

        toast.success('Post liked')
      }
      onPostUpdated?.() // Notify parent component to refresh
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like')
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = async () => {
    if (!user || !supabase) {
      toast.error('Please sign in to comment')
      return
    }

    if (!commentText.trim()) {
      toast.error('Please enter a comment')
      return
    }

    setIsSubmittingComment(true)
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: post.id,
          user_id: user.id,
          content: commentText.trim()
        }])

      if (error) throw error

      setCommentText("")
      toast.success('Comment added')
      onPostUpdated?.() // Notify parent component to refresh
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !supabase) return

    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const { error } = await supabase
        .from('community_posts') // Changed from 'posts' to 'community_posts'
        .delete()
        .eq('id', post.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Post deleted')
      onPostDeleted?.()
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const getPrivacyIcon = () => {
    switch (post.privacy) {
      case 'public':
        return <Globe className="h-3 w-3" />
      case 'friends':
        return <Users className="h-3 w-3" />
      case 'private':
        return <Lock className="h-3 w-3" />
      default:
        return <Globe className="h-3 w-3" />
    }
  }

  const getPostTypeIcon = () => {
    switch (post.post_type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'link':
        return <LinkIcon className="h-4 w-4" />
      case 'poll':
        return <BarChart3 className="h-4 w-4" />
      default:
        return null
    }
  }

  const isOwnPost = user?.id === post.user_id

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author_avatar || undefined} />
              <AvatarFallback>
                {post.author_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium">
                  {post.author_name || 'Anonymous'}
                </p>
                {getPostTypeIcon() && (
                  <Badge variant="secondary" className="text-xs">
                    {getPostTypeIcon()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  {getPrivacyIcon()}
                  <span className="capitalize">{post.privacy}</span>
                </div>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwnPost ? (
                <>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Report Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        <div className="space-y-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Post Image */}
          {post.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image_url}
                alt="Post content"
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Interaction Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            {post.like_count > 0 && (
              <span>{post.like_count} {post.like_count === 1 ? 'like' : 'likes'}</span>
            )}
            {post.comment_count > 0 && (
              <span>{post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}</span>
            )}
            {post.share_count > 0 && (
              <span>{post.share_count} {post.share_count === 1 ? 'share' : 'shares'}</span>
            )}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`flex-1 ${post.user_has_liked ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-4 w-4 mr-2 ${post.user_has_liked ? 'fill-current' : ''}`} />
            {post.user_has_liked ? 'Liked' : 'Like'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Comment
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-end space-x-2">
                             <Avatar className="h-8 w-8">
                 <AvatarImage src={profile?.avatar_url || undefined} />
                 <AvatarFallback>
                   {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                 </AvatarFallback>
               </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
              </div>
              <Button
                size="sm"
                onClick={handleComment}
                disabled={isSubmittingComment || !commentText.trim()}
              >
                {isSubmittingComment ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* TODO: Add comments list here */}
            <div className="text-center text-sm text-muted-foreground py-4">
              Comments feature coming soon...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
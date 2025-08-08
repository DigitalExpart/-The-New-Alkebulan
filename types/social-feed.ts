// Social Feed Types for The New Alkebulan

export interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string | null
  post_type: 'text' | 'image' | 'link' | 'poll'
  privacy: 'public' | 'friends' | 'private'
  metadata: Record<string, any>
  is_pinned: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface PostWithStats extends Post {
  author_name?: string | null
  author_avatar?: string | null
  like_count: number
  comment_count: number
  share_count: number
  user_has_liked?: boolean
  user_has_shared?: boolean
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  parent_comment_id?: string | null
  content: string
  is_edited: boolean
  created_at: string
  updated_at: string
}

export interface PostCommentWithUser extends PostComment {
  author_name?: string | null
  author_avatar?: string | null
  like_count: number
  user_has_liked?: boolean
  replies?: PostCommentWithUser[]
}

export interface PostShare {
  id: string
  post_id: string
  user_id: string
  share_type: 'repost' | 'quote' | 'external'
  share_content?: string | null
  created_at: string
}

export interface CommentLike {
  id: string
  comment_id: string
  user_id: string
  created_at: string
}

export interface CreatePostData {
  content: string
  image_url?: string | null
  post_type?: 'text' | 'image' | 'link' | 'poll'
  privacy?: 'public' | 'friends' | 'private'
  metadata?: Record<string, any>
}

export interface CreateCommentData {
  post_id: string
  content: string
  parent_comment_id?: string | null
}

export interface CreateShareData {
  post_id: string
  share_type: 'repost' | 'quote' | 'external'
  share_content?: string | null
}

export interface SocialFeedFilters {
  post_type?: 'all' | 'text' | 'image' | 'link' | 'poll'
  privacy?: 'all' | 'public' | 'friends'
  user_id?: string
  limit?: number
  offset?: number
  order_by?: 'created_at' | 'like_count' | 'comment_count'
  order_direction?: 'asc' | 'desc'
}

export interface SocialFeedResponse {
  posts: PostWithStats[]
  total_count: number
  has_more: boolean
  next_offset?: number
}

// Interaction event types for real-time updates
export interface PostInteractionEvent {
  type: 'like' | 'unlike' | 'comment' | 'share' | 'unshare'
  post_id: string
  user_id: string
  data?: any
}

export interface CommentInteractionEvent {
  type: 'like' | 'unlike' | 'reply'
  comment_id: string
  user_id: string
  data?: any
} 
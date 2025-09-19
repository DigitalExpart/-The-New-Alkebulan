// Social Media Integration Types
export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin'

export interface SocialMediaConnection {
  id: string
  user_id: string
  platform: SocialPlatform
  platform_user_id: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
  platform_username?: string
  platform_display_name?: string
  profile_picture_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ImportedMedia {
  id: string
  user_id: string
  connection_id: string
  platform: SocialPlatform
  platform_media_id: string
  media_type: 'image' | 'video'
  media_url: string
  thumbnail_url?: string
  caption?: string
  created_at_platform?: string
  imported_at: string
  post_id?: string
}

export interface SocialMediaAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string[]
  responseType: 'code' | 'token'
}

export interface OAuthTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
  scope?: string
}

export interface SocialMediaUser {
  id: string
  username?: string
  name?: string
  email?: string
  picture?: string
  bio?: string
  followers_count?: number
  following_count?: number
  media_count?: number
}

export interface SocialMediaItem {
  id: string
  caption?: string
  media_type: 'image' | 'video' | 'carousel'
  media_url: string
  thumbnail_url?: string
  created_time: string
  permalink?: string
  likes_count?: number
  comments_count?: number
  shares_count?: number
}

export interface ImportResult {
  success: boolean
  imported_count: number
  failed_count: number
  errors: string[]
  imported_items: ImportedMedia[]
}

export interface SocialMediaConfig {
  instagram: SocialMediaAuthConfig
  facebook: SocialMediaAuthConfig
  tiktok: SocialMediaAuthConfig
  linkedin: SocialMediaAuthConfig
}

export interface ApiResponse<T> {
  data: T
  error?: {
    message: string
    code: number
    type: string
  }
  paging?: {
    next?: string
    previous?: string
  }
}

export interface InstagramMediaResponse {
  data: Array<{
    id: string
    caption?: string
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
    media_url: string
    thumbnail_url?: string
    timestamp: string
    permalink: string
    like_count?: number
    comments_count?: number
  }>
  paging?: {
    cursors: {
      before: string
      after: string
    }
    next?: string
  }
}

export interface FacebookMediaResponse {
  data: Array<{
    id: string
    created_time: string
    images?: Array<{
      source: string
      width: number
      height: number
    }>
    videos?: Array<{
      source: string
      width: number
      height: number
    }>
    name?: string
    description?: string
  }>
  paging?: {
    cursors: {
      before: string
      after: string
    }
    next?: string
  }
}

export interface TikTokVideoResponse {
  data: {
    videos: Array<{
      id: string
      create_time: number
      cover_image_url: string
      share_url: string
      video_description: string
      duration: number
      view_count: number
      like_count: number
      comment_count: number
      share_count: number
    }>
    cursor: number
    has_more: boolean
  }
}

export interface LinkedInPostResponse {
  elements: Array<{
    id: string
    created: {
      time: number
    }
    author: string
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: string
        }
        media?: Array<{
          status: string
          description: {
            text: string
          }
          media: string
          title: {
            text: string
          }
        }>
      }
    }
  }>
  paging?: {
    count: number
    start: number
  }
}

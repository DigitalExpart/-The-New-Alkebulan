import { 
  SocialPlatform, 
  SocialMediaItem, 
  ImportResult, 
  ImportedMedia,
  InstagramMediaResponse,
  FacebookMediaResponse,
  TikTokVideoResponse,
  LinkedInPostResponse
} from './types/social-media'
import { SocialMediaAuth } from './social-auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class SocialMediaImporter {
  private auth: SocialMediaAuth

  constructor() {
    this.auth = new SocialMediaAuth()
  }

  async importMedia(userId: string, platform: SocialPlatform, connectionId: string): Promise<ImportResult> {
    const connection = await this.auth.getConnection(userId, platform)
    if (!connection) {
      throw new Error(`No active connection found for ${platform}`)
    }

    let mediaItems: SocialMediaItem[]
    
    try {
      switch (platform) {
        case 'instagram':
          mediaItems = await this.importInstagramMedia(connection.access_token)
          break
        case 'facebook':
          mediaItems = await this.importFacebookMedia(connection.access_token)
          break
        case 'tiktok':
          mediaItems = await this.importTikTokMedia(connection.access_token)
          break
        case 'linkedin':
          mediaItems = await this.importLinkedInMedia(connection.access_token)
          break
        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }
    } catch (error) {
      // Try to refresh token and retry
      try {
        const newAccessToken = await this.auth.refreshToken(connectionId, platform)
        switch (platform) {
          case 'instagram':
            mediaItems = await this.importInstagramMedia(newAccessToken)
            break
          case 'facebook':
            mediaItems = await this.importFacebookMedia(newAccessToken)
            break
          case 'tiktok':
            mediaItems = await this.importTikTokMedia(newAccessToken)
            break
          case 'linkedin':
            mediaItems = await this.importLinkedInMedia(newAccessToken)
            break
        }
      } catch (refreshError) {
        throw new Error(`Failed to import media: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return await this.saveImportedMedia(userId, connectionId, platform, mediaItems)
  }

  private async importInstagramMedia(accessToken: string): Promise<SocialMediaItem[]> {
    const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&access_token=${accessToken}`)
    
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`)
    }

    const data: InstagramMediaResponse = await response.json()
    
    return data.data.map(item => ({
      id: item.id,
      caption: item.caption,
      media_type: item.media_type === 'IMAGE' ? 'image' : 'video',
      media_url: item.media_url,
      thumbnail_url: item.thumbnail_url,
      created_time: item.timestamp,
      permalink: item.permalink,
      likes_count: item.like_count,
      comments_count: item.comments_count
    }))
  }

  private async importFacebookMedia(accessToken: string): Promise<SocialMediaItem[]> {
    const photosResponse = await fetch(`https://graph.facebook.com/me/photos?fields=id,created_time,images,name&access_token=${accessToken}`)
    const videosResponse = await fetch(`https://graph.facebook.com/me/videos?fields=id,created_time,source,description&access_token=${accessToken}`)

    if (!photosResponse.ok || !videosResponse.ok) {
      throw new Error(`Facebook API error: ${photosResponse.statusText}`)
    }

    const photosData: FacebookMediaResponse = await photosResponse.json()
    const videosData: FacebookMediaResponse = await videosResponse.json()

    const photos = photosData.data.map(item => ({
      id: item.id,
      caption: item.name || item.description,
      media_type: 'image' as const,
      media_url: item.images?.[0]?.source || '',
      created_time: item.created_time,
      likes_count: 0,
      comments_count: 0
    }))

    const videos = videosData.data.map(item => ({
      id: item.id,
      caption: item.description,
      media_type: 'video' as const,
      media_url: item.videos?.[0]?.source || '',
      created_time: item.created_time,
      likes_count: 0,
      comments_count: 0
    }))

    return [...photos, ...videos]
  }

  private async importTikTokMedia(accessToken: string): Promise<SocialMediaItem[]> {
    const response = await fetch(`https://open.tiktokapis.com/v2/video/list/?fields=id,create_time,cover_image_url,share_url,video_description`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.statusText}`)
    }

    const data: TikTokVideoResponse = await response.json()
    
    return data.data.videos.map(video => ({
      id: video.id,
      caption: video.video_description,
      media_type: 'video' as const,
      media_url: video.share_url, // TikTok doesn't provide direct video URLs
      thumbnail_url: video.cover_image_url,
      created_time: new Date(video.create_time * 1000).toISOString(),
      likes_count: video.like_count,
      comments_count: video.comment_count,
      shares_count: video.share_count
    }))
  }

  private async importLinkedInMedia(accessToken: string): Promise<SocialMediaItem[]> {
    const response = await fetch(`https://api.linkedin.com/v2/ugcPosts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.statusText}`)
    }

    const data: LinkedInPostResponse = await response.json()
    
    return data.elements.map(post => {
      const shareContent = post.specificContent['com.linkedin.ugc.ShareContent']
      const media = shareContent.media?.[0]
      
      return {
        id: post.id,
        caption: shareContent.shareCommentary?.text || media?.description?.text,
        media_type: media ? 'image' : 'image' as const,
        media_url: media?.media || '',
        created_time: new Date(post.created.time).toISOString(),
        likes_count: 0,
        comments_count: 0
      }
    }).filter(item => item.media_url) // Only include items with media
  }

  private async saveImportedMedia(
    userId: string, 
    connectionId: string, 
    platform: SocialPlatform, 
    mediaItems: SocialMediaItem[]
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      imported_count: 0,
      failed_count: 0,
      errors: [],
      imported_items: []
    }

    for (const item of mediaItems) {
      try {
        // Check if media already exists
        const { data: existingMedia } = await supabase
          .from('imported_media')
          .select('id')
          .eq('connection_id', connectionId)
          .eq('platform_media_id', item.id)
          .single()

        if (existingMedia) {
          continue // Skip already imported media
        }

        // Create post for the imported media
        const postPayload = {
          user_id: userId,
          content: item.caption || `Imported ${item.media_type} from ${platform}`,
          image_url: item.media_url,
          metadata: {
            media_urls: [item.media_url],
            visibility: 'public',
            imported: true,
            source_platform: platform,
            platform_media_id: item.id,
            thumbnail_url: item.thumbnail_url,
            permalink: item.permalink,
            likes_count: item.likes_count,
            comments_count: item.comments_count,
            shares_count: item.shares_count
          },
          post_type: item.media_type,
          created_at: item.created_time
        }

        const { data: postData, error: postError } = await supabase
          .from('posts')
          .insert(postPayload)
          .select()
          .single()

        if (postError) {
          throw new Error(`Failed to create post: ${postError.message}`)
        }

        // Save imported media record
        const importedMediaData = {
          user_id: userId,
          connection_id: connectionId,
          platform,
          platform_media_id: item.id,
          media_type: item.media_type,
          media_url: item.media_url,
          thumbnail_url: item.thumbnail_url,
          caption: item.caption,
          created_at_platform: item.created_time,
          post_id: postData.id
        }

        const { data: importedMedia, error: importError } = await supabase
          .from('imported_media')
          .insert(importedMediaData)
          .select()
          .single()

        if (importError) {
          throw new Error(`Failed to save imported media: ${importError.message}`)
        }

        result.imported_items.push(importedMedia)
        result.imported_count++

      } catch (error) {
        result.failed_count++
        result.errors.push(`${item.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return result
  }

  async getImportedMedia(userId: string, platform?: SocialPlatform): Promise<ImportedMedia[]> {
    let query = supabase
      .from('imported_media')
      .select(`
        *,
        social_media_connections!inner(platform, platform_username, platform_display_name),
        posts(id, content, created_at)
      `)
      .eq('user_id', userId)
      .order('imported_at', { ascending: false })

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get imported media: ${error.message}`)
    }

    return data || []
  }

  async deleteImportedMedia(importedMediaId: string): Promise<void> {
    const { error } = await supabase
      .from('imported_media')
      .delete()
      .eq('id', importedMediaId)

    if (error) {
      throw new Error(`Failed to delete imported media: ${error.message}`)
    }
  }

  async syncMedia(userId: string, platform: SocialPlatform, connectionId: string): Promise<ImportResult> {
    // This method can be called periodically to sync new media
    return await this.importMedia(userId, platform, connectionId)
  }
}

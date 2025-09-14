import { createClient } from '@supabase/supabase-js'
import { 
  SocialMediaConnection, 
  SocialPlatform, 
  OAuthTokenResponse, 
  SocialMediaUser,
  SocialMediaConfig 
} from './types/social-media'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class SocialMediaAuth {
  private encryptionKey: string

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
  }

  private encryptToken(token: string): string {
    // Simple base64 encoding for now - in production, use proper encryption
    return btoa(token)
  }

  private decryptToken(encryptedToken: string): string {
    // Simple base64 decoding for now - in production, use proper decryption
    return atob(encryptedToken)
  }

  private getSocialMediaConfig(): SocialMediaConfig {
    return {
      instagram: {
        clientId: process.env.INSTAGRAM_CLIENT_ID!,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
        redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/instagram/callback`,
        scope: ['user_profile', 'user_media'],
        responseType: 'code'
      },
      facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID!,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/facebook/callback`,
        scope: ['user_photos', 'user_videos', 'user_posts'],
        responseType: 'code'
      },
      tiktok: {
        clientId: process.env.TIKTOK_CLIENT_KEY!,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
        redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/tiktok/callback`,
        scope: ['user.info.basic', 'video.list'],
        responseType: 'code'
      },
      linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID!,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/linkedin/callback`,
        scope: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
        responseType: 'code'
      }
    }
  }

  async saveConnection(userId: string, platform: SocialPlatform, connectionData: {
    platformUserId: string
    accessToken: string
    refreshToken?: string
    expiresAt?: string
    username?: string
    displayName?: string
    profilePicture?: string
  }): Promise<SocialMediaConnection> {
    const { data, error } = await supabase
      .from('social_media_connections')
      .upsert({
        user_id: userId,
        platform,
        platform_user_id: connectionData.platformUserId,
        access_token: this.encryptToken(connectionData.accessToken),
        refresh_token: connectionData.refreshToken ? this.encryptToken(connectionData.refreshToken) : null,
        token_expires_at: connectionData.expiresAt,
        platform_username: connectionData.username,
        platform_display_name: connectionData.displayName,
        profile_picture_url: connectionData.profilePicture,
        is_active: true
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to save connection: ${error.message}`)
    return data
  }

  async getConnections(userId: string): Promise<SocialMediaConnection[]> {
    const { data, error } = await supabase
      .from('social_media_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw new Error(`Failed to get connections: ${error.message}`)
    return data || []
  }

  async getConnection(userId: string, platform: SocialPlatform): Promise<SocialMediaConnection | null> {
    const { data, error } = await supabase
      .from('social_media_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get connection: ${error.message}`)
    }
    return data
  }

  async updateConnection(connectionId: string, updates: Partial<SocialMediaConnection>): Promise<void> {
    const updateData: any = { ...updates }
    
    // Encrypt tokens if they're being updated
    if (updates.access_token) {
      updateData.access_token = this.encryptToken(updates.access_token)
    }
    if (updates.refresh_token) {
      updateData.refresh_token = this.encryptToken(updates.refresh_token)
    }

    const { error } = await supabase
      .from('social_media_connections')
      .update(updateData)
      .eq('id', connectionId)

    if (error) throw new Error(`Failed to update connection: ${error.message}`)
  }

  async deleteConnection(connectionId: string): Promise<void> {
    const { error } = await supabase
      .from('social_media_connections')
      .update({ is_active: false })
      .eq('id', connectionId)

    if (error) throw new Error(`Failed to delete connection: ${error.message}`)
  }

  async refreshToken(connectionId: string, platform: SocialPlatform): Promise<string> {
    const connection = await supabase
      .from('social_media_connections')
      .select('*')
      .eq('id', connectionId)
      .single()

    if (!connection.data) {
      throw new Error('Connection not found')
    }

    const refreshToken = connection.data.refresh_token
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const decryptedRefreshToken = this.decryptToken(refreshToken)
    const config = this.getSocialMediaConfig()[platform]

    let tokenResponse: OAuthTokenResponse

    try {
      switch (platform) {
        case 'instagram':
          tokenResponse = await this.refreshInstagramToken(decryptedRefreshToken, config)
          break
        case 'facebook':
          tokenResponse = await this.refreshFacebookToken(decryptedRefreshToken, config)
          break
        case 'tiktok':
          tokenResponse = await this.refreshTikTokToken(decryptedRefreshToken, config)
          break
        case 'linkedin':
          tokenResponse = await this.refreshLinkedInToken(decryptedRefreshToken, config)
          break
        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }

      // Update the connection with new tokens
      await this.updateConnection(connectionId, {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        token_expires_at: tokenResponse.expires_in 
          ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
          : undefined
      })

      return tokenResponse.access_token
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async refreshInstagramToken(refreshToken: string, config: any): Promise<OAuthTokenResponse> {
    const response = await fetch('https://graph.instagram.com/refresh_access_token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'ig_refresh_token',
        access_token: refreshToken
      })
    })

    if (!response.ok) {
      throw new Error(`Instagram token refresh failed: ${response.statusText}`)
    }

    return await response.json()
  }

  private async refreshFacebookToken(refreshToken: string, config: any): Promise<OAuthTokenResponse> {
    const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'fb_exchange_token',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        fb_exchange_token: refreshToken
      })
    })

    if (!response.ok) {
      throw new Error(`Facebook token refresh failed: ${response.statusText}`)
    }

    return await response.json()
  }

  private async refreshTikTokToken(refreshToken: string, config: any): Promise<OAuthTokenResponse> {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_key: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    })

    if (!response.ok) {
      throw new Error(`TikTok token refresh failed: ${response.statusText}`)
    }

    return await response.json()
  }

  private async refreshLinkedInToken(refreshToken: string, config: any): Promise<OAuthTokenResponse> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret
      })
    })

    if (!response.ok) {
      throw new Error(`LinkedIn token refresh failed: ${response.statusText}`)
    }

    return await response.json()
  }

  getAuthUrl(platform: SocialPlatform): string {
    const config = this.getSocialMediaConfig()[platform]
    
    switch (platform) {
      case 'instagram':
        return `https://api.instagram.com/oauth/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${config.scope.join(',')}&response_type=${config.responseType}`
      
      case 'facebook':
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${config.scope.join(',')}&response_type=${config.responseType}`
      
      case 'tiktok':
        return `https://www.tiktok.com/auth/authorize/?client_key=${config.clientId}&scope=${config.scope.join(',')}&response_type=${config.responseType}&redirect_uri=${encodeURIComponent(config.redirectUri)}`
      
      case 'linkedin':
        return `https://www.linkedin.com/oauth/v2/authorization?response_type=${config.responseType}&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${config.scope.join(' ')}`
      
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  async exchangeCodeForToken(platform: SocialPlatform, code: string): Promise<OAuthTokenResponse> {
    const config = this.getSocialMediaConfig()[platform]
    
    switch (platform) {
      case 'instagram':
        return await this.exchangeInstagramCode(code, config)
      case 'facebook':
        return await this.exchangeFacebookCode(code, config)
      case 'tiktok':
        return await this.exchangeTikTokCode(code, config)
      case 'linkedin':
        return await this.exchangeLinkedInCode(code, config)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  private async exchangeInstagramCode(code: string, config: any): Promise<OAuthTokenResponse> {
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
        code
      })
    })

    if (!response.ok) {
      throw new Error(`Instagram token exchange failed: ${response.statusText}`)
    }

    return await response.json()
  }

  private async exchangeFacebookCode(code: string, config: any): Promise<OAuthTokenResponse> {
    const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        code
      })
    })

    if (!response.ok) {
      throw new Error(`Facebook token exchange failed: ${response.statusText}`)
    }

    return await response.json()
  }

  private async exchangeTikTokCode(code: string, config: any): Promise<OAuthTokenResponse> {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_key: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri
      })
    })

    if (!response.ok) {
      throw new Error(`TikTok token exchange failed: ${response.statusText}`)
    }

    return await response.json()
  }

  private async exchangeLinkedInCode(code: string, config: any): Promise<OAuthTokenResponse> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret
      })
    })

    if (!response.ok) {
      throw new Error(`LinkedIn token exchange failed: ${response.statusText}`)
    }

    return await response.json()
  }
}

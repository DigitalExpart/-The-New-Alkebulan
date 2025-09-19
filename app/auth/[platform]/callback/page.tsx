"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { SocialMediaAuth } from '@/lib/social-auth'
import { SocialPlatform } from '@/lib/types/social-media'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CallbackState {
  status: 'loading' | 'success' | 'error'
  message: string
  platform?: SocialPlatform
}

export default function SocialAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [state, setState] = useState<CallbackState>({
    status: 'loading',
    message: 'Processing authentication...'
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    const handleCallback = async () => {
      try {
        const platform = window.location.pathname.split('/')[2] as SocialPlatform
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          throw new Error(errorDescription || error)
        }

        if (!code) {
          throw new Error('No authorization code received')
        }

        setState({
          status: 'loading',
          message: `Connecting to ${platform}...`,
          platform
        })

        const auth = new SocialMediaAuth()
        
        // Exchange code for token
        const tokenResponse = await auth.exchangeCodeForToken(platform, code)
        
        // Get user info from platform
        const userInfo = await getUserInfo(platform, tokenResponse.access_token)
        
        // Save connection
        await auth.saveConnection(user.id, platform, {
          platformUserId: userInfo.id,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt: tokenResponse.expires_in 
            ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
            : undefined,
          username: userInfo.username,
          displayName: userInfo.name,
          profilePicture: userInfo.picture
        })

        setState({
          status: 'success',
          message: `Successfully connected to ${platform}!`,
          platform
        })

        toast.success(`Connected to ${platform} successfully!`)

        // Redirect to media gallery after 2 seconds
        setTimeout(() => {
          router.push('/profile/media')
        }, 2000)

      } catch (error) {
        console.error('Callback error:', error)
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Authentication failed'
        })
        toast.error('Failed to connect social media account')
      }
    }

    handleCallback()
  }, [user, router, searchParams])

  const getUserInfo = async (platform: SocialPlatform, accessToken: string) => {
    switch (platform) {
      case 'instagram':
        const instagramResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`)
        const instagramData = await instagramResponse.json()
        return {
          id: instagramData.id,
          username: instagramData.username,
          name: instagramData.username
        }

      case 'facebook':
        const facebookResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`)
        const facebookData = await facebookResponse.json()
        return {
          id: facebookData.id,
          name: facebookData.name,
          picture: facebookData.picture?.data?.url
        }

      case 'tiktok':
        const tiktokResponse = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        const tiktokData = await tiktokResponse.json()
        return {
          id: tiktokData.data.user.open_id,
          name: tiktokData.data.user.display_name,
          picture: tiktokData.data.user.avatar_url
        }

      case 'linkedin':
        const linkedinResponse = await fetch(`https://api.linkedin.com/v2/people/~`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        const linkedinData = await linkedinResponse.json()
        return {
          id: linkedinData.id,
          name: `${linkedinData.firstName?.localized?.en_US} ${linkedinData.lastName?.localized?.en_US}`.trim()
        }

      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  const getStatusIcon = () => {
    switch (state.status) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
      case 'error':
        return <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
      default:
        return <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (state.status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {state.platform && (
              <span className="capitalize">{state.platform}</span>
            )}
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {getStatusIcon()}
          
          <div className="space-y-2">
            <p className={`font-medium ${getStatusColor()}`}>
              {state.message}
            </p>
            
            {state.status === 'success' && (
              <p className="text-sm text-muted-foreground">
                Redirecting to media gallery...
              </p>
            )}
            
            {state.status === 'error' && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Something went wrong during authentication.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/profile/media')}
                  className="w-full"
                >
                  Go to Media Gallery
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

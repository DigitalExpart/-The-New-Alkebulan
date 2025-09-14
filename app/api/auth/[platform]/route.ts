import { NextRequest, NextResponse } from 'next/server'
import { SocialMediaAuth } from '@/lib/social-auth'
import { SocialPlatform } from '@/lib/types/social-media'

const auth = new SocialMediaAuth()

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const platform = params.platform as SocialPlatform
    
    if (!['instagram', 'facebook', 'tiktok', 'linkedin'].includes(platform)) {
      return NextResponse.json(
        { error: 'Unsupported platform' },
        { status: 400 }
      )
    }

    const authUrl = auth.getAuthUrl(platform)
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

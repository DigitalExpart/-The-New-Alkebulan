"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Image, 
  Video, 
  Upload, 
  Calendar,
  Download,
  Share2,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Grid3X3,
  List,
  Filter,
  Import,
  FileText,
  ChevronDown,
  Instagram,
  Facebook,
  Linkedin,
  Music,
  Link as LinkIcon
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
// import SocialMediaConnections from "@/components/social-media-connections"

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  filename: string
  size: number
  created_at: string
  post_id?: string
  post_content?: string
  likes_count: number
  comments_count: number
}

export default function MediaGalleryPage() {
  const { user } = useAuth()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'connections'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserMedia()
    }
  }, [user])

  const fetchUserMedia = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      // Try to fetch posts with media using the posts_with_stats view first
      let { data: posts, error } = await supabase
        .from('posts_with_stats')
        .select(`
          id,
          content,
          image_url,
          metadata,
          created_at,
          likes_count,
          comments_count
        `)
        .eq('user_id', user.id)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })

      // If posts_with_stats view doesn't exist, fallback to posts table
      if (error && error.code === '42P01') {
        console.log('posts_with_stats view not found, falling back to posts table')
        const fallbackResult = await supabase
          .from('posts')
          .select(`
            id,
            content,
            image_url,
            metadata,
            created_at
          `)
          .eq('user_id', user.id)
          .not('image_url', 'is', null)
          .order('created_at', { ascending: false })
        
        posts = fallbackResult.data?.map(post => ({
          ...post,
          likes_count: 0,
          comments_count: 0
        }))
        error = fallbackResult.error
      }

      if (error) {
        console.error('Error fetching posts:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        toast.error(`Failed to load media: ${error.message || 'Unknown error'}`)
        return
      }

      // Transform posts into media items
      const mediaItems: MediaItem[] = []

      posts?.forEach(post => {
        // Add primary image
        if (post.image_url) {
          mediaItems.push({
            id: `${post.id}-primary`,
            url: post.image_url,
            type: 'image',
            filename: `post-${post.id}-image.jpg`,
            size: 0, // Size not available
            created_at: post.created_at,
            post_id: post.id,
            post_content: post.content,
            likes_count: post.likes_count,
            comments_count: post.comments_count
          })
        }

        // Add media URLs from metadata
        if (post.metadata?.media_urls) {
          post.metadata.media_urls.forEach((url: string, index: number) => {
            const isVideo = url.match(/\.(mp4|mov|avi|webm)$/i)
            mediaItems.push({
              id: `${post.id}-media-${index}`,
              url: url,
              type: isVideo ? 'video' : 'image',
              filename: `post-${post.id}-media-${index}.${isVideo ? 'mp4' : 'jpg'}`,
              size: 0,
              created_at: post.created_at,
              post_id: post.id,
              post_content: post.content,
              likes_count: post.likes_count,
              comments_count: post.comments_count
            })
          })
        }
      })

      setMediaItems(mediaItems)
    } catch (error) {
      console.error('Error fetching user media:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      })
      toast.error(`Failed to load media: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredMedia = mediaItems.filter(item => {
    if (activeTab === 'all') return true
    if (activeTab === 'images') return item.type === 'image'
    if (activeTab === 'videos') return item.type === 'video'
    return true
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      toast.success('Download started')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const handleShare = async (url: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this media',
          url: url
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard')
      }
    } catch (error) {
      console.error('Share error:', error)
      toast.error('Failed to share')
    }
  }

  const handleImportMedia = (platform?: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*,video/*,.pdf,.doc,.docx,.txt'
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files || files.length === 0) return

      setImporting(true)
      
      try {
        const supabase = getSupabaseClient()
        if (!supabase || !user) {
          toast.error('Unable to import media')
          return
        }

        const mediaUrls: string[] = []
        
        // Upload each file
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const fileName = `${user.id}/media/${Date.now()}-${file.name}`
          
          const { data, error } = await supabase.storage
            .from('post-media')
            .upload(fileName, file)

          if (error) {
            console.error('Upload error:', error)
            toast.error(`Failed to upload ${file.name}`)
            continue
          }

          const { data: { publicUrl } } = supabase.storage
            .from('post-media')
            .getPublicUrl(fileName)

          mediaUrls.push(publicUrl)
        }

        if (mediaUrls.length === 0) {
          toast.error('No files were uploaded successfully')
          return
        }

        // Create a post with the imported media
        const platformText = platform ? ` from ${platform}` : ''
        const postPayload = {
          user_id: user.id,
          content: `Imported ${mediaUrls.length} media file${mediaUrls.length > 1 ? 's' : ''}${platformText}`,
          image_url: mediaUrls[0],
          metadata: {
            media_urls: mediaUrls,
            visibility: 'public',
            imported: true,
            source_platform: platform || 'local'
          },
          post_type: 'image',
          created_at: new Date().toISOString()
        }

        const { error: postError } = await supabase
          .from('posts')
          .insert(postPayload)

        if (postError) {
          console.error('Post creation error:', postError)
          toast.error('Media uploaded but failed to create post')
        } else {
          toast.success(`Successfully imported ${mediaUrls.length} media file${mediaUrls.length > 1 ? 's' : ''}${platformText}`)
          // Refresh the media list
          fetchUserMedia()
        }

      } catch (error) {
        console.error('Import error:', error)
        toast.error('Failed to import media')
      } finally {
        setImporting(false)
      }
    }

    input.click()
  }

  const handleSocialMediaImport = (platform: string) => {
    // Redirect to connections tab to set up the platform connection
    setActiveTab('connections')
    toast.info(`Please connect your ${platform} account first to import media.`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your media...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Media Gallery</h1>
              <p className="text-muted-foreground mt-1">
                All your uploaded images and videos
              </p>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    disabled={importing}
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Import className="h-4 w-4" />
                        Import Media
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleImportMedia()}>
                    <FileText className="h-4 w-4 mr-2" />
                    From Device
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSocialMediaImport('Instagram')}>
                    <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                    From Instagram
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSocialMediaImport('Facebook')}>
                    <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                    From Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSocialMediaImport('TikTok')}>
                    <Music className="h-4 w-4 mr-2 text-black" />
                    From TikTok
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSocialMediaImport('LinkedIn')}>
                    <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                    From LinkedIn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <Link href="/profile/media/upload">
                  <Upload className="h-4 w-4" />
                  Upload Media
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-4 max-w-lg">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                All ({mediaItems.length})
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Images ({mediaItems.filter(m => m.type === 'image').length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos ({mediaItems.filter(m => m.type === 'video').length})
              </TabsTrigger>
              <TabsTrigger value="connections" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Connections
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredMedia.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Image className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No media yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Upload images and videos to your posts to see them here.
                  </p>
                  <Button className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Your First Media
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredMedia.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square bg-muted">
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.filename}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.type === 'video' ? (
                            <Video className="h-3 w-3 mr-1" />
                          ) : (
                            <Image className="h-3 w-3 mr-1" />
                          )}
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{item.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(item.url, item.filename)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(item.url)}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMedia.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {item.type === 'video' ? (
                            <video
                              src={item.url}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={item.url}
                              alt={item.filename}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {item.type === 'video' ? (
                                <Video className="h-3 w-3 mr-1" />
                              ) : (
                                <Image className="h-3 w-3 mr-1" />
                              )}
                              {item.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(item.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium truncate">{item.filename}</p>
                          {item.post_content && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              From post: {item.post_content}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span>{item.likes_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{item.comments_count}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(item.url, item.filename)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(item.url)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="connections">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Social Media Connections</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Connect your social media accounts to import photos and videos.
                </p>
                <Button disabled>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

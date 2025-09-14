"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { SocialMediaAuth } from '@/lib/social-auth'
import { SocialMediaImporter } from '@/lib/social-importers'
import { SocialMediaConnection, SocialPlatform } from '@/lib/types/social-media'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  Music, 
  Link, 
  Unlink, 
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface SocialMediaConnectionsProps {
  onImportComplete?: () => void
}

export default function SocialMediaConnections({ onImportComplete }: SocialMediaConnectionsProps) {
  const { user } = useAuth()
  const [connections, setConnections] = useState<SocialMediaConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState<{[key: string]: boolean}>({})
  const [importingAll, setImportingAll] = useState(false)

  const auth = new SocialMediaAuth()
  const importer = new SocialMediaImporter()

  useEffect(() => {
    if (user) {
      fetchConnections()
    }
  }, [user])

  const fetchConnections = async () => {
    if (!user) return

    try {
      const data = await auth.getConnections(user.id)
      setConnections(data)
    } catch (error) {
      console.error('Error fetching connections:', error)
      toast.error('Failed to load social media connections')
    } finally {
      setLoading(false)
    }
  }

  const connectPlatform = (platform: SocialPlatform) => {
    if (!user) {
      toast.error('Please sign in to connect social media accounts')
      return
    }

    const authUrl = auth.getAuthUrl(platform)
    window.location.href = authUrl
  }

  const disconnectPlatform = async (connectionId: string, platform: SocialPlatform) => {
    try {
      await auth.deleteConnection(connectionId)
      setConnections(prev => prev.filter(conn => conn.id !== connectionId))
      toast.success(`Disconnected from ${platform}`)
    } catch (error) {
      console.error('Error disconnecting:', error)
      toast.error(`Failed to disconnect from ${platform}`)
    }
  }

  const importFromPlatform = async (connection: SocialMediaConnection) => {
    if (!user) return

    setImporting(prev => ({ ...prev, [connection.id]: true }))

    try {
      const result = await importer.importMedia(user.id, connection.platform, connection.id)
      
      if (result.success) {
        toast.success(`Imported ${result.imported_count} media items from ${connection.platform}`)
        if (result.failed_count > 0) {
          toast.warning(`${result.failed_count} items failed to import`)
        }
      } else {
        toast.error('Import failed')
      }

      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error(`Failed to import from ${connection.platform}`)
    } finally {
      setImporting(prev => ({ ...prev, [connection.id]: false }))
    }
  }

  const importFromAllPlatforms = async () => {
    if (!user || connections.length === 0) return

    setImportingAll(true)

    try {
      const results = await Promise.allSettled(
        connections.map(connection => 
          importer.importMedia(user.id, connection.platform, connection.id)
        )
      )

      let totalImported = 0
      let totalFailed = 0

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          totalImported += result.value.imported_count
          totalFailed += result.value.failed_count
        } else {
          totalFailed++
        }
      })

      if (totalImported > 0) {
        toast.success(`Imported ${totalImported} media items from all platforms`)
      }
      if (totalFailed > 0) {
        toast.warning(`${totalFailed} imports had issues`)
      }

      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      console.error('Bulk import error:', error)
      toast.error('Failed to import from some platforms')
    } finally {
      setImportingAll(false)
    }
  }

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-500" />
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />
      case 'tiktok':
        return <Music className="h-5 w-5 text-black" />
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-700" />
      default:
        return <Link className="h-5 w-5" />
    }
  }

  const getPlatformColor = (platform: SocialPlatform) => {
    switch (platform) {
      case 'instagram':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'facebook':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'tiktok':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'linkedin':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading connections...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Media Connections</h2>
          <p className="text-muted-foreground">
            Connect your social media accounts to import media
          </p>
        </div>
        {connections.length > 0 && (
          <Button 
            onClick={importFromAllPlatforms}
            disabled={importingAll}
            className="flex items-center gap-2"
          >
            {importingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing All...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Import All
              </>
            )}
          </Button>
        )}
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['instagram', 'facebook', 'tiktok', 'linkedin'] as SocialPlatform[]).map(platform => {
          const connection = connections.find(conn => conn.platform === platform)
          const isImporting = connection ? importing[connection.id] : false

          return (
            <Card key={platform} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(platform)}
                    <div>
                      <CardTitle className="text-lg capitalize">{platform}</CardTitle>
                      {connection ? (
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Not Connected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Badge className={getPlatformColor(platform)}>
                    {connection ? 'Active' : 'Available'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {connection ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p>Username: {connection.platform_username || 'N/A'}</p>
                      <p>Connected: {new Date(connection.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => importFromPlatform(connection)}
                        disabled={isImporting}
                        className="flex-1"
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Import Media
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => disconnectPlatform(connection.id, platform)}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connect your {platform} account to import photos and videos
                    </p>
                    
                    <Button
                      size="sm"
                      onClick={() => connectPlatform(platform)}
                      className="w-full"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Connect {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Help Text */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <h4 className="font-medium text-foreground">How it works:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Connect your social media accounts using OAuth</li>
              <li>Import photos and videos from your connected accounts</li>
              <li>Imported media will appear in your media gallery</li>
              <li>You can disconnect accounts at any time</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

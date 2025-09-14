"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function SupabaseDebug() {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>(null)

  useEffect(() => {
    const runDiagnostics = async () => {
      const info = {
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
            `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'undefined'
        },
        client: {
          isSupabaseAvailable: !!supabase,
          supabaseType: typeof supabase
        },
        user: {
          isAuthenticated: !!user,
          userId: user?.id,
          userEmail: user?.email
        }
      }
      
      setDebugInfo(info)

      // Test Supabase connection
      if (supabase && user) {
        try {
          // Test 1: Check if profiles table exists and is accessible
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)

          // Test 2: Check if posts table exists and is accessible
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select('id')
            .limit(1)

          setTestResults({
            profiles: {
              success: !profileError,
              error: profileError ? {
                message: profileError.message,
                code: profileError.code,
                details: profileError.details
              } : null,
              dataCount: profileData?.length || 0
            },
            posts: {
              success: !postsError,
              error: postsError ? {
                message: postsError.message,
                code: postsError.code,
                details: postsError.details
              } : null,
              dataCount: postsData?.length || 0
            }
          })
        } catch (error) {
          setTestResults({
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            }
          })
        }
      }
    }

    runDiagnostics()
  }, [user])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Environment Variables</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>NODE_ENV:</span>
                  <Badge variant={debugInfo?.environment?.NODE_ENV === 'development' ? 'default' : 'secondary'}>
                    {debugInfo?.environment?.NODE_ENV || 'undefined'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Supabase URL:</span>
                  <Badge variant={debugInfo?.environment?.hasSupabaseUrl ? 'default' : 'destructive'}>
                    {debugInfo?.environment?.hasSupabaseUrl ? 'Configured' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Supabase Key:</span>
                  <Badge variant={debugInfo?.environment?.hasSupabaseKey ? 'default' : 'destructive'}>
                    {debugInfo?.environment?.hasSupabaseKey ? 'Configured' : 'Missing'}
                  </Badge>
                </div>
                {debugInfo?.environment?.supabaseUrl && (
                  <div className="text-xs text-muted-foreground">
                    URL: {debugInfo.environment.supabaseUrl}
                  </div>
                )}
                {debugInfo?.environment?.supabaseKeyPreview && (
                  <div className="text-xs text-muted-foreground">
                    Key: {debugInfo.environment.supabaseKeyPreview}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Client Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>Supabase Client:</span>
                  <Badge variant={debugInfo?.client?.isSupabaseAvailable ? 'default' : 'destructive'}>
                    {debugInfo?.client?.isSupabaseAvailable ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>User Authentication:</span>
                  <Badge variant={debugInfo?.user?.isAuthenticated ? 'default' : 'secondary'}>
                    {debugInfo?.user?.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </Badge>
                </div>
                {debugInfo?.user?.userId && (
                  <div className="text-xs text-muted-foreground">
                    User ID: {debugInfo.user.userId}
                  </div>
                )}
              </div>
            </div>

            {testResults && (
              <div>
                <h4 className="font-medium mb-2">Database Tests</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>Profiles Table:</span>
                    <Badge variant={testResults.profiles?.success ? 'default' : 'destructive'}>
                      {testResults.profiles?.success ? 'Accessible' : 'Error'}
                    </Badge>
                  </div>
                  {testResults.profiles?.error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      Error: {testResults.profiles.error.message} (Code: {testResults.profiles.error.code})
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>Posts Table:</span>
                    <Badge variant={testResults.posts?.success ? 'default' : 'destructive'}>
                      {testResults.posts?.success ? 'Accessible' : 'Error'}
                    </Badge>
                  </div>
                  {testResults.posts?.error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      Error: {testResults.posts.error.message} (Code: {testResults.posts.error.code})
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
            >
              Refresh Diagnostics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

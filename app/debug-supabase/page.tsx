"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

export default function DebugSupabasePage() {
  const { user } = useAuth()
  const [tests, setTests] = useState<{[key: string]: {status: 'pending' | 'success' | 'error', message: string}}>({})
  const [running, setRunning] = useState(false)

  const runTests = async () => {
    setRunning(true)
    setTests({})

    const testResults: {[key: string]: {status: 'pending' | 'success' | 'error', message: string}} = {}

    // Test 1: Supabase Configuration
    testResults['config'] = { status: 'pending', message: 'Checking Supabase configuration...' }
    setTests({...testResults})
    
    try {
      const configured = isSupabaseConfigured()
      if (configured) {
        testResults['config'] = { status: 'success', message: 'Supabase is properly configured' }
      } else {
        testResults['config'] = { status: 'error', message: 'Supabase configuration is missing' }
      }
    } catch (error) {
      testResults['config'] = { status: 'error', message: `Configuration error: ${error}` }
    }
    setTests({...testResults})

    // Test 2: Client Creation
    testResults['client'] = { status: 'pending', message: 'Testing Supabase client creation...' }
    setTests({...testResults})
    
    try {
      const client = getSupabaseClient()
      if (client) {
        testResults['client'] = { status: 'success', message: 'Supabase client created successfully' }
      } else {
        testResults['client'] = { status: 'error', message: 'Failed to create Supabase client' }
      }
    } catch (error) {
      testResults['client'] = { status: 'error', message: `Client creation error: ${error}` }
    }
    setTests({...testResults})

    // Test 3: Authentication Status
    testResults['auth'] = { status: 'pending', message: 'Checking authentication status...' }
    setTests({...testResults})
    
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      if (error) {
        testResults['auth'] = { status: 'error', message: `Auth error: ${error.message}` }
      } else if (authUser) {
        testResults['auth'] = { status: 'success', message: `Authenticated as: ${authUser.email}` }
      } else {
        testResults['auth'] = { status: 'error', message: 'Not authenticated' }
      }
    } catch (error) {
      testResults['auth'] = { status: 'error', message: `Auth test error: ${error}` }
    }
    setTests({...testResults})

    // Test 4: Storage Bucket Access
    testResults['storage'] = { status: 'pending', message: 'Testing storage bucket access...' }
    setTests({...testResults})
    
    try {
      const { data, error } = await supabase.storage.listBuckets()
      if (error) {
        testResults['storage'] = { status: 'error', message: `Storage error: ${error.message}` }
      } else {
        const postMediaBucket = data?.find(bucket => bucket.name === 'post-media')
        if (postMediaBucket) {
          testResults['storage'] = { status: 'success', message: `post-media bucket found (${postMediaBucket.file_size_limit / 1024 / 1024}MB limit)` }
        } else {
          testResults['storage'] = { status: 'error', message: 'post-media bucket not found' }
        }
      }
    } catch (error) {
      testResults['storage'] = { status: 'error', message: `Storage test error: ${error}` }
    }
    setTests({...testResults})

    // Test 5: Test File Upload
    testResults['upload'] = { status: 'pending', message: 'Testing file upload capability...' }
    setTests({...testResults})
    
    try {
      if (!user) {
        testResults['upload'] = { status: 'error', message: 'No authenticated user for upload test' }
      } else {
        // Create a small test file
        const testContent = 'Test file content'
        const testFile = new File([testContent], 'test.txt', { type: 'text/plain' })
        const fileName = `${user.id}/test/${Date.now()}-test.txt`
        
        const { data, error } = await supabase.storage
          .from('post-media')
          .upload(fileName, testFile)

        if (error) {
          testResults['upload'] = { status: 'error', message: `Upload error: ${error.message}` }
        } else {
          // Clean up test file
          await supabase.storage.from('post-media').remove([fileName])
          testResults['upload'] = { status: 'success', message: 'File upload test successful' }
        }
      }
    } catch (error) {
      testResults['upload'] = { status: 'error', message: `Upload test error: ${error}` }
    }
    setTests({...testResults})

    setRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Supabase Connection Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Run diagnostics to identify Supabase connection issues
            </p>
            <Button onClick={runTests} disabled={running}>
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Diagnostics'
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {Object.entries(tests).map(([key, test]) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h4 className="font-medium capitalize">{key} Test</h4>
                    <p className="text-sm text-muted-foreground">{test.message}</p>
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
          </div>

          {Object.keys(tests).length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Diagnose</h3>
              <p className="text-muted-foreground">
                Click "Run Diagnostics" to test your Supabase connection and identify any issues.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

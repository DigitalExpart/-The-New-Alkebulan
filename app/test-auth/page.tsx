"use client"

import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function TestAuthPage() {
  const [configStatus, setConfigStatus] = useState<any>({})
  const [authStatus, setAuthStatus] = useState<any>({})

  useEffect(() => {
    // Check configuration
    setConfigStatus({
      isConfigured: isSupabaseConfigured(),
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'undefined'
    })

    // Check authentication status
    if (supabase) {
      supabase.auth.getSession().then(({ data, error }) => {
        setAuthStatus({
          hasSession: !!data.session,
          userId: data.session?.user?.id,
          email: data.session?.user?.email,
          error: error?.message
        })
      })
    } else {
      setAuthStatus({ error: 'Supabase client is null' })
    }
  }, [])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
      
      <div className="space-y-6">
        {/* Configuration Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Supabase Configured:</span>
              <span className={configStatus.isConfigured ? 'text-green-600' : 'text-red-600'}>
                {configStatus.isConfigured ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Has URL:</span>
              <span className={configStatus.hasUrl ? 'text-green-600' : 'text-red-600'}>
                {configStatus.hasUrl ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Has Key:</span>
              <span className={configStatus.hasKey ? 'text-green-600' : 'text-red-600'}>
                {configStatus.hasKey ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">URL:</span>
              <span className="text-gray-600 font-mono text-sm">
                {configStatus.url || 'undefined'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Key Preview:</span>
              <span className="text-gray-600 font-mono text-sm">
                {configStatus.keyPreview || 'undefined'}
              </span>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Has Session:</span>
              <span className={authStatus.hasSession ? 'text-green-600' : 'text-gray-600'}>
                {authStatus.hasSession ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">User ID:</span>
              <span className="text-gray-600 font-mono text-sm">
                {authStatus.userId || 'None'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Email:</span>
              <span className="text-gray-600 font-mono text-sm">
                {authStatus.email || 'None'}
              </span>
            </div>
            {authStatus.error && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Error:</span>
                <span className="text-red-600 font-mono text-sm">
                  {authStatus.error}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Environment Variables Debug */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Environment Variables Debug</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">NODE_ENV:</span>
              <span className="text-gray-600 font-mono text-sm">
                {process.env.NODE_ENV}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">NEXT_PUBLIC_SITE_URL:</span>
              <span className="text-gray-600 font-mono text-sm">
                {process.env.NEXT_PUBLIC_SITE_URL || 'undefined'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

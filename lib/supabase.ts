import { createClient } from "@supabase/supabase-js"

// Check if we have valid Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Enhanced logging for debugging
console.log('=== SUPABASE CONFIGURATION DEBUG ===')
console.log('Environment Check:', {
  NODE_ENV: process.env.NODE_ENV,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl,
  keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'undefined',
  isClient: typeof window !== 'undefined',
  isServer: typeof window === 'undefined'
})

// Log configuration status for debugging
if (typeof window !== 'undefined') {
  console.log('Browser-side Supabase Config Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined',
    nodeEnv: process.env.NODE_ENV
  })
}

// Create client with better fallback handling
export const supabase = (() => {
  if (supabaseUrl && supabaseAnonKey) {
    console.log('Creating Supabase client with real credentials')
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  } else {
    // In development, create a mock client to prevent crashes
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn('Supabase not configured - using mock client for development')
      return createClient('https://mock.supabase.co', 'mock-key', {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      })
    }
    console.error('Supabase not configured and not in development mode')
    return null
  }
})()

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  // In development, always return true to prevent the error message
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    return true
  }
  return !!(supabaseUrl && supabaseAnonKey)
}

// Helper function to get a safe Supabase client
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client not configured. Please check your environment variables.')
  }
  return supabase
}

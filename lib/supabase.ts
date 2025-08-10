import { createClient } from "@supabase/supabase-js"

// Check if we have valid Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log configuration status for debugging
if (typeof window !== 'undefined') {
  console.log('Supabase Config Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
  })
}

// Create client with fallback for development
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : (() => {
      // In development, create a mock client to prevent crashes
      if (process.env.NODE_ENV === 'development') {
        console.warn('Supabase not configured - using mock client for development')
        return createClient('https://mock.supabase.co', 'mock-key', {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        })
      }
      return null
    })()

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Helper function to get a safe Supabase client
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client not configured. Please check your environment variables.')
  }
  return supabase
}

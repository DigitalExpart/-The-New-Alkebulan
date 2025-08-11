"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { AuthState, SignUpData, SignInData, ResetPasswordData } from "@/types/auth"
import { toast } from "sonner"

interface AuthContextType extends AuthState {
  profile: any | null
  signUp: (data: SignUpData) => Promise<void>
  signIn: (data: SignInData) => Promise<void>
  signInWithProvider: (provider: 'google' | 'facebook' | 'github') => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  const [profile, setProfile] = useState<any | null>(null)

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured() || !supabase) return null
    
    try {
      console.log('Fetching profile for user ID:', userId)
      
      // Try to find profile by user_id first (more reliable)
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      // If not found by user_id, try by id
      if (error && error.code === 'PGRST116') {
        console.log('Profile not found by user_id, trying by id...')
        const { data: dataById, error: errorById } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (errorById && errorById.code === 'PGRST116') {
          console.log('Profile not found by id either, creating new profile...')
          // Profile doesn't exist, create a default one
          const defaultProfile = {
            user_id: userId,
            buyer_enabled: true,
            seller_enabled: false,
            account_type: 'buyer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(defaultProfile)
            .select()
            .single()
          
          if (createError) {
            console.error('Error creating default profile:', createError)
            return null
          }
          
          console.log('Default profile created:', newProfile)
          return newProfile
        }
        
        if (errorById) {
          console.error('Error fetching profile by id:', errorById)
          return null
        }
        
        return dataById
      }
      
      if (error) {
        console.error('Error fetching profile by user_id:', error)
        return null
      }
      
      console.log('Profile found:', data)
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (state.user) {
      const profileData = await fetchProfile(state.user.id)
      setProfile(profileData)
    }
  }

  useEffect(() => {
    // Check if we have valid Supabase configuration
    if (!isSupabaseConfigured() || !supabase) {
      setState((prev) => ({ ...prev, loading: false }))
      return
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user
        ? {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          }
        : null

      setState((prev) => ({
        ...prev,
        user,
        loading: false,
      }))

      // Fetch profile data if user exists
      if (user) {
        const profileData = await fetchProfile(user.id)
        setProfile(profileData)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user
        ? {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          }
        : null

      setState((prev) => ({
        ...prev,
        user,
        loading: false,
      }))

      // Fetch profile data if user exists, clear if not
      if (user) {
        const profileData = await fetchProfile(user.id)
        setProfile(profileData)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (data: SignUpData) => {
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("Authentication not configured. Please add Supabase integration.")
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { error, data: signUpData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            account_type: data.account_type,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Check if email confirmation is required
      if (signUpData.user && !signUpData.session) {
        toast.success("Account created successfully! Please check your email to confirm your account before signing in.")
        router.push("/auth/signin")
      } else if (signUpData.session) {
        // User is automatically signed in (email confirmation not required)
        // Create profile record
        if (signUpData.user) {
          try {
            const profileData = {
              id: signUpData.user.id,
              user_id: signUpData.user.id, // Add user_id field
              full_name: data.full_name,
              email: data.email,
              account_type: data.account_type,
              buyer_enabled: data.account_type === 'buyer',
              seller_enabled: data.account_type === 'seller',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            
            const { error: profileError } = await supabase
              .from('profiles')
              .insert(profileData)
            
            if (profileError) {
              console.error('Error creating profile:', profileError)
              // Don't fail the signup if profile creation fails
            } else {
              console.log('Profile created successfully')
            }
          } catch (profileError) {
            console.error('Error creating profile:', profileError)
            // Don't fail the signup if profile creation fails
          }
        }
        
        toast.success("Account created and signed in successfully!")
        router.push("/dashboard")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred"
      setState((prev) => ({ ...prev, error: message }))
      toast.error(message)
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const signIn = async (data: SignInData) => {
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("Authentication not configured. Please add Supabase integration.")
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { error, data: signInData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      // Fetch profile data after successful sign in
      if (signInData.user) {
        const profileData = await fetchProfile(signInData.user.id)
        setProfile(profileData)
      }

      toast.success("Welcome back!")
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred"
      setState((prev) => ({ ...prev, error: message }))
      toast.error(message)
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      return
    }

    setState((prev) => ({ ...prev, loading: true }))

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setProfile(null) // Clear profile data
      toast.success("Signed out successfully")
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred"
      toast.error(message)
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const resetPassword = async (data: ResetPasswordData) => {
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("Authentication not configured. Please add Supabase integration.")
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email)
      if (error) throw error

      toast.success("Password reset email sent!")
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred"
      setState((prev) => ({ ...prev, error: message }))
      toast.error(message)
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const signInWithProvider = async (provider: 'google' | 'facebook' | 'github') => {
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("Authentication not configured. Please add Supabase integration.")
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      toast.success(`Signing in with ${provider}...`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred"
      setState((prev) => ({ ...prev, error: message }))
      toast.error(message)
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        profile,
        signUp,
        signIn,
        signInWithProvider,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

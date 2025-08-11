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
          console.log('Profile not found by id either, checking if profile exists with different structure...')
          
          // Try to find any profile that might exist with this user
          const { data: existingProfiles, error: searchError } = await supabase
            .from('profiles')
            .select('*')
            .or(`user_id.eq.${userId},id.eq.${userId}`)
          
          if (searchError) {
            console.error('Error searching for existing profiles:', searchError)
          } else if (existingProfiles && existingProfiles.length > 0) {
            console.log('Found existing profile with different structure:', existingProfiles[0])
            return existingProfiles[0]
          }
          
          console.log('No existing profile found, creating new default profile...')
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
      
      // Check if profile has correct role settings based on account_type
      if (profileData && profileData.account_type) {
        const expectedBuyerEnabled = profileData.account_type === 'buyer'
        const expectedSellerEnabled = profileData.account_type === 'seller'
        
        // If role settings don't match account_type, fix them
        if (profileData.buyer_enabled !== expectedBuyerEnabled || 
            profileData.seller_enabled !== expectedSellerEnabled) {
          console.log('Fixing mismatched role settings for account type:', profileData.account_type)
          
          if (supabase) {
            try {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  buyer_enabled: expectedBuyerEnabled,
                  seller_enabled: expectedSellerEnabled,
                  updated_at: new Date().toISOString()
                })
                .eq('id', profileData.id)
              
              if (updateError) {
                console.error('Error fixing role settings:', updateError)
              } else {
                console.log('Role settings fixed successfully')
                // Fetch the updated profile
                const updatedProfile = await fetchProfile(state.user.id)
                setProfile(updatedProfile)
                return
              }
            } catch (error) {
              console.error('Error fixing role settings:', error)
            }
          }
        }
      }
      
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

      // Always create profile record regardless of email confirmation
      if (signUpData.user) {
        try {
          console.log('Creating profile for user:', signUpData.user.id, 'with account type:', data.account_type)
          
          const profileData = {
            id: signUpData.user.id,
            user_id: signUpData.user.id,
            full_name: data.full_name,
            email: data.email,
            account_type: data.account_type,
            buyer_enabled: data.account_type === 'buyer',
            seller_enabled: data.account_type === 'seller',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          
          console.log('Profile data to insert:', profileData)
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert(profileData)
          
          if (profileError) {
            console.error('Error creating profile:', profileError)
            // Don't fail the signup if profile creation fails
          } else {
            console.log('Profile created successfully with roles:', {
              buyer_enabled: profileData.buyer_enabled,
              seller_enabled: profileData.seller_enabled,
              account_type: profileData.account_type
            })
          }
        } catch (profileError) {
          console.error('Error creating profile:', profileError)
          // Don't fail the signup if profile creation fails
        }
      }
      
      // Check if email confirmation is required
      if (signUpData.user && !signUpData.session) {
        toast.success("Account created successfully! Please check your email to confirm your account before signing in.")
        router.push("/auth/signin")
      } else if (signUpData.session) {
        // User is automatically signed in (email confirmation not required)
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

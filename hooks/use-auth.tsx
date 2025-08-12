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

  const fetchProfile = async (userId: string, userMetadata?: any) => {
    if (!isSupabaseConfigured() || !supabase) return null
    
    try {
      console.log('Fetching profile for user ID:', userId)
      console.log('User metadata:', userMetadata)
      
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
          
          console.log('No existing profile found, creating new profile based on user metadata...')
          
          // Get account type from user metadata or default to 'buyer'
          const accountType = userMetadata?.account_type || 'buyer'
          console.log('Creating profile with account type from metadata:', accountType)
          
          // Profile doesn't exist, create one based on user's intended account type
          const defaultProfile = {
            user_id: userId,
            buyer_enabled: accountType === 'buyer',
            seller_enabled: accountType === 'seller',
            account_type: accountType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          
          console.log('Creating default profile with data:', defaultProfile)
          
          // Additional logging for seller profiles
          if (accountType === 'seller') {
            console.log('🎯 CREATING SELLER PROFILE FROM FETCHPROFILE 🎯')
            console.log('Seller profile will be created with:', {
              user_id: userId,
              seller_enabled: defaultProfile.seller_enabled,
              buyer_enabled: defaultProfile.buyer_enabled,
              account_type: defaultProfile.account_type
            })
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
          
          console.log('Default profile created successfully:', newProfile)
          console.log('Profile created with roles:', {
            buyer_enabled: defaultProfile.buyer_enabled,
            seller_enabled: defaultProfile.seller_enabled,
            account_type: defaultProfile.account_type
          })
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
    if (state.user && supabase) {
      try {
        // Get current session to access user metadata
        const { data: { session } } = await supabase.auth.getSession()
        const userMetadata = {
          account_type: session?.user?.user_metadata?.account_type || 'buyer'
        }
        
        const profileData = await fetchProfile(state.user.id, userMetadata)
        
        // Check if profile has correct role settings based on account_type
        if (profileData && profileData.account_type) {
          const expectedBuyerEnabled = profileData.account_type === 'buyer'
          const expectedSellerEnabled = profileData.account_type === 'seller'
          
          // If role settings don't match account_type, fix them
          if (profileData.buyer_enabled !== expectedBuyerEnabled || 
              profileData.seller_enabled !== expectedSellerEnabled) {
            console.log('Fixing mismatched role settings for account type:', profileData.account_type)
            
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
                const updatedProfile = await fetchProfile(state.user.id, userMetadata)
                setProfile(updatedProfile)
                return
              }
            } catch (error) {
              console.error('Error fixing role settings:', error)
            }
          }
        }
        
        setProfile(profileData)
      } catch (error) {
        console.error('Error refreshing profile:', error)
      }
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
            account_type: session.user.user_metadata?.account_type,
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
      if (user && session) {
        const userMetadata = {
          account_type: session.user.user_metadata?.account_type || 'buyer'
        }
        const profileData = await fetchProfile(user.id, userMetadata)
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
            account_type: session.user.user_metadata?.account_type,
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
      if (user && session) {
        const userMetadata = {
          account_type: session.user.user_metadata?.account_type || 'buyer'
        }
        const profileData = await fetchProfile(user.id, userMetadata)
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
          
          console.log('Attempting to create profile with data:', profileData)
          
          console.log('Profile data to insert:', profileData)
          
          console.log('Attempting to insert profile data:', profileData)
          
          console.log('About to insert profile data into database...')
          
          const { data: insertedProfile, error: profileError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
          
          if (profileError) {
            console.error('❌ PROFILE CREATION FAILED ❌')
            console.error('Error creating profile:', profileError)
            console.error('Profile data that failed:', profileData)
            console.error('Error details:', {
              code: profileError.code,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint
            })
            
            // Try to get more details about the failure
            if (profileError.code === '23505') {
              console.error('❌ UNIQUE CONSTRAINT VIOLATION - Profile might already exist')
            } else if (profileError.code === '23502') {
              console.error('❌ NOT NULL CONSTRAINT VIOLATION - Missing required field')
            } else if (profileError.code === '42P01') {
              console.error('❌ TABLE DOES NOT EXIST - Check table name')
            }
            
            // Don't fail the signup if profile creation fails
          } else {
            console.log('✅ PROFILE CREATED SUCCESSFULLY ✅')
            console.log('Profile created successfully:', insertedProfile)
            console.log('Profile created successfully with roles:', {
              buyer_enabled: profileData.buyer_enabled,
              seller_enabled: profileData.seller_enabled,
              account_type: profileData.account_type
            })
            
            // Additional logging for seller profiles
            if (data.account_type === 'seller') {
              console.log('🎯 SELLER PROFILE CREATED 🎯')
              console.log('Seller profile details:', {
                user_id: signUpData.user.id,
                seller_enabled: profileData.seller_enabled,
                buyer_enabled: profileData.buyer_enabled,
                account_type: profileData.account_type
              })
            }
          }
        } catch (profileError) {
          console.error('❌ EXCEPTION during profile creation:', profileError)
          console.error('Exception type:', typeof profileError)
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
        const userMetadata = {
          account_type: signInData.user.user_metadata?.account_type || 'buyer'
        }
        const profileData = await fetchProfile(signInData.user.id, userMetadata)
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

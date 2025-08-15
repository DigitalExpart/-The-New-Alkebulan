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
  forceRefreshProfile: () => Promise<void>
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

  // Debug: Log profile changes in real-time
  useEffect(() => {
    console.log('🔍 PROFILE STATE CHANGED:', {
      profile,
      business_enabled: profile?.business_enabled,
      investor_enabled: profile?.investor_enabled,
      mentor_enabled: profile?.mentor_enabled,
      creator_enabled: profile?.creator_enabled,
      selected_roles: profile?.selected_roles,
      timestamp: new Date().toISOString()
    })
  }, [profile])

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
          
          // Get selected roles from user metadata or default to 'business'
          const selectedRoles = userMetadata?.selected_roles || ['business']
          console.log('Creating profile with selected roles from metadata:', selectedRoles)
          
          // Profile doesn't exist, create one based on user's intended roles
          const defaultProfile = {
            user_id: userId,
            business_enabled: selectedRoles.includes('business'),
            investor_enabled: selectedRoles.includes('investor'),
            mentor_enabled: selectedRoles.includes('mentor'),
            creator_enabled: selectedRoles.includes('creator'),
            selected_roles: selectedRoles,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          
          console.log('Creating default profile with data:', defaultProfile)
          
          // Additional logging for business profiles
          if (selectedRoles.includes('business')) {
            console.log('🎯 CREATING BUSINESS PROFILE FROM FETCHPROFILE 🎯')
            console.log('Business profile will be created with:', {
              user_id: userId,
              business_enabled: defaultProfile.business_enabled,
              investor_enabled: defaultProfile.investor_enabled,
              mentor_enabled: defaultProfile.mentor_enabled,
              creator_enabled: defaultProfile.creator_enabled,
              selected_roles: defaultProfile.selected_roles
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
            business_enabled: defaultProfile.business_enabled,
            investor_enabled: defaultProfile.investor_enabled,
            mentor_enabled: defaultProfile.mentor_enabled,
            creator_enabled: defaultProfile.creator_enabled,
            selected_roles: defaultProfile.selected_roles
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
        
        console.log('🔄 Refreshing profile...')
        const profileData = await fetchProfile(state.user.id, userMetadata)
        
        // Update the local profile state immediately
        if (profileData) {
          console.log('✅ Profile refreshed successfully:', profileData)
          setProfile(profileData)
          
          // Force a re-render by updating the state
          setState(prev => ({ ...prev }))
        } else {
          console.log('⚠️ No profile data returned from refresh')
        }
        
                // Check if profile has correct role settings based on account_type
        if (profileData && profileData.account_type) {
          // Enforce single-role system: only the account_type role should be enabled
          const expectedBuyerEnabled = profileData.account_type === 'buyer'
          const expectedBusinessEnabled = profileData.account_type === 'business'
          
          // If role settings don't match expected single-role setup, fix them
          if (profileData.buyer_enabled !== expectedBuyerEnabled || 
              profileData.business_enabled !== expectedBusinessEnabled) {
            console.log('🔧 Fixing role settings to enforce single-role system for:', profileData.account_type)
            
            try {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  buyer_enabled: expectedBuyerEnabled,
                  business_enabled: expectedBusinessEnabled,
                  updated_at: new Date().toISOString()
                })
                .eq('id', profileData.id)
               
              if (updateError) {
                console.error('❌ Error fixing role settings:', updateError)
              } else {
                console.log('✅ Single-role system enforced successfully')
                // Fetch the updated profile again
                const updatedProfile = await fetchProfile(state.user.id, userMetadata)
                if (updatedProfile) {
                  setProfile(updatedProfile)
                  // Force a re-render
                  setState(prev => ({ ...prev }))
                  console.log('✅ Updated profile state with single role:', updatedProfile)
                }
                return
              }
            } catch (error) {
              console.error('❌ Error fixing role settings:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing profile:', error)
      }
    }
  }

  const forceRefreshProfile = async () => {
    console.log('🔄 Force refreshing profile...')
    await refreshProfile()
  }

  const signUp = async (data: SignUpData) => {
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("Authentication not configured. Please add Supabase integration.")
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      console.log('🚀 Starting signup process with data:', data)
      
             // Create user account
       const { data: signUpData, error } = await supabase.auth.signUp({
         email: data.email,
         password: data.password,
         options: {
           data: {
             full_name: data.full_name,
             first_name: data.first_name,
             last_name: data.last_name,
             username: data.username,
             country: data.country,
             selected_roles: data.selected_roles,
           },
         },
       })

      if (error) throw error

      if (signUpData.user) {
        console.log('✅ User account created successfully:', signUpData.user.id)
        
                 console.log('✅ User account created successfully:', signUpData.user.id)
        
        // The database trigger should automatically create the profile
        // Let's wait a moment for the trigger to execute, then fetch the profile
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Fetch the automatically created profile
        const profileData = await fetchProfile(signUpData.user.id, {
          selected_roles: data.selected_roles
        })
        
        if (profileData) {
          console.log('✅ Profile fetched successfully:', profileData)
          setProfile(profileData)
          toast.success("Account created successfully! Welcome to your dashboard.")
        } else {
          console.warn('⚠️ Profile not found, may need manual creation')
          // Create a minimal profile if the trigger failed
          const minimalProfile = {
            id: signUpData.user.id,
            user_id: signUpData.user.id,
            full_name: data.full_name,
            first_name: data.first_name,
            last_name: data.last_name,
            username: data.username,
            country: data.country,
            email: data.email,
            account_type: data.selected_roles.includes('business') ? 'business' : 'buyer',
            buyer_enabled: !data.selected_roles.includes('business'),
            business_enabled: data.selected_roles.includes('business'),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert(minimalProfile)
          
          if (profileError) {
            console.error('❌ Error creating profile:', profileError)
            toast.error("Account created but profile setup failed. Please contact support.")
          } else {
            console.log('✅ Profile created manually')
            setProfile(minimalProfile)
            toast.success("Account created successfully! Welcome to your dashboard.")
          }
        }
        
        // Set user in state
        setState((prev) => ({ ...prev, user: signUpData.user, loading: false }))
        
        // Redirect directly to dashboard - users can verify email later
        router.push('/dashboard')
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
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      if (signInData.user) {
        setState((prev) => ({ ...prev, user: signInData.user, loading: false }))
        
        // Fetch user profile
        const profileData = await fetchProfile(signInData.user.id, {
          selected_roles: signInData.user.user_metadata?.selected_roles || ['buyer']
        })
        
        if (profileData) {
          setProfile(profileData)
        }
        
        toast.success("Signed in successfully")
        router.push('/dashboard')
      }
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
      // Temporary fix: Use current origin for redirect until Supabase URLs are updated
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : 'https://the-new-alkebulan.vercel.app/auth/callback'
        
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
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

  // Initialize auth state
  useEffect(() => {
    const getInitialSession = async () => {
      if (!isSupabaseConfigured() || !supabase) return
      
      try {
        // Check network connectivity first
        if (!navigator.onLine) {
          console.log('🌐 Network is offline, skipping session fetch')
          setState(prev => ({ ...prev, loading: false }))
          return
        }

        console.log('🔄 Getting initial session...')
        const { data: { session }, error } = await supabase!.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting initial session:', error)
          if (error.message.includes('Failed to fetch')) {
            console.log('🌐 Network error detected, will retry on reconnection')
          }
        } else if (session) {
          console.log('✅ Initial session found:', session.user.id)
          setState(prev => ({ ...prev, user: session.user, loading: false }))
          
          // Fetch user profile
          const profileData = await fetchProfile(session.user.id, {
            account_type: session.user.user_metadata?.account_type || 'buyer'
          })
          
          if (profileData) {
            setProfile(profileData)
          }
        } else {
          console.log('ℹ️ No initial session found')
          setState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error)
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          console.log('🌐 Network error in initial session fetch')
        }
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    // Add network event listeners
    const handleOnline = () => {
      console.log('🌐 Network is back online, retrying session fetch')
      getInitialSession()
    }

    const handleOffline = () => {
      console.log('🌐 Network is offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Get initial session
    getInitialSession()

    // Set up auth state change listener
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ User signed in:', session.user.id)
          setState(prev => ({ ...prev, user: session.user, loading: false }))
          
          // Fetch user profile
          const profileData = await fetchProfile(session.user.id, {
            account_type: session.user.user_metadata?.account_type || 'buyer'
          })
          
          if (profileData) {
            setProfile(profileData)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          setState(prev => ({ ...prev, user: null, loading: false }))
          setProfile(null)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Token refreshed for user:', session.user.id)
          setState(prev => ({ ...prev, user: session.user }))
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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
        forceRefreshProfile,
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

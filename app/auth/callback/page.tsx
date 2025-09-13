"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          toast.error("Authentication not configured.")
          router.push("/auth/signin")
          return
        }

        // Check if this is a password reset callback
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const type = urlParams.get('type')

        if (type === 'recovery' && accessToken && refreshToken) {
          // This is a password reset callback
          console.log('Password reset callback detected')
          
          // Set the session with the tokens from the URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error("Session error:", sessionError)
            toast.error("Invalid password reset link. Please request a new one.")
            router.push("/auth/signin")
            return
          }

          // Redirect to password reset form
          router.push("/auth/reset-password")
          return
        }

        // Handle normal auth callback
        const result = await supabase.auth.getSession()
        
        if (result.error) {
          console.error("Auth callback error:", result.error)
          toast.error("Authentication failed. Please try again.")
          router.push("/auth/signin")
          return
        }

        if (result.data.session) {
          toast.success("Successfully signed in!")
          router.push("/dashboard")
        } else {
          router.push("/auth/signin")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        toast.error("Authentication failed. Please try again.")
        router.push("/auth/signin")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Completing Sign In</CardTitle>
          <CardDescription className="text-center">
            Please wait while we complete your authentication...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  )
} 
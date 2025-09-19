"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  // Accept admin if profile flag is set, selected_roles includes admin, or JWT app_metadata.role is admin
  const isAdmin = (
    profile?.is_admin === true ||
    (Array.isArray(profile?.selected_roles) && profile.selected_roles.includes('admin')) ||
    (user as any)?.app_metadata?.role === 'admin'
  )

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/admin/login")
      } else if (!isAdmin) {
        router.push("/dashboard")
      }
    }
  }, [loading, user, isAdmin, router])

  if (loading || !user || !isAdmin) {
    return null
  }

  return <>{children}</>
}



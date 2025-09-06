"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  // Only true admins (profiles.is_admin) may access admin routes
  const isAdmin = profile?.is_admin === true

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



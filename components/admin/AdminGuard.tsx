"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  const isAdmin = Boolean(
    profile?.is_admin === true ||
    profile?.role === "admin" ||
    (Array.isArray(profile?.selected_roles) && profile.selected_roles.includes("admin"))
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



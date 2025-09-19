"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, Loader2, Shield } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const isAdminProfile = (p: any) => Boolean(
    p?.is_admin === true || p?.role === 'admin' || (Array.isArray(p?.selected_roles) && p.selected_roles.includes('admin'))
  )

  useEffect(() => {
    if (user && profile && isAdminProfile(profile)) {
      router.replace('/admin')
    }
  }, [user, profile, router])

  const validate = () => {
    const next: typeof errors = {}
    if (!form.email.trim()) next.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = "Enter a valid email"
    if (!form.password) next.password = "Password is required"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const signInAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("Authentication not configured.")
      return
    }
    setLoading(true)
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error
      if (!signInData.user) throw new Error('No user returned')

      // Accept admin if JWT app_metadata already has role=admin
      const tokenRole = (signInData.user as any)?.app_metadata?.role
      if (tokenRole === 'admin') {
        toast.success('Welcome, Admin')
        router.replace('/admin')
        return
      }

      // Otherwise, fetch profile to confirm admin via DB flags
      const { data: profByUser, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', signInData.user.id)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle()
      if (profErr) throw profErr

      if (!isAdminProfile(profByUser)) {
        toast.error('This account is not an admin')
        // Do NOT sign out automatically; allow users to continue as non-admin
        return
      }
      toast.success('Welcome, Admin')
      router.replace('/admin')
    } catch (err: any) {
      toast.error(err?.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>Sign in to the admin console</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={signInAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your admin email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In as Admin"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          This page is for administrators only.
          <Separator className="my-3" />
          <span>
            Not an admin? Use the regular sign in at{' '}
            <a href="/auth/signin" className="text-primary hover:underline">/auth/signin</a>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}



"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Building2, 
  Palette, 
  TrendingUp, 
  GraduationCap,
  Shield,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"

interface Role {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  badgeColor: string
}

const ROLES: Role[] = [
  {
    id: 'business',
    name: 'Business',
    description: 'Create and manage business profiles, access business tools, and connect with other entrepreneurs',
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-blue-500 hover:bg-blue-600',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'Share content, build your audience, and monetize your creative work',
    icon: <Palette className="w-6 h-6" />,
    color: 'bg-purple-500 hover:bg-purple-600',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'investor',
    name: 'Investor',
    description: 'Access investment opportunities, analyze projects, and manage your investment portfolio',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-green-500 hover:bg-green-600',
    badgeColor: 'bg-green-100 text-green-800'
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Share your expertise, guide others, and build meaningful mentoring relationships',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'bg-orange-500 hover:bg-orange-600',
    badgeColor: 'bg-orange-100 text-orange-800'
  }
]

export default function RoleManagementPage() {
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [roleStates, setRoleStates] = useState({
    business: false,
    creator: false,
    investor: false,
    mentor: false
  })

  useEffect(() => {
    if (user && profile) {
      loadRoleStates()
    }
  }, [user, profile])

  const loadRoleStates = () => {
    if (!profile) return

    setRoleStates({
      business: profile.business_enabled || false,
      creator: profile.creator_enabled || false,
      investor: profile.investor_enabled || false,
      mentor: profile.mentor_enabled || false
    })
    setLoading(false)
  }

  const handleRoleToggle = async (roleId: string, enabled: boolean) => {
    if (!user || !profile) return

    setSaving(true)
    
    try {
      const updateData: any = {
        [`${roleId}_enabled`]: enabled,
        updated_at: new Date().toISOString()
      }

      // If enabling a role, also update account_type to the new role
      if (enabled) {
        updateData.account_type = roleId
      } else {
        // If disabling current role, check if other roles are enabled
        const otherRoles = Object.keys(roleStates).filter(r => r !== roleId)
        const hasOtherRoles = otherRoles.some(r => roleStates[r as keyof typeof roleStates])
        
        if (!hasOtherRoles) {
          // If no other roles enabled, set to 'buyer' as default
          updateData.account_type = 'buyer'
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating role:', error)
        toast.error(`Failed to ${enabled ? 'enable' : 'disable'} ${roleId} role`)
        return
      }

      // Update local state
      setRoleStates(prev => ({ ...prev, [roleId]: enabled }))
      
      // Show success message
      const roleName = ROLES.find(r => r.id === roleId)?.name || roleId
      toast.success(`${roleName} role ${enabled ? 'enabled' : 'disabled'} successfully!`)
      
      // Refresh profile to sync with backend
      await refreshProfile()
      
    } catch (error) {
      console.error('Error:', error)
      toast.error(`Failed to ${enabled ? 'enable' : 'disable'} ${roleId} role`)
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.push("/profile")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to manage roles</h1>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const activeRolesCount = Object.values(roleStates).filter(Boolean).length

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Account Management</h1>
            <p className="text-muted-foreground">Activate and manage your account roles and permissions</p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-medium">How Roles Work</h3>
                <p className="text-sm text-muted-foreground">
                  Each role gives you access to different features and tools. You can activate multiple roles 
                  and switch between them as needed. At least one role must be active at all times.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Active roles: {activeRolesCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {ROLES.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${role.badgeColor}`}>
                      {role.icon}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {role.name}
                        {roleStates[role.id as keyof typeof roleStates] && (
                          <Badge variant="secondary" className={role.badgeColor}>
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={roleStates[role.id as keyof typeof roleStates]}
                      onCheckedChange={(enabled) => handleRoleToggle(role.id, enabled)}
                      disabled={saving}
                    />
                  </div>
                </div>
              </CardHeader>
              
              {roleStates[role.id as keyof typeof roleStates] && (
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>This role is currently active</span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Current Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Current Role Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ROLES.map((role) => (
                <div key={role.id} className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    roleStates[role.id as keyof typeof roleStates] 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {role.icon}
                  </div>
                  <p className="text-sm font-medium">{role.name}</p>
                  <Badge 
                    variant={roleStates[role.id as keyof typeof roleStates] ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {roleStates[role.id as keyof typeof roleStates] ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

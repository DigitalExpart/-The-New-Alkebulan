"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Building2, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { supabase, getSupabaseClient } from "@/lib/supabase"

type UserRole = 'buyer' | 'business'

interface RoleSwitcherProps {
  onRoleChange?: (role: UserRole) => void
  className?: string
}

export function RoleSwitcher({ onRoleChange, className = "" }: RoleSwitcherProps) {
  const { profile, refreshProfile, user } = useAuth()
  const [currentRole, setCurrentRole] = useState<UserRole>('buyer')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Set initial role based on profile - check both enabled status and account_type
    if (profile?.business_enabled && profile?.account_type === 'business') {
      setCurrentRole('business')
    } else if (profile?.buyer_enabled && profile?.account_type === 'buyer') {
      setCurrentRole('buyer')
    } else if (profile?.business_enabled) {
      // If business is enabled but no account_type set, default to business
      setCurrentRole('business')
    } else if (profile?.buyer_enabled) {
      // If buyer is enabled but no account_type set, default to buyer
      setCurrentRole('buyer')
    } else {
      // Default to buyer if no roles are enabled
      setCurrentRole('buyer')
    }
  }, [profile])

  const handleRoleSwitch = async (newRole: UserRole) => {
    if (newRole === currentRole) return
    
    // Check if the target role is actually enabled in Role Management
    if (newRole === 'business' && !profile?.business_enabled) {
      toast.error("Business mode is not enabled. Please activate it in Role Management first.")
      return
    }
    
    if (newRole === 'buyer' && !profile?.buyer_enabled) {
      toast.error("Buyer mode is not enabled. Please activate it in Role Management first.")
      return
    }
    
    setLoading(true)
    
    try {
      // Only update the account_type, don't change the enabled status
      if (user && profile) {
        console.log('🔄 Switching active role to:', newRole)
        
        const { error } = await getSupabaseClient()
          .from('profiles')
          .update({
            account_type: newRole, // Only change the active role, not the enabled status
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)

        if (error) {
          console.error('❌ Supabase update error:', error)
          throw error
        }
        
        console.log('✅ Active role updated successfully in Supabase')
        
        // Update local state immediately for better UX
        setCurrentRole(newRole)
        
        // Call the callback if provided
        if (onRoleChange) {
          console.log('🔄 Calling onRoleChange callback with:', newRole)
          onRoleChange(newRole)
        }
        
        // Show success message
        const roleName = newRole === 'buyer' ? 'Buyer' : 'Business'
        toast.success(`Switched to ${roleName} mode`)
        
        // Refresh profile to sync with backend and update dashboard
        console.log('🔄 Refreshing profile...')
        await refreshProfile()
        console.log('✅ Profile refresh completed')
        
      } else {
        throw new Error('User or profile not available')
      }
      
    } catch (error) {
      // Revert on error
      setCurrentRole(currentRole)
      toast.error("Failed to switch role. Please try again.")
      console.error('Role switch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: UserRole) => {
    return role === 'buyer' ? <ShoppingCart className="w-4 h-4" /> : <Building2 className="w-4 h-4" />
  }

  const getRoleColor = (role: UserRole) => {
    return role === 'buyer' 
      ? "bg-blue-500 hover:bg-blue-600" 
      : "bg-green-500 hover:bg-green-600"
  }

  const getRoleLabel = (role: UserRole) => {
    return role === 'buyer' ? 'Buyer Activities' : 'Business Activities'
  }

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Current Mode</h3>
        <Badge 
          variant="secondary" 
          className={`flex items-center gap-2 ${currentRole === 'business' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
        >
          {getRoleIcon(currentRole)}
          {currentRole === 'buyer' ? 'Buyer' : 'Business'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {profile?.buyer_enabled && (
          <Button
            variant={currentRole === 'buyer' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRoleSwitch('buyer')}
            disabled={loading}
            className={`h-20 flex flex-col gap-2 ${
              currentRole === 'buyer' 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'hover:bg-blue-50'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs">Buyer Activities</span>
          </Button>
        )}
        
        {profile?.business_enabled && (
          <Button
            variant={currentRole === 'business' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRoleSwitch('business')}
            disabled={loading}
            className={`h-20 flex flex-col gap-2 ${
              currentRole === 'business' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'hover:bg-green-50'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-xs">Business Activities</span>
          </Button>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        {!profile?.buyer_enabled && !profile?.business_enabled ? (
          <span>
            No modes are enabled. Go to{' '}
            <a href="/profile/role-management" className="text-primary hover:underline">
              Role Management
            </a>{' '}
            to activate your roles.
          </span>
        ) : profile?.buyer_enabled && profile?.business_enabled ? (
          'Click to switch between buyer and business modes'
        ) : (
          <span>
            Only one mode is enabled. Go to{' '}
            <a href="/profile/role-management" className="text-primary hover:underline">
              Role Management
            </a>{' '}
            to activate more roles.
          </span>
        )}
      </div>
    </div>
  )
}

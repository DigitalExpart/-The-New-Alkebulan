"use client"

import React, { useState } from "react"
import { Menu, X, Search, ChevronDown, Heart, Monitor, UserCheck, Shield, ShoppingCart, Building2, CheckCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartDropdown } from "@/components/commerce/cart-dropdown"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { UserAvatarFixed } from "@/components/user-avatar-fixed"
import { ThemeToggleDropdownItems } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onMenuToggle: () => void
  sidebarOpen: boolean
}

export function Header({ onMenuToggle, sidebarOpen }: HeaderProps) {
  const { user, profile, signOut } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const getDisplayName = () => {
    if (!user) return 'User'
    return (user as any)?.user_metadata?.full_name?.split(' ')[0] || 
           profile?.first_name || 
           user?.email?.split('@')[0] || 
           'User'
  }

  const isAdmin = Boolean(
    profile?.is_admin === true ||
    profile?.role === 'admin' ||
    (Array.isArray(profile?.selected_roles) && profile.selected_roles.includes('admin'))
  )

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
  }

  const handleAccountTypeSwitch = async (newRole: 'buyer' | 'business') => {
    if (!user || !profile) return
    
    try {
      // Check if the target role is actually enabled in Role Management
      if (newRole === 'business' && !profile?.business_enabled) {
        alert('Business mode is not enabled. Please activate it in Role Management first.')
        return
      }
      
      if (newRole === 'buyer' && !profile?.buyer_enabled) {
        alert('Buyer mode is not enabled. Please activate it in Role Management first.')
        return
      }
      
      // Only update account_type, don't change the enabled status
      const updateData = {
        account_type: newRole,
        updated_at: new Date().toISOString()
      }
      
      // Update the profile in Supabase
      const { error } = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (error) {
        console.error('Error updating account type:', error)
        alert(`Failed to switch to ${newRole} mode: ${error.message}`)
        return
      }
      
      alert(`Switched to ${newRole} mode successfully!`)
      
      // Navigate to appropriate dashboard based on role
      if (newRole === 'business') {
        window.location.href = '/business/dashboard'
      } else if (newRole === 'buyer') {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Error switching account type:', error)
      alert('An unexpected error occurred while switching account type.')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Menu button and Logo */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="hover:bg-accent"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </Button>
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">The New</h1>
                <h2 className="text-lg font-extrabold text-primary">Alkebulan</h2>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Search icon */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
            >
              <Search className="h-5 w-5 text-foreground" />
            </Button>
            
            {/* Cart */}
            <CartDropdown />
            
            {/* Notifications */}
            {user && <NotificationsDropdown />}

            {/* Profile / User Menu */}
            {user ? (
              <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200">
                    <UserAvatarFixed 
                      imageUrl={profile?.avatar_url}
                      size="sm"
                      fallbackName={getDisplayName()}
                    />
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>

                {/* Profile dropdown content */}
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Saved Items */}
                  <DropdownMenuItem asChild>
                    <a href="/wishlist" className="cursor-pointer flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>Saved Items</span>
                    </a>
                  </DropdownMenuItem>
                  
                  {/* Dashboard */}
                  <DropdownMenuItem asChild>
                    <a href="/dashboard" className="cursor-pointer flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span>Dashboard</span>
                    </a>
                  </DropdownMenuItem>
                  
                  {/* Profile */}
                  <DropdownMenuItem asChild>
                    <a href="/profile" className="cursor-pointer flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Profile</span>
                    </a>
                  </DropdownMenuItem>
                  
                  {/* Edit Profile */}
                  <DropdownMenuItem asChild>
                    <a href="/profile/edit" className="cursor-pointer flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </a>
                  </DropdownMenuItem>
                  
                  {/* Role Management */}
                  <DropdownMenuItem asChild>
                    <a href="/profile/role-management" className="cursor-pointer flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Role Management</span>
                    </a>
                  </DropdownMenuItem>
                  
                  {/* Admin Console */}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <a href="/admin" className="cursor-pointer flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Admin Console</span>
                      </a>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  {/* Account Roles Section */}
                  <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                    Account Roles
                  </DropdownMenuLabel>
                  
                  {/* Buyer Mode */}
                  <DropdownMenuItem 
                    className={`cursor-pointer flex items-center gap-2 ${profile?.account_type === 'buyer' ? 'text-primary font-medium' : ''}`}
                    onClick={() => handleAccountTypeSwitch('buyer')}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Buyer Mode</span>
                    {profile?.account_type === 'buyer' && <CheckCircle className="w-4 ml-auto text-primary" />}
                  </DropdownMenuItem>
                  
                  {/* Business Mode */}
                  <DropdownMenuItem 
                    className={`cursor-pointer flex items-center gap-2 ${profile?.account_type === 'business' ? 'text-primary font-medium' : ''}`}
                    onClick={() => handleAccountTypeSwitch('business')}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Business Mode</span>
                    {profile?.account_type === 'business' && <CheckCircle className="w-4 ml-auto text-primary" />}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Theme Settings */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span>Theme</span>
                      </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48">
                      <ThemeToggleDropdownItems />
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Sign Out */}
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/auth/signin">Sign In</a>
                </Button>
                <Button size="sm" asChild>
                  <a href="/auth/signup">Sign Up</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
"use client"

import React, { useState, useEffect } from "react"
import { Menu, X, Search, ChevronDown, Heart, Monitor, UserCheck, Shield, ShoppingCart, Building2, CheckCircle, LogOut, MessageCircle } from "lucide-react"
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
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
      }
      if (event.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen])

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
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Alkebulan Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-primary-foreground font-bold text-lg">A</span>';
                    }
                  }}
                />
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
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5 text-foreground" />
            </Button>
            
            {/* Message icon */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
              asChild
            >
              <a href="/messages">
                <MessageCircle className="h-5 w-5 text-foreground" />
              </a>
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

      {/* Search Popup Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div className="fixed left-1/2 top-[calc(300%+2rem)] transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg mx-4">
            <div className="bg-background border border-border rounded-lg shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
              {/* Search Input Bar - Always Visible */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-10 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Filters */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Search in:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Post Title & Content
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" className="rounded" />
                      Comments
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">All Posts</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>

              {/* Search Content */}
              {!searchQuery ? (
                <div className="text-center py-6">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-base font-semibold mb-1">Search for anything</h3>
                  <p className="text-muted-foreground mb-2 text-sm">Try searching for keywords in posts</p>
                  <p className="text-xs text-muted-foreground">
                    Tip: Quick-launch search with ⌘ + K (Mac) or Ctrl + K (Windows/Linux)
                  </p>
                </div>
              ) : (
                <div className="py-4">
                  <p className="text-center text-muted-foreground text-sm">
                    Search results for "{searchQuery}" will appear here...
                  </p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end mt-3">
                <Button variant="outline" size="sm" onClick={() => setIsSearchOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
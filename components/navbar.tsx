"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  ShoppingCart,
  Users,
  Briefcase,
  TrendingUp,
  Heart,
  Shield,
  Zap,
  Sprout,
  FolderOpen,
  BookOpen,
  UserCheck,
  BarChart3,
  Coins,
  Calendar,
  Target,
  Sparkles,
  Building2,
  Upload,
  Globe,
  UserPlus,
  MessageCircle,
  Monitor,
  MapPin,
  Ribbon,
  ClipboardList,
  Scale,
  Map,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { AnimatedSearch } from "@/components/animated-search"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isSupabaseConfigured } from "@/lib/supabase"

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Debug: Log authentication state
  useEffect(() => {
    console.log('Navbar - User state:', !!user, user?.id, user?.email, loading)
    console.log('Navbar - Supabase configured:', isSupabaseConfigured())
  }, [user, loading])

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // setIsLogoAnimating(true) // This state was removed, so this line is removed
    setTimeout(() => {
      // setIsLogoAnimating(false) // This state was removed, so this line is removed
      // Navigate to home after animation
      window.location.href = "/"
    }, 2500)
  }

  const handleSearch = (query: string) => {
    console.log("Searching for:", query)
    // Implement your search logic here
    // You could navigate to a search results page or trigger a search API call
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--navbar-bg))] text-[hsl(var(--navbar-text))] border-b border-[hsl(var(--border))] shadow-lg">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center h-14 gap-2 sm:gap-3">
          {/* Logo with Text - Fixed width to prevent shifting */}
          <div className="flex items-center flex-shrink-0 w-auto mr-2 sm:mr-3">
            <Link href="/" className="flex items-center space-x-2" onClick={handleLogoClick}>
              <div
                className="relative w-10 h-10 flex-shrink-0 transition-transform duration-200 ease-in-out cursor-pointer hover:scale-110"
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scherm_afbeelding_2025-07-20_om_19.00.08-removebg-preview-5SfpVg1sZpmH7Z60mo8coZyoqelzmF.png"
                  alt="The New Alkebulan Logo"
                  width={40}
                  height={40}
                  className="rounded-full object-contain"
                />
              </div>
              <div className="flex flex-col items-start justify-center text-left leading-tight">
                <span className="text-[10px] font-medium text-yellow-500 whitespace-nowrap">The New</span>
                <span className="text-sm font-bold text-yellow-500 whitespace-nowrap -mt-0.5">Alkebulan</span>
              </div>
            </Link>
            
            {/* Debug: Authentication Status Indicator */}
            {process.env.NODE_ENV === 'development' && (
              <div className="ml-2 text-xs text-gray-500">
                Auth: {isSupabaseConfigured() ? '✅' : '❌'} | 
                User: {user ? '✅' : '❌'} | 
                Loading: {loading ? '🔄' : '✅'}
              </div>
            )}
          </div>

          {/* Desktop Navigation - Left aligned with proper spacing */}
          <div className="hidden lg:flex items-center justify-start space-x-2 flex-1 min-w-0 ml-2 sm:ml-3 overflow-hidden max-w-6xl">
            {/* Growth */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-2 py-1.5 text-[9px] whitespace-nowrap"
                >
                  <Sprout className="w-3 h-3 mr-1" />
                  Growth
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/daily-planner" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Daily Planner
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/learning" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Progress
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/my-journey" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Journey
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/learning" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Learning Hub
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/learning/mentorship" className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Mentorship
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/my-manifesting" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    The Manifest Lab
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Community */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-2 py-1.5 text-[9px] whitespace-nowrap"
                >
                  <Users className="w-3 h-3 mr-1" />
                  Community
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/community" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Social Feed
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/community/my-friends" className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    My Friends
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/community/my-community" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    My Communities
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/community/my-alkebulan" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    My Alkebulan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/community/messenger" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Messenger
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/community/events" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Events
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Marketplace */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-2 py-1.5 text-[9px] whitespace-nowrap"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Marketplace
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/marketplace" className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Browse Products
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/marketplace/companies" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    All Companies
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/marketplace/upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Sell Product
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Business */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-2 py-1.5 text-[9px] whitespace-nowrap"
                >
                  <Briefcase className="w-3 h-3 mr-1" />
                  Business
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/funding" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Investing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/projects" className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Projects
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/business" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Business Hub
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/business/dashboard" className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/business/long-term-planning" className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Long-Term Planning
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/process-management" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Process Management
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Finance */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-2 py-1.5 text-[9px] whitespace-nowrap"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Finance
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/investments" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Investments
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/my-tokens" className="flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    My Tokens
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    My Finances
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Health */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-2 py-1.5 text-[9px] whitespace-nowrap"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Health
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/health" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Health Hub
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/health/stats" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Wellness Overview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/health/mental-health-support" className="flex items-center gap-2">
                    <Ribbon className="w-4 h-4" />
                    Mental Health Support
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Governance */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-2 py-1.5 text-[9px] whitespace-nowrap"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Governance
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/governance/about" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    About Governance
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/governance" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Proposals
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/governance/land-ownership" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Land Ownership
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/governance/justice" className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Justice
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/governance/regions-tribes" className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Regions & Tribes
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Join the Team */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-2 py-1.5 text-[9px] whitespace-nowrap"
            >
              <Link href="/join-the-team">
                <UserPlus className="w-3 h-3 mr-1" />
                Join the Team!
              </Link>
            </Button>
            
            {/* Spacer to prevent overlap with right side */}
            <div className="w-4"></div>
          </div>

          {/* Right Side Icons - Fixed positioning */}
          <div className="flex items-center space-x-2 flex-shrink-0 ml-auto min-w-0">
            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-[hsl(var(--navbar-text))] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {/* Join Alkebulan Button - Only show when not logged in */}
            {(!user || !user.id) && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-yellow-500 hover:bg-[hsl(var(--navbar-hover))] border border-yellow-500 rounded-full px-3 py-1 text-[9px] font-medium hidden lg:flex"
              >
                <Link href="/join-alkebulan">Join Alkebulan</Link>
              </Button>
            )}

            {/* Animated Search - Only show when logged in */}
            {!loading && user && user.id && (
              <AnimatedSearch
                onSearch={handleSearch}
                placeholder="Search..."
                className="hidden md:flex w-24 lg:w-32 xl:w-36 ml-2"
              />
            )}

            {/* Theme Toggle - Only show when logged in */}
            {!loading && user && user.id && <ThemeToggle />}

            {/* User Menu - Show when logged in */}
            {!loading && user && user.id ? (
              <>
                <NotificationsDropdown />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] p-1.5"
                >
                  <Zap className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] p-1"
                    >
                      <UserAvatar 
                        size="sm" 
                        imageUrl={profile?.avatar_url}
                        fallbackName={profile?.full_name || user.email?.split('@')[0] || 'User'} 
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {(user as any)?.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Monitor className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/edit">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Show login/signup buttons when not logged in */
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] text-[9px] px-1 py-1"
                >
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="bg-yellow-500 text-black hover:bg-yellow-600 text-[9px] px-1 py-1"
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] p-1.5"
              onClick={toggleMenu}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-[hsl(var(--border))]">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-[hsl(var(--navbar-bg))]">
              {/* Mobile Search - Only show when logged in */}
              {!loading && user && user.id && (
                <div className="mb-3 md:hidden">
                  <AnimatedSearch onSearch={handleSearch} placeholder="Search..." className="w-full" />
                </div>
              )}

              {/* User Section - Mobile */}
              {!loading && user ? (
                <div className="border-b border-[hsl(var(--border))] pb-2 mb-2">
                  <div className="px-3 py-2 text-[hsl(var(--navbar-text))] font-medium text-sm flex items-center">
                    <UserCheck className="w-4 h-4 mr-2" />
                    My Account
                  </div>
                  <div className="ml-6 space-y-1">
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Monitor className="w-4 h-4 inline mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserCheck className="w-4 h-4 inline mr-2" />
                      Profile
                    </Link>
                    <Link
                      href="/profile/edit"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Edit Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setIsOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                /* Show login/signup buttons when not logged in - Mobile */
                <div className="border-b border-[hsl(var(--border))] pb-2 mb-2">
                  <div className="space-y-2">
                    <Link
                      href="/auth/signin"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block px-3 py-2 bg-yellow-500 text-black hover:bg-yellow-600 rounded-md text-sm text-center font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}

              {/* Join Alkebulan Button Mobile */}
              <Link
                href="/join-alkebulan"
                className="block px-3 py-2 text-yellow-500 hover:bg-[hsl(var(--navbar-hover))] rounded-md border border-yellow-500 text-center font-medium mb-3"
                onClick={() => setIsOpen(false)}
              >
                Join Alkebulan
              </Link>

              {/* Mobile Menu Items - Only show when logged in */}
              {!loading && user && user.id && (
                <div className="space-y-1">
                {/* Growth Section */}
                <div className="border-b border-[hsl(var(--border))] pb-2 mb-2">
                  <div className="px-3 py-2 text-[hsl(var(--navbar-text))] font-medium text-sm flex items-center">
                    <Sprout className="w-4 h-4 mr-2" />
                    Growth
                  </div>
                  <div className="ml-6 space-y-1">
                    <Link
                      href="/dashboard/daily-planner"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Daily Planner
                    </Link>
                    <Link
                      href="/dashboard/learning"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4 inline mr-2" />
                      Progress
                    </Link>
                    <Link
                      href="/dashboard/my-journey"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Target className="w-4 h-4 inline mr-2" />
                      Journey
                    </Link>
                    <Link
                      href="/learning"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      Learning Hub
                    </Link>
                    <Link
                      href="/learning/mentorship"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserCheck className="w-4 h-4 inline mr-2" />
                      Mentorship
                    </Link>
                    <Link
                      href="/dashboard/my-manifesting"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      The Manifest Lab
                    </Link>
                  </div>
                </div>

                {/* Community Section */}
                <div className="border-b border-[hsl(var(--border))] pb-2 mb-2">
                  <div className="px-3 py-2 text-[hsl(var(--navbar-text))] font-medium text-sm flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Community
                  </div>
                  <div className="ml-6 space-y-1">
                    <Link
                      href="/community"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Users className="w-4 h-4 inline mr-2" />
                      Social Feed
                    </Link>
                    <Link
                      href="/community/my-friends"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserPlus className="w-4 h-4 inline mr-2" />
                      My Friends
                    </Link>
                    <Link
                      href="/community/my-community"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Building2 className="w-4 h-4 inline mr-2" />
                      My Communities
                    </Link>
                    <Link
                      href="/community/my-alkebulan"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Globe className="w-4 h-4 inline mr-2" />
                      My Alkebulan
                    </Link>
                    <Link
                      href="/community/events"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Events
                    </Link>
                  </div>
                </div>

                {/* Marketplace Section */}
                <div className="border-b border-[hsl(var(--border))] pb-2 mb-2">
                  <div className="px-3 py-2 text-[hsl(var(--navbar-text))] font-medium text-sm flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Marketplace
                  </div>
                  <div className="ml-6 space-y-1">
                    <Link
                      href="/marketplace"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4 inline mr-2" />
                      Browse Products
                    </Link>
                    <Link
                      href="/marketplace/companies"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Building2 className="w-4 h-4 inline mr-2" />
                      All Companies
                    </Link>
                    <Link
                      href="/marketplace/upload"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Sell Product
                    </Link>
                  </div>
                </div>

                {/* Business Section */}
                <div className="border-b border-[hsl(var(--border))] pb-2 mb-2">
                  <div className="px-3 py-2 text-[hsl(var(--navbar-text))] font-medium text-sm flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Business
                  </div>
                  <div className="ml-6 space-y-1">
                    <Link
                      href="/funding"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <TrendingUp className="w-4 h-4 inline mr-2" />
                      Investing
                    </Link>
                    <Link
                      href="/projects"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <FolderOpen className="w-4 h-4 inline mr-2" />
                      Projects
                    </Link>
                    <Link
                      href="/business"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Business Hub
                    </Link>
                    <Link
                      href="/business/dashboard"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Monitor className="w-4 h-4 inline mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      href="/business/long-term-planning"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <ClipboardList className="w-4 h-4 inline mr-2" />
                      Long-Term Planning
                    </Link>
                    <Link
                      href="/process-management"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Target className="w-4 h-4 inline mr-2" />
                      Process Management
                    </Link>
                  </div>
                </div>

                {/* Finance Section */}
                <div className="border-b border-[hsl(var(--border))] pb-2 mb-2">
                  <div className="px-3 py-2 text-[hsl(var(--navbar-text))] font-medium text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Finance
                  </div>
                  <div className="ml-6 space-y-1">
                    <Link
                      href="/dashboard/investments"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <TrendingUp className="w-4 h-4 inline mr-2" />
                      Investments
                    </Link>
                    <Link
                      href="/dashboard/my-tokens"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Coins className="w-4 h-4 inline mr-2" />
                      My Tokens
                    </Link>
                    <Link
                      href="/dashboard/finance"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4 inline mr-2" />
                      My Finances
                    </Link>
                  </div>
                </div>

                {/* Health Section */}
                <div className="border-b border-[hsl(var(--border))] pb-2 mb-2">
                  <div className="px-3 py-2 text-[hsl(var(--navbar-text))] font-medium text-sm flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Health
                  </div>
                  <div className="ml-6 space-y-1">
                    <Link
                      href="/health"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Heart className="w-4 h-4 inline mr-2" />
                      Health Hub
                    </Link>
                    <Link
                      href="/health/stats"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4 inline mr-2" />
                      Wellness Overview
                    </Link>
                    <Link
                      href="/health/mental-health-support"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Ribbon className="w-4 h-4 inline mr-2" />
                      Mental Health Support
                    </Link>
                  </div>
                </div>

                {/* Governance Section */}
                <div className="pb-2">
                  <div className="px-3 py-2 text-[hsl(var(--navbar-text))] font-medium text-sm flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Governance
                  </div>
                  <div className="ml-6 space-y-1">
                    <Link
                      href="/governance/about"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      About Governance
                    </Link>
                    <Link
                      href="/governance"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="w-4 h-4 inline mr-2" />
                      Proposals
                    </Link>
                    <Link
                      href="/governance/land-ownership"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Land Ownership
                    </Link>
                    <Link
                      href="/governance/justice"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Scale className="w-4 h-4 inline mr-2" />
                      Justice
                    </Link>
                    <Link
                      href="/governance/regions-tribes"
                      className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Map className="w-4 h-4 inline mr-2" />
                      Regions & Tribes
                    </Link>
                  </div>
                </div>

                {/* Join the Team Section */}
                <div className="pb-2">
                  <Link
                    href="/join-the-team"
                    className="block px-3 py-2 text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] rounded-md text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserPlus className="w-4 h-4 inline mr-2" />
                    Join the Team!
                  </Link>
                </div>
              </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

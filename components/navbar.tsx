"use client"

import type React from "react"

import { useState } from "react"
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

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLogoAnimating, setIsLogoAnimating] = useState(false)
  const pathname = usePathname()
  const { user, profile, signOut, loading } = useAuth()

  // Debug: Log user state
  console.log('Navbar - User state:', !!user, user?.email)

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLogoAnimating(true)
    setTimeout(() => {
      setIsLogoAnimating(false)
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
        <div className="flex items-center h-16 gap-2 sm:gap-4">
          {/* Logo with Text - Fixed width to prevent shifting */}
          <div className="flex items-center flex-shrink-0 w-auto mr-2 sm:mr-4">
            <Link href="/" className="flex items-center space-x-2" onClick={handleLogoClick}>
              <div
                className={`relative w-12 h-12 flex-shrink-0 transition-transform duration-200 ease-in-out cursor-pointer ${
                  isLogoAnimating ? "heartbeat-animation" : "hover:scale-110"
                }`}
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scherm_afbeelding_2025-07-20_om_19.00.08-removebg-preview-5SfpVg1sZpmH7Z60mo8coZyoqelzmF.png"
                  alt="The New Alkebulan Logo"
                  width={48}
                  height={48}
                  className="rounded-full object-contain"
                />
              </div>
              <div className="flex flex-col items-start justify-center text-left leading-tight">
                <span className="text-xs font-medium text-yellow-500 whitespace-nowrap">The New</span>
                <span className="text-base font-bold text-yellow-500 whitespace-nowrap -mt-0.5">Alkebulan</span>
              </div>
            </Link>
          </div>

                      {/* Desktop Navigation - Left aligned with proper spacing */}
          <div className="hidden lg:flex items-center justify-start space-x-0.5 flex-1 min-w-0 ml-1 sm:ml-2 overflow-hidden max-w-4xl">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-1 py-2 text-[10px] whitespace-nowrap"
                >
                  <Sprout className="w-3 h-3 mr-0.5" />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-1 py-2 text-[10px] whitespace-nowrap hidden lg:flex"
                >
                  <Users className="w-3 h-3 mr-0.5" />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-1 py-2 text-[10px] whitespace-nowrap hidden xl:flex"
                >
                  <ShoppingCart className="w-3 h-3 mr-0.5" />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-1 py-2 text-[10px] whitespace-nowrap hidden xl:flex"
                >
                  <Briefcase className="w-3 h-3 mr-0.5" />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-1 py-2 text-[10px] whitespace-nowrap hidden 2xl:flex"
                >
                  <TrendingUp className="w-3 h-3 mr-0.5" />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-1 py-2 text-[10px] whitespace-nowrap hidden xl:flex"
                >
                  <Heart className="w-3 h-3 mr-0.5" />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-1 py-2 text-[10px] whitespace-nowrap hidden xl:flex"
                >
                  <Shield className="w-3 h-3 mr-0.5" />
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

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] px-1 py-2 text-[10px] whitespace-nowrap hidden xl:flex"
            >
              <Link href="/join-the-team">
                <UserPlus className="w-3 h-3 mr-0.5" />
                Join the Team!
              </Link>
            </Button>
          </div>

          {/* Right Side Icons - Fixed positioning */}
          <div className="flex items-center space-x-1 flex-shrink-0 ml-auto min-w-0">
            {/* Join Alkebulan Button - Only show when not logged in */}
            {(!user || !user.id) && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-yellow-500 hover:bg-[hsl(var(--navbar-hover))] border border-yellow-500 rounded-full px-2 py-1 text-[10px] font-medium hidden xl:flex"
              >
                <Link href="/join-alkebulan">Join Alkebulan</Link>
              </Button>
            )}

            {/* Animated Search - Moved after Join Alkebulan */}
            <AnimatedSearch
              onSearch={handleSearch}
              placeholder="Search..."
              className="hidden md:flex w-28 lg:w-36"
            />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu - Show when logged in */}
            {user && user.id ? (
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
                  className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] text-[10px] px-1.5"
                >
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="bg-yellow-500 text-black hover:bg-yellow-600 text-[10px] px-1.5"
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
              {/* Mobile Search */}
              <div className="mb-3 md:hidden">
                <AnimatedSearch onSearch={handleSearch} placeholder="Search..." className="w-full" />
              </div>

              {/* User Section - Mobile */}
              {user ? (
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

              {/* Mobile Menu Items */}
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
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

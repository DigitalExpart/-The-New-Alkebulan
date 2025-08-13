"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, User, Loader2, Building2, TrendingUp, Users, PenTool } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { SignUpData } from "@/types/auth"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, signInWithProvider, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState<'signup-form' | 'choose-role'>('signup-form')
  const [selectedRoles, setSelectedRoles] = useState<('business' | 'investor' | 'mentor' | 'creator')[]>([])
  const [formData, setFormData] = useState<SignUpData>({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    first_name: "",
    last_name: "",
    username: "",
    country: "Nigeria",
    selected_roles: [],
  })
  const [errors, setErrors] = useState<Partial<SignUpData>>({})

  const handleRoleSelection = (role: 'business' | 'investor' | 'mentor' | 'creator') => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(prev => prev.filter(r => r !== role))
      setFormData(prev => ({ ...prev, selected_roles: prev.selected_roles.filter(r => r !== role) }))
    } else {
      setSelectedRoles(prev => [...prev, role])
      setFormData(prev => ({ ...prev, selected_roles: [...prev.selected_roles, role] }))
    }
  }

  const goBackToRoleSelection = () => {
    setStep('choose-role')
    setSelectedRoles([])
  }

  const createAccount = async () => {
    if (selectedRoles.length === 0) return

    // Update form data with selected roles
    const finalSignupData = {
      ...formData,
      selected_roles: selectedRoles
    }

    // Create the account
    await signUp(finalSignupData)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpData> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required"
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required"
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    // Country is optional - no validation needed

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Combine first and last name for full_name
    const signupData = {
      ...formData,
      full_name: `${formData.first_name} ${formData.last_name}`.trim()
    }

    // Store the form data and move to role selection
    setFormData(signupData)
    setStep('choose-role')
  }

  const handleInputChange = (field: keyof SignUpData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'github') => {
    // For social auth, we'll use the selected roles or default to business
    const roles: ('business' | 'investor' | 'mentor' | 'creator')[] = selectedRoles.length > 0 ? selectedRoles : ['business']
    setFormData(prev => ({ ...prev, selected_roles: roles }))
    await signInWithProvider(provider)
  }

  // Step 1: Signup Form
  if (step === 'signup-form') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="text-center">
              <CardTitle className="text-2xl font-bold">Join The New Alkebulan</CardTitle>
              <CardDescription className="text-center">
                Create your account to get started
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Login Options - Moved to top */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Sign up with</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" onClick={() => handleSocialAuth("google")} disabled={loading} className="flex-1">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" onClick={() => handleSocialAuth("facebook")} disabled={loading} className="flex-1">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
                <Button variant="outline" onClick={() => handleSocialAuth("github")} disabled={loading} className="flex-1">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="Enter your first name"
                      value={formData.first_name}
                      onChange={handleInputChange("first_name")}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Enter your last name"
                      value={formData.last_name}
                      onChange={handleInputChange("last_name")}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleInputChange("username")}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country (Optional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="country"
                    type="text"
                    placeholder="Enter your country"
                    value={formData.country}
                    onChange={handleInputChange("country")}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-center text-sm text-muted-foreground w-full">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
                  </CardFooter>
      </Card>
    </div>
  )

  // Step 2: Choose Role
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep('signup-form')}
              className="text-green-600 hover:text-green-700"
            >
              ← Back
            </Button>
            <div className="text-center flex-1">
              <CardTitle className="text-3xl font-bold">Choose Your Roles</CardTitle>
              <CardDescription className="text-lg">Select how you want to use our platform</CardDescription>
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
          
          {/* User Info Display */}
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Account:</strong> {formData.email}
            </p>
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Name:</strong> {formData.full_name}
            </p>
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Username:</strong> @{formData.username}
            </p>
            {formData.country && (
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Country:</strong> {formData.country}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Option */}
            <div 
              className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRoles.includes('business')
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                  : 'border-gray-200 hover:border-green-300 bg-white dark:bg-gray-800'
              }`}
              onClick={() => handleRoleSelection('business')}
            >
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Business</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    List products, manage inventory, and process orders
                  </p>
                </div>
                {selectedRoles.includes('business') && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Investor Option */}
            <div 
              className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRoles.includes('investor')
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                  : 'border-gray-200 hover:border-green-300 bg-white dark:bg-gray-800'
              }`}
              onClick={() => handleRoleSelection('investor')}
            >
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Investor</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Access investing dashboard and manage investments
                  </p>
                </div>
                {selectedRoles.includes('investor') && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Mentor Option */}
            <div 
              className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRoles.includes('mentor')
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                  : 'border-gray-200 hover:border-green-300 bg-white dark:bg-gray-800'
              }`}
              onClick={() => handleRoleSelection('mentor')}
            >
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Mentor</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Activate mentorship profile and guide others
                  </p>
                </div>
                {selectedRoles.includes('mentor') && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Creator Option */}
            <div 
              className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRoles.includes('creator')
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                  : 'border-gray-200 hover:border-green-300 bg-white dark:bg-gray-800'
              }`}
              onClick={() => handleRoleSelection('creator')}
            >
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <PenTool className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Creator</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Activate content upload & library tools
                  </p>
                </div>
                {selectedRoles.includes('creator') && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can choose as many roles as you want and activate additional ones later in your dashboard
            </p>
            {selectedRoles.length > 0 && (
              <Button 
                onClick={createAccount}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  `Create Account with ${selectedRoles.length} Role${selectedRoles.length !== 1 ? 's' : ''}`
                )}
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

  // Step 2: Choose Role
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goBackToRoleSelection}
              className="text-green-600 hover:text-green-700"
            >
              ← Back
            </Button>
            <div className="text-center flex-1">
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription className="text-center">
                Join with {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''}: {selectedRoles.join(', ')}
              </CardDescription>
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Social Login Options - Moved to top */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Sign up with</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handleSocialAuth("google")} disabled={loading} className="flex-1">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" onClick={() => handleSocialAuth("facebook")} disabled={loading} className="flex-1">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
              <Button variant="outline" onClick={() => handleSocialAuth("github")} disabled={loading} className="flex-1">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={handleInputChange("first_name")}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={handleInputChange("last_name")}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange("username")}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
            </div>

            {/* Country Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="country">Country (Optional)</Label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Select your country (optional)</option>
                <option value="Afghanistan">Afghanistan</option>
                <option value="Albania">Albania</option>
                <option value="Algeria">Algeria</option>
                <option value="Andorra">Andorra</option>
                <option value="Angola">Angola</option>
                <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                <option value="Argentina">Argentina</option>
                <option value="Armenia">Armenia</option>
                <option value="Australia">Australia</option>
                <option value="Austria">Austria</option>
                <option value="Azerbaijan">Azerbaijan</option>
                <option value="Bahamas">Bahamas</option>
                <option value="Bahrain">Bahrain</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Barbados">Barbados</option>
                <option value="Belarus">Belarus</option>
                <option value="Belgium">Belgium</option>
                <option value="Belize">Belize</option>
                <option value="Benin">Benin</option>
                <option value="Bhutan">Bhutan</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                <option value="Botswana">Botswana</option>
                <option value="Brazil">Brazil</option>
                <option value="Brunei">Brunei</option>
                <option value="Bulgaria">Bulgaria</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Burundi">Burundi</option>
                <option value="Cabo Verde">Cabo Verde</option>
                <option value="Cambodia">Cambodia</option>
                <option value="Cameroon">Cameroon</option>
                <option value="Canada">Canada</option>
                <option value="Central African Republic">Central African Republic</option>
                <option value="Chad">Chad</option>
                <option value="Chile">Chile</option>
                <option value="China">China</option>
                <option value="Colombia">Colombia</option>
                <option value="Comoros">Comoros</option>
                <option value="Congo">Congo</option>
                <option value="Costa Rica">Costa Rica</option>
                <option value="Croatia">Croatia</option>
                <option value="Cuba">Cuba</option>
                <option value="Cyprus">Cyprus</option>
                <option value="Czech Republic">Czech Republic</option>
                <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                <option value="Denmark">Denmark</option>
                <option value="Djibouti">Djibouti</option>
                <option value="Dominica">Dominica</option>
                <option value="Dominican Republic">Dominican Republic</option>
                <option value="East Timor">East Timor</option>
                <option value="Ecuador">Ecuador</option>
                <option value="Egypt">Egypt</option>
                <option value="El Salvador">El Salvador</option>
                <option value="Equatorial Guinea">Equatorial Guinea</option>
                <option value="Eritrea">Eritrea</option>
                <option value="Estonia">Estonia</option>
                <option value="Eswatini">Eswatini</option>
                <option value="Ethiopia">Ethiopia</option>
                <option value="Fiji">Fiji</option>
                <option value="Finland">Finland</option>
                <option value="France">France</option>
                <option value="Gabon">Gabon</option>
                <option value="Gambia">Gambia</option>
                <option value="Georgia">Georgia</option>
                <option value="Germany">Germany</option>
                <option value="Ghana">Ghana</option>
                <option value="Greece">Greece</option>
                <option value="Grenada">Grenada</option>
                <option value="Guatemala">Guatemala</option>
                <option value="Guinea">Guinea</option>
                <option value="Guinea-Bissau">Guinea-Bissau</option>
                <option value="Guyana">Guyana</option>
                <option value="Haiti">Haiti</option>
                <option value="Honduras">Honduras</option>
                <option value="Hungary">Hungary</option>
                <option value="Iceland">Iceland</option>
                <option value="India">India</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Iran">Iran</option>
                <option value="Iraq">Iraq</option>
                <option value="Ireland">Ireland</option>
                <option value="Israel">Israel</option>
                <option value="Italy">Italy</option>
                <option value="Ivory Coast">Ivory Coast</option>
                <option value="Jamaica">Jamaica</option>
                <option value="Japan">Japan</option>
                <option value="Jordan">Jordan</option>
                <option value="Kazakhstan">Kazakhstan</option>
                <option value="Kenya">Kenya</option>
                <option value="Kiribati">Kiribati</option>
                <option value="Kuwait">Kuwait</option>
                <option value="Kyrgyzstan">Kyrgyzstan</option>
                <option value="Laos">Laos</option>
                <option value="Latvia">Latvia</option>
                <option value="Lebanon">Lebanon</option>
                <option value="Lesotho">Lesotho</option>
                <option value="Liberia">Liberia</option>
                <option value="Libya">Libya</option>
                <option value="Liechtenstein">Liechtenstein</option>
                <option value="Lithuania">Lithuania</option>
                <option value="Luxembourg">Luxembourg</option>
                <option value="Madagascar">Madagascar</option>
                <option value="Malawi">Malawi</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Maldives">Maldives</option>
                <option value="Mali">Mali</option>
                <option value="Malta">Malta</option>
                <option value="Marshall Islands">Marshall Islands</option>
                <option value="Mauritania">Mauritania</option>
                <option value="Mauritius">Mauritius</option>
                <option value="Mexico">Mexico</option>
                <option value="Micronesia">Micronesia</option>
                <option value="Moldova">Moldova</option>
                <option value="Monaco">Monaco</option>
                <option value="Mongolia">Mongolia</option>
                <option value="Montenegro">Montenegro</option>
                <option value="Morocco">Morocco</option>
                <option value="Mozambique">Mozambique</option>
                <option value="Myanmar">Myanmar</option>
                <option value="Namibia">Namibia</option>
                <option value="Nauru">Nauru</option>
                <option value="Nepal">Nepal</option>
                <option value="Netherlands">Netherlands</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Nicaragua">Nicaragua</option>
                <option value="Niger">Niger</option>
                <option value="Nigeria">Nigeria</option>
                <option value="North Korea">North Korea</option>
                <option value="North Macedonia">North Macedonia</option>
                <option value="Norway">Norway</option>
                <option value="Oman">Oman</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Palau">Palau</option>
                <option value="Palestine">Palestine</option>
                <option value="Panama">Panama</option>
                <option value="Papua New Guinea">Papua New Guinea</option>
                <option value="Paraguay">Paraguay</option>
                <option value="Peru">Peru</option>
                <option value="Philippines">Philippines</option>
                <option value="Poland">Poland</option>
                <option value="Portugal">Portugal</option>
                <option value="Qatar">Qatar</option>
                <option value="Romania">Romania</option>
                <option value="Russia">Russia</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                <option value="Saint Lucia">Saint Lucia</option>
                <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                <option value="Samoa">Samoa</option>
                <option value="San Marino">San Marino</option>
                <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Senegal">Senegal</option>
                <option value="Serbia">Serbia</option>
                <option value="Seychelles">Seychelles</option>
                <option value="Sierra Leone">Sierra Leone</option>
                <option value="Singapore">Singapore</option>
                <option value="Slovakia">Slovakia</option>
                <option value="Slovenia">Slovenia</option>
                <option value="Solomon Islands">Solomon Islands</option>
                <option value="Somalia">Somalia</option>
                <option value="South Africa">South Africa</option>
                <option value="South Korea">South Korea</option>
                <option value="South Sudan">South Sudan</option>
                <option value="Spain">Spain</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="Sudan">Sudan</option>
                <option value="Suriname">Suriname</option>
                <option value="Sweden">Sweden</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Syria">Syria</option>
                <option value="Taiwan">Taiwan</option>
                <option value="Tajikistan">Tajikistan</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Thailand">Thailand</option>
                <option value="Togo">Togo</option>
                <option value="Tonga">Tonga</option>
                <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                <option value="Tunisia">Tunisia</option>
                <option value="Turkey">Turkey</option>
                <option value="Turkmenistan">Turkmenistan</option>
                <option value="Tuvalu">Tuvalu</option>
                <option value="Uganda">Uganda</option>
                <option value="Ukraine">Ukraine</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Uruguay">Uruguay</option>
                <option value="Uzbekistan">Uzbekistan</option>
                <option value="Vanuatu">Vanuatu</option>
                <option value="Vatican City">Vatican City</option>
                <option value="Venezuela">Venezuela</option>
                <option value="Vietnam">Vietnam</option>
                <option value="Yemen">Yemen</option>
                <option value="Zambia">Zambia</option>
                <option value="Zimbabwe">Zimbabwe</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (8 or more characters)"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Selected Roles Display (Read-only) */}
            <div className="space-y-2">
              <Label>Selected Roles</Label>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {selectedRoles.length} Role{selectedRoles.length !== 1 ? 's' : ''} Selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoles.map((role) => (
                      <span key={role} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    You can activate additional roles later in your dashboard. You can choose as many as you want!
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                `Create Account with ${selectedRoles.length} Role${selectedRoles.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

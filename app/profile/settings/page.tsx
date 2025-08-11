"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Lock, 
  Shield, 
  Bell, 
  Mail, 
  Smartphone, 
  Eye, 
  EyeOff, 
  EyeIcon,
  Users,
  Globe,
  Smartphone as PhoneIcon,
  Key,
  Settings,
  CheckCircle,
  AlertCircle,
  Chrome,
  MessageCircle,
  Smartphone as PhoneIcon2
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { user, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Two-factor authentication state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)

  // SSO integrations state
  const [ssoIntegrations, setSsoIntegrations] = useState({
    google: false,
    facebook: false,
    apple: false
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    communityUpdates: true,
    businessOpportunities: false
  })

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public", // public, friends, private
    showOnlineStatus: true,
    showLastSeen: true,
    allowFriendRequests: true,
    allowMessages: true,
    showEmail: false,
    showPhone: false
  })

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    if (!user || !supabase) return

    try {
      // Fetch user settings from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching settings:', error)
      } else {
        // Set privacy settings from profile data
        if (data.privacy_settings) {
          setPrivacySettings(data.privacy_settings)
        }
        
        // Set notification settings from profile data
        if (data.notification_settings) {
          setNotificationSettings(data.notification_settings)
        }

        // Set SSO integrations from profile data
        if (data.sso_integrations) {
          setSsoIntegrations(data.sso_integrations)
        }

        // Set 2FA status from profile data
        if (data.two_factor_enabled !== undefined) {
          setTwoFactorEnabled(data.two_factor_enabled)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) {
        toast.error('Failed to change password: ' + error.message)
      } else {
        toast.success('Password changed successfully!')
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleTwoFactorToggle = async () => {
    setTwoFactorLoading(true)

    try {
      if (twoFactorEnabled) {
        // Disable 2FA
        const { error } = await supabase.auth.admin.updateUserById(user!.id, {
          user_metadata: { two_factor_enabled: false }
        })

        if (error) {
          toast.error('Failed to disable 2FA: ' + error.message)
        } else {
          setTwoFactorEnabled(false)
          toast.success('Two-factor authentication disabled')
        }
      } else {
        // Enable 2FA - this would typically involve a more complex flow
        // For now, we'll just show a message
        toast.info('Two-factor authentication setup requires additional configuration')
        setTwoFactorLoading(false)
        return
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update 2FA settings')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleSSOIntegration = async (provider: string, enabled: boolean) => {
    try {
      if (enabled) {
        // Connect SSO provider
        let authProvider: any
        switch (provider) {
          case 'google':
            authProvider = supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`
              }
            })
            break
          case 'facebook':
            authProvider = supabase.auth.signInWithOAuth({
              provider: 'facebook',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`
              }
            })
            break
          case 'apple':
            authProvider = supabase.auth.signInWithOAuth({
              provider: 'apple',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`
              }
            })
            break
        }

        if (authProvider) {
          toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} integration enabled`)
        }
      } else {
        // Disconnect SSO provider
        setSsoIntegrations(prev => ({ ...prev, [provider]: false }))
        toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} integration disabled`)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(`Failed to ${enabled ? 'enable' : 'disable'} ${provider} integration`)
    }
  }

  const handleNotificationToggle = async (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }))
    
    try {
      // Save notification settings to database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          notification_settings: { ...notificationSettings, [setting]: value },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user!.id)

      if (error) {
        console.error('Error saving notification settings:', error)
        toast.error('Failed to save notification settings')
      } else {
        toast.success('Notification settings updated')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save notification settings')
    }
  }

  const handlePrivacyToggle = async (setting: string, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }))
    
    try {
      // Save privacy settings to database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          privacy_settings: { ...privacySettings, [setting]: value },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user!.id)

      if (error) {
        console.error('Error saving privacy settings:', error)
        toast.error('Failed to save privacy settings')
      } else {
        toast.success('Privacy settings updated')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save privacy settings')
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
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access settings</h1>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

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
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account security, notifications, and privacy</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  {saving ? 'Changing Password...' : 'Change Password'}
                </Button>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Two-Factor Authentication (2FA)
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={handleTwoFactorToggle}
                      disabled={twoFactorLoading}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* SSO Integrations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Single Sign-On (SSO) Integrations
                </h3>
                <div className="space-y-3">
                                     <div className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-3">
                       <Chrome className="w-5 h-5 text-red-600" />
                       <div>
                         <p className="font-medium">Google</p>
                         <p className="text-sm text-muted-foreground">Sign in with Google account</p>
                       </div>
                     </div>
                     <Switch
                       checked={ssoIntegrations.google}
                       onCheckedChange={(enabled) => handleSSOIntegration('google', enabled)}
                     />
                   </div>
                   <div className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-3">
                       <MessageCircle className="w-5 h-5 text-blue-600" />
                       <div>
                         <p className="font-medium">Facebook</p>
                         <p className="text-sm text-muted-foreground">Sign in with Facebook account</p>
                       </div>
                     </div>
                     <Switch
                       checked={ssoIntegrations.facebook}
                       onCheckedChange={(enabled) => handleSSOIntegration('facebook', enabled)}
                     />
                   </div>
                   <div className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-3">
                       <PhoneIcon2 className="w-5 h-5 text-gray-800" />
                       <div>
                         <p className="font-medium">Apple</p>
                         <p className="text-sm text-muted-foreground">Sign in with Apple ID</p>
                       </div>
                     </div>
                     <Switch
                       checked={ssoIntegrations.apple}
                       onCheckedChange={(enabled) => handleSSOIntegration('apple', enabled)}
                     />
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(enabled) => handleNotificationToggle('emailNotifications', enabled)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive push notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(enabled) => handleNotificationToggle('pushNotifications', enabled)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">Receive promotional content</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(enabled) => handleNotificationToggle('marketingEmails', enabled)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">Important security notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.securityAlerts}
                    onCheckedChange={(enabled) => handleNotificationToggle('securityAlerts', enabled)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Community Updates</p>
                      <p className="text-sm text-muted-foreground">News and updates from the community</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.communityUpdates}
                    onCheckedChange={(enabled) => handleNotificationToggle('communityUpdates', enabled)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Business Opportunities</p>
                      <p className="text-sm text-muted-foreground">Business and investment opportunities</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.businessOpportunities}
                    onCheckedChange={(enabled) => handleNotificationToggle('businessOpportunities', enabled)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EyeIcon className="w-5 h-5 text-purple-600" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">Who can see your profile?</p>
                  </div>
                  <Select
                    value={privacySettings.profileVisibility}
                    onValueChange={(value) => handlePrivacyToggle('profileVisibility', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Friends Only
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <EyeOff className="w-4 h-4" />
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Show Online Status</p>
                        <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(enabled) => handlePrivacyToggle('showOnlineStatus', enabled)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <EyeIcon className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Show Last Seen</p>
                        <p className="text-sm text-muted-foreground">Show when you were last active</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.showLastSeen}
                      onCheckedChange={(enabled) => handlePrivacyToggle('showLastSeen', enabled)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Allow Friend Requests</p>
                        <p className="text-sm text-muted-foreground">Let others send you friend requests</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.allowFriendRequests}
                      onCheckedChange={(enabled) => handlePrivacyToggle('allowFriendRequests', enabled)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Allow Messages</p>
                        <p className="text-sm text-muted-foreground">Let others send you messages</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(enabled) => handlePrivacyToggle('allowMessages', enabled)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Show Email Address</p>
                        <p className="text-sm text-muted-foreground">Display your email on your profile</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.showEmail}
                      onCheckedChange={(enabled) => handlePrivacyToggle('showEmail', enabled)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Show Phone Number</p>
                        <p className="text-sm text-muted-foreground">Display your phone on your profile</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.showPhone}
                      onCheckedChange={(enabled) => handlePrivacyToggle('showPhone', enabled)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

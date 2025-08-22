"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageSquare, Heart, UserPlus, AtSign, Settings, Save, RotateCcw } from "lucide-react"

interface NotificationSettings {
  id: string
  user_id: string
  friend_requests: boolean
  messages: boolean
  comments: boolean
  likes: boolean
  mentions: boolean
  follows: boolean
  system_updates: boolean
  marketing: boolean
  email_notifications: boolean
  push_notifications: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  created_at: string
  updated_at: string
}

export default function NotificationSettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Default settings
  const defaultSettings: Omit<NotificationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
    friend_requests: true,
    messages: true,
    comments: true,
    likes: true,
    mentions: true,
    follows: true,
    system_updates: true,
    marketing: false,
    email_notifications: true,
    push_notifications: true,
    quiet_hours_enabled: false,
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00"
  }

  useEffect(() => {
    if (user?.id) {
      fetchNotificationSettings()
    }
  }, [user?.id])

  const fetchNotificationSettings = async () => {
    if (!user?.id) return

    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching notification settings:', error)
        toast.error('Failed to fetch notification settings')
        return
      }

      if (data) {
        setSettings(data)
      } else {
        // Create default settings if none exist
        await createDefaultSettings()
      }
    } catch (err) {
      console.error('Error in fetchNotificationSettings:', err)
      toast.error('Failed to fetch notification settings')
    } finally {
      setLoading(false)
    }
  }

  const createDefaultSettings = async () => {
    if (!user?.id) return

    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('notification_settings')
        .insert({
          user_id: user.id,
          ...defaultSettings
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating default settings:', error)
        toast.error('Failed to create default settings')
        return
      }

      setSettings(data)
    } catch (err) {
      console.error('Error in createDefaultSettings:', err)
      toast.error('Failed to create default settings')
    }
  }

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    if (!settings) return

    setSettings(prev => {
      if (!prev) return prev
      return { ...prev, [key]: value }
    })
    setHasChanges(true)
  }

  const saveSettings = async () => {
    if (!settings || !user?.id) return

    setSaving(true)
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('notification_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error saving notification settings:', error)
        toast.error('Failed to save settings')
        return
      }

      toast.success('Notification settings saved successfully')
      setHasChanges(false)
    } catch (err) {
      console.error('Error in saveSettings:', err)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('notification_settings')
        .update({
          ...defaultSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error resetting settings:', error)
        toast.error('Failed to reset settings')
        return
      }

      setSettings(prev => prev ? { ...prev, ...defaultSettings } : null)
      setHasChanges(false)
      toast.success('Settings reset to defaults')
    } catch (err) {
      console.error('Error in resetToDefaults:', err)
      toast.error('Failed to reset settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load notification settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize how and when you receive notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Types
            </CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Friend Requests</p>
                    <p className="text-sm text-muted-foreground">When someone sends you a friend request</p>
                  </div>
                </div>
                <Switch
                  checked={settings.friend_requests}
                  onCheckedChange={(checked) => handleSettingChange('friend_requests', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Messages</p>
                    <p className="text-sm text-muted-foreground">When you receive new messages</p>
                  </div>
                </div>
                <Switch
                  checked={settings.messages}
                  onCheckedChange={(checked) => handleSettingChange('messages', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Likes & Reactions</p>
                    <p className="text-sm text-muted-foreground">When someone likes your content</p>
                  </div>
                </div>
                <Switch
                  checked={settings.likes}
                  onCheckedChange={(checked) => handleSettingChange('likes', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AtSign className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Mentions</p>
                    <p className="text-sm text-muted-foreground">When someone mentions you</p>
                  </div>
                </div>
                <Switch
                  checked={settings.mentions}
                  onCheckedChange={(checked) => handleSettingChange('mentions', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Delivery Methods
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">In-App Notifications</p>
                <p className="text-sm text-muted-foreground">Show notifications within the app</p>
              </div>
              <Badge variant="secondary">Always On</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send notifications to your email</p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Show notifications on your device</p>
              </div>
              <Switch
                checked={settings.push_notifications}
                onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Quiet Hours</CardTitle>
            <CardDescription>
              Set times when you don't want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Enable Quiet Hours</span>
              <Switch
                checked={settings.quiet_hours_enabled}
                onCheckedChange={(checked) => handleSettingChange('quiet_hours_enabled', checked)}
              />
            </div>

            {settings.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <input
                    type="time"
                    value={settings.quiet_hours_start}
                    onChange={(e) => handleSettingChange('quiet_hours_start', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <input
                    type="time"
                    value={settings.quiet_hours_end}
                    onChange={(e) => handleSettingChange('quiet_hours_end', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

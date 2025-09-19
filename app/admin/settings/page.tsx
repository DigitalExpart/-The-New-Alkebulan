"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Palette, 
  DollarSign,
  Bell,
  Database,
  Lock,
  AlertCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface PlatformSetting {
  id: string
  setting_key: string
  setting_value: any
  setting_type: string
  category: string
  description: string
  is_public: boolean
  requires_restart: boolean
}

interface AdminNotification {
  id: string
  notification_type: string
  title: string
  message: string
  priority: string
  status: string
  created_at: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([])
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedTab, setSelectedTab] = useState("features")

  const fetchSettings = async () => {
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('platform_settings')
        .select('*')
        .order('category', { ascending: true })

      if (settingsError) {
        console.error('Error fetching settings:', settingsError)
        toast.error('Failed to load settings')
        return
      }

      setSettings(settingsData || [])
    } catch (error) {
      console.error('Error in fetchSettings:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('status', 'unread')
        .order('created_at', { ascending: false })
        .limit(20)

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError)
        return
      }

      setNotifications(notificationsData || [])
    } catch (error) {
      console.error('Error in fetchNotifications:', error)
    }
  }

  const updateSetting = async (settingKey: string, newValue: any) => {
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('platform_settings')
        .update({ 
          setting_value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', settingKey)

      if (error) {
        console.error('Error updating setting:', error)
        toast.error('Failed to update setting')
        return
      }

      // Update local state
      setSettings(prev => prev.map(setting => 
        setting.setting_key === settingKey 
          ? { ...setting, setting_value: newValue }
          : setting
      ))

      toast.success('Setting updated successfully')
    } catch (error) {
      console.error('Error in updateSetting:', error)
      toast.error('Failed to update setting')
    } finally {
      setSaving(false)
    }
  }

  const renderSettingInput = (setting: PlatformSetting) => {
    const value = setting.setting_value

    switch (setting.setting_type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value === true || value === 'true'}
              onCheckedChange={(checked) => updateSetting(setting.setting_key, checked)}
              disabled={saving}
            />
            <Label>{value ? 'Enabled' : 'Disabled'}</Label>
          </div>
        )
      
      case 'string':
        return (
          <Input
            value={typeof value === 'string' ? value.replace(/"/g, '') : String(value)}
            onBlur={(e) => updateSetting(setting.setting_key, e.target.value)}
            placeholder={setting.description}
            disabled={saving}
          />
        )
      
      case 'number':
        return (
          <Input
            type="number"
            value={typeof value === 'string' ? value.replace(/"/g, '') : String(value)}
            onBlur={(e) => updateSetting(setting.setting_key, parseInt(e.target.value))}
            placeholder={setting.description}
            disabled={saving}
          />
        )
      
      default:
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value)}
            onBlur={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                updateSetting(setting.setting_key, parsed)
              } catch {
                updateSetting(setting.setting_key, e.target.value)
              }
            }}
            placeholder={setting.description}
            disabled={saving}
          />
        )
    }
  }

  const markNotificationRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      toast.success('Notification marked as read')
    } catch (error) {
      console.error('Error in markNotificationRead:', error)
    }
  }

  useEffect(() => {
    fetchSettings()
    fetchNotifications()
    setLoading(false)
  }, [])

  const settingsByCategory = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, PlatformSetting[]>)

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Platform Settings</h1>
                <p className="text-muted-foreground">Configure platform features and behavior</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { fetchSettings(); fetchNotifications(); }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="commerce">Commerce</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="ui">Interface</TabsTrigger>
              <TabsTrigger value="notifications">Notifications ({notifications.length})</TabsTrigger>
            </TabsList>

            {Object.entries(settingsByCategory).map(([category, categorySettings]) => (
              <TabsContent key={category} value={category} className="space-y-6">
          <Card>
            <CardHeader>
                    <CardTitle className="capitalize flex items-center gap-2">
                      {category === 'features' && <Database className="w-5 h-5" />}
                      {category === 'commerce' && <DollarSign className="w-5 h-5" />}
                      {category === 'security' && <Shield className="w-5 h-5" />}
                      {category === 'ui' && <Palette className="w-5 h-5" />}
                      {category} Settings
                    </CardTitle>
            </CardHeader>
                  <CardContent className="space-y-6">
                    {categorySettings.map(setting => (
                      <div key={setting.id} className="space-y-2 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">
                              {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                            <p className="text-xs text-muted-foreground">{setting.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {setting.is_public && <Badge variant="outline">Public</Badge>}
                            {setting.requires_restart && <Badge variant="destructive">Restart Required</Badge>}
                          </div>
                        </div>
                        {renderSettingInput(setting)}
                </div>
              ))}
                    {categorySettings.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No {category} settings configured
                      </div>
                    )}
            </CardContent>
          </Card>
              </TabsContent>
            ))}

            <TabsContent value="notifications" className="space-y-6">
              <Card>
            <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Admin Notifications
                  </CardTitle>
            </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map(notification => (
                      <div key={notification.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={notification.priority === 'urgent' ? 'destructive' : notification.priority === 'high' ? 'default' : 'secondary'}>
                              {notification.priority}
                            </Badge>
                            <Badge variant="outline">{notification.notification_type}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <h4 className="font-medium mb-1">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => markNotificationRead(notification.id)}>
                            Mark Read
                          </Button>
                          <Button size="sm" variant="outline">
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        No unread notifications
                      </div>
                    )}
              </div>
            </CardContent>
          </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  )
}

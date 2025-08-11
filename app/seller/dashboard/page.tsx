"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Store, 
  Settings, 
  Upload, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  DollarSign,
  Image as ImageIcon,
  Plus,
  Edit,
  Save,
  X,
  Crown
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSellerSettings } from "@/hooks/use-seller-settings"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"

export default function SellerDashboard() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { settings, loading: settingsLoading, updateStoreInfo } = useSellerSettings()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user && profile) {
      if (profile.account_type !== 'seller') {
        router.push('/dashboard')
        return
      }
      setLoading(false)
    }
  }, [user, profile, router])

  const handleImageUpload = async (file: File, type: 'banner' | 'logo') => {
    if (!user || !supabase) return

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${type}-${Date.now()}.${fileExt}`
      const filePath = `seller-assets/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      // Update store info with new image URL
      const currentSettings = settings || {}
      const updateData = {
        store_name: currentSettings.store_name || '',
        store_description: currentSettings.store_description || '',
        store_banner_url: type === 'banner' ? publicUrl : (currentSettings.store_banner_url || ''),
        store_logo_url: type === 'logo' ? publicUrl : (currentSettings.store_logo_url || '')
      }

      const success = await updateStoreInfo(updateData)
      if (success) {
        toast.success(`${type === 'banner' ? 'Banner' : 'Logo'} uploaded successfully!`)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(`Failed to upload ${type}`)
    } finally {
      setUploading(false)
    }
  }

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading seller dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || profile?.account_type !== 'seller') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">This dashboard is only available for seller accounts.</p>
          <Button asChild>
            <Link href="/dashboard">Go to Main Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Seller Badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground">Manage your store, products, and sales</p>
            </div>
            <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-4 py-2 text-sm font-semibold">
              <Crown className="w-4 h-4 mr-2" />
              SELLER
            </Badge>
          </div>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Main Dashboard
          </Button>
        </div>

        {/* Store Banner Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Store Banner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {settings?.store_banner_url ? (
                <div className="relative">
                  <img 
                    src={settings.store_banner_url} 
                    alt="Store Banner" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Change Banner'}
                  </Button>
                </div>
              ) : (
                <div className="w-full h-48 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No store banner uploaded</p>
                    <Button
                      size="sm"
                      onClick={() => document.getElementById('banner-upload')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload Banner'}
                    </Button>
                  </div>
                </div>
              )}
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, 'banner')
                }}
              />
              <p className="text-xs text-muted-foreground">
                Recommended size: 1200x300px. Supports JPG, PNG, GIF up to 5MB.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Store Logo Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-600" />
              Store Logo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-6">
                {settings?.store_logo_url ? (
                  <div className="relative">
                    <img 
                      src={settings.store_logo_url} 
                      alt="Store Logo" 
                      className="w-32 h-32 object-cover rounded-lg border-2 border-muted"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -top-2 -right-2 bg-white hover:bg-white"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? '...' : 'Change'}
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="store-name" className="text-sm font-medium">Store Name</Label>
                      <Input
                        id="store-name"
                        placeholder="Enter your store name"
                        value={settings?.store_name || ''}
                        onChange={(e) => {
                          // This would need to be connected to a form state
                          // For now, just show the current value
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="store-description" className="text-sm font-medium">Store Description</Label>
                      <Textarea
                        id="store-description"
                        placeholder="Describe your store and what you offer..."
                        value={settings?.store_description || ''}
                        onChange={(e) => {
                          // This would need to be connected to a form state
                          // For now, just show the current value
                        }}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                  </div>
                </div>
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, 'logo')
                }}
              />
              <p className="text-xs text-muted-foreground">
                Recommended size: 200x200px. Supports JPG, PNG, GIF up to 2MB.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">+0% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Store Settings Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Store Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Store Name</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {settings?.store_name || 'Not configured'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Stripe Status</Label>
                <Badge variant={settings?.payment_settings?.stripe_connected ? "default" : "secondary"} className="mt-1">
                  {settings?.payment_settings?.stripe_connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Store Status</Label>
                <Badge variant="outline" className="mt-1 capitalize">
                  {settings?.store_status || 'draft'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Verification</Label>
                <Badge variant={settings?.store_verified ? "default" : "secondary"} className="mt-1">
                  {settings?.store_verified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Configure Store Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

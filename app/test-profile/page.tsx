"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth()

  const handleRoleSwitch = async (role: 'buyer' | 'seller') => {
    if (!user || !profile) return
    
    console.log('=== TEST ROLE SWITCH ===')
    console.log('Switching to:', role)
    console.log('Current profile:', profile)
    
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const updateData = role === 'buyer' 
        ? { buyer_enabled: true, seller_enabled: false }
        : { buyer_enabled: false, seller_enabled: true }
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
      
      if (error) {
        console.error('Update error:', error)
        alert(`Error: ${error.message}`)
        return
      }
      
      console.log('Update successful:', data)
      alert(`Switched to ${role} successfully!`)
      
      // Refresh profile
      await refreshProfile()
    } catch (error) {
      console.error('Error:', error)
      alert(`Error: ${error}`)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Profile Debug Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={() => handleRoleSwitch('buyer')}>
              Switch to Buyer
            </Button>
            <Button onClick={() => handleRoleSwitch('seller')}>
              Switch to Seller
            </Button>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={refreshProfile} variant="outline">
              Refresh Profile
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Current Roles:</p>
            <p>Buyer Enabled: {profile?.buyer_enabled ? 'Yes' : 'No'}</p>
            <p>Seller Enabled: {profile?.seller_enabled ? 'Yes' : 'No'}</p>
            <p>Account Type: {profile?.account_type || 'Not set'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

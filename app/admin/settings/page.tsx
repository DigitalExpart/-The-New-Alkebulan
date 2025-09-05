"use client"

import { useState } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"

export default function AdminSettingsPage() {
  const [featureFlags, setFeatureFlags] = useState({
    enableMarketplace: true,
    enableMessaging: true,
    enableCommunities: true,
  })

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Platform Settings</h1>
              <p className="text-muted-foreground">Feature flags (local-only demo)</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(featureFlags).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <Switch
                    checked={value}
                    onCheckedChange={(next) => setFeatureFlags((f) => ({ ...f, [key]: next }))}
                  />
                </div>
              ))}
              <Button variant="outline" disabled>
                Save (wire to backend later)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}



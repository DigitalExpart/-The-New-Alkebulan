"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Ban, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface RestrictUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onRestrict: (data: any) => void
}

export function RestrictUserDialog({ open, onOpenChange, user, onRestrict }: RestrictUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [restrictionData, setRestrictionData] = useState({
    restrictionType: "temporary",
    duration: "7",
    reason: "",
    notifyUser: true,
    restrictPosts: true,
    restrictComments: false,
    restrictMessages: false
  })

  const handleRestrict = async () => {
    if (!restrictionData.reason.trim()) {
      toast.error("Please provide a reason for restriction")
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onRestrict(restrictionData)
      onOpenChange(false)
      toast.success("User restrictions applied successfully")
    } catch (error) {
      toast.error("Failed to apply restrictions")
    } finally {
      setLoading(false)
    }
  }

  const userName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Unnamed User"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-4">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
            <Ban className="w-6 h-6" />
            <DialogTitle>Restrict User</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            <p className="text-muted-foreground">
              Apply restrictions to <span className="font-semibold">{userName}</span>
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 px-3">
       
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="restrictionType">Restriction Type</Label>
              <Select
                value={restrictionData.restrictionType}
                onValueChange={(value) => setRestrictionData(prev => ({ ...prev, restrictionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select restriction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {restrictionData.restrictionType === "temporary" && (
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={restrictionData.duration}
                  onChange={(e) => setRestrictionData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Enter days"
                />
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Restriction</Label>
            <Textarea
              id="reason"
              value={restrictionData.reason}
              onChange={(e) => setRestrictionData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Explain why this restriction is being applied..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Restriction Settings */}
          <div className="space-y-3">
            <Label>Restriction Settings</Label>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Restrict Posts</span>
                  <p className="text-xs text-muted-foreground">Prevent user from creating new posts</p>
                </div>
                <Switch
                  checked={restrictionData.restrictPosts}
                  onCheckedChange={(checked) => setRestrictionData(prev => ({ ...prev, restrictPosts: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Restrict Comments</span>
                  <p className="text-xs text-muted-foreground">Prevent user from commenting</p>
                </div>
                <Switch
                  checked={restrictionData.restrictComments}
                  onCheckedChange={(checked) => setRestrictionData(prev => ({ ...prev, restrictComments: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Restrict Messages</span>
                  <p className="text-xs text-muted-foreground">Prevent user from sending messages</p>
                </div>
                <Switch
                  checked={restrictionData.restrictMessages}
                  onCheckedChange={(checked) => setRestrictionData(prev => ({ ...prev, restrictMessages: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Notify User */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Notify User</span>
              <p className="text-xs text-muted-foreground">Send notification about these restrictions</p>
            </div>
            <Switch
              checked={restrictionData.notifyUser}
              onCheckedChange={(checked) => setRestrictionData(prev => ({ ...prev, notifyUser: checked }))}
            />
          </div>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRestrict}
            disabled={loading || !restrictionData.reason.trim()}
            className="gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 flex-1 sm:flex-none"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
            Apply Restrictions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
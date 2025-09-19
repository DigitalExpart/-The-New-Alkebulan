"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Ban, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface PermanentBanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  onConfirm: () => void
}

export function PermanentBanDialog({ open, onOpenChange, userName, onConfirm }: PermanentBanDialogProps) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [notifyUser, setNotifyUser] = useState(true)
  const [deleteContent, setDeleteContent] = useState(false)

  const handleBan = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the ban")
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      onConfirm()
      onOpenChange(false)
      toast.success("User permanently banned")
    } catch (error) {
      toast.error("Failed to ban user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 text-destructive dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
            <DialogTitle>Permanent Ban</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            <p className="text-destructive/90 font-medium dark:text-red-300">
              Are you sure you want to permanently ban {userName}?
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              This action cannot be undone. The user will lose access to all platform features permanently.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="banReason">Reason for Permanent Ban</Label>
            <Textarea
              id="banReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this permanent ban is necessary..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Notify User</span>
              <p className="text-xs text-muted-foreground">Send notification about the ban</p>
            </div>
            <Switch
              checked={notifyUser}
              onCheckedChange={setNotifyUser}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg bg-destructive/10 dark:bg-destructive/20">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-destructive dark:text-red-400">Delete All Content</span>
              <p className="text-xs text-muted-foreground">Remove all user posts and comments</p>
            </div>
            <Switch
              checked={deleteContent}
              onCheckedChange={setDeleteContent}
            />
          </div>

          <div className="p-3 border border-destructive/50 rounded-lg bg-destructive/10 dark:bg-destructive/20">
            <p className="text-sm text-destructive dark:text-red-300">
              ⚠️ Warning: This action is permanent and cannot be reversed. The user will be completely removed from the platform.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBan}
            disabled={loading || !reason.trim()}
            variant="destructive"
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
            Confirm Permanent Ban
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
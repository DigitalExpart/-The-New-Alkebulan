"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  userName: string
}

export function DeleteConfirmationDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  userName 
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="w-6 h-6" />
            <DialogTitle>Delete User Account</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            <p className="text-destructive/90 font-medium">
              Are you sure you want to delete {userName}'s account?
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              This action is <span className="font-semibold text-destructive">permanent</span> and{' '}
              <span className="font-semibold text-destructive">cannot be reversed</span>. 
              All user data, posts, and activities will be permanently removed from our systems.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Yes, Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
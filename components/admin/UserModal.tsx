"use client"

import { useState } from "react"
import { 
  X, 
  User, 
  Mail, 
  Edit, 
  Trash2, 
  Lock, 
  Ban,
  AlertCircle,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { EditProfileModal } from "./AdminEditUserProfile"
import { DeleteConfirmationDialog } from "./DeleteUserDialog"
import { ResetPasswordDialog } from "./ResetPasswordDialog"
import { RestrictUserDialog } from "./RestrictUserDialog"
import { PermanentBanDialog } from "./PermanentBanDialog"

interface AdminUser {
  id?: string | null
  user_id?: string | null
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  is_admin?: boolean | null
  avatar_url?: string | null
  created_at?: string | null
}

interface UserModalProps {
  user: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleAdmin: (userId: string, isAdmin: boolean) => void
}

export function UserModal({ user, open, onOpenChange, onToggleAdmin }: UserModalProps) {
  if (!user) return null;
  
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false)
  const [restrictModalOpen, setRestrictModalOpen] = useState(false)
  const [banModalOpen, setBanModalOpen] = useState(false)

  const handleSaveProfile = (userData: any) => {
    console.log("Profile saved:", userData)
    toast.success("Profile updated successfully")
  }

  const handleDeleteUser = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("User account deleted successfully")
      setDeleteModalOpen(false)
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to delete user account")
    }
  }

  const handleResetPassword = async (newPassword: string) => {
    console.log("New password:", newPassword)
    toast.success("Password reset successfully")
  }

  const handleRestrictUser = async (restrictionData: any) => {
    console.log("Restriction data:", restrictionData)
    toast.success("User restrictions updated successfully")
  }

  const handlePermanentBan = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("User permanently banned")
      setBanModalOpen(false)
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to ban user")
    }
  }

  const userName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Unnamed User"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Details
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Profile Section */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {userName}
                </h3>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email || "No email"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {user.is_admin ? (
                    <Badge className="bg-primary">Admin</Badge>
                  ) : (
                    <Badge variant="secondary">Member</Badge>
                  )}
                  {user.created_at && (
                    <Badge variant="outline">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setEditModalOpen(true)}
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setResetPasswordModalOpen(true)}
              >
                <Lock className="w-4 h-4" />
                Reset Password
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                onClick={() => setRestrictModalOpen(true)}
              >
                <Ban className="w-4 h-4" />
                Restrict User
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 text-destructive hover:text-destructive dark:text-red-400 dark:hover:text-red-300"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </Button>
            </div>

            {/* Admin Toggle */}
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Privileges
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Grant or revoke administrator access
                  </p>
                </div>
                <Switch
                  checked={!!user.is_admin}
                  onCheckedChange={(next) => onToggleAdmin(user.id || user.user_id || '', next)}
                />
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 dark:bg-destructive/20">
              <h4 className="font-medium text-destructive flex items-center gap-2 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                Danger Zone
              </h4>
              <p className="text-sm text-destructive/80 mt-1 dark:text-red-300">
                These actions are irreversible. Please proceed with caution.
              </p>
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive border-destructive dark:text-red-400 dark:border-red-400"
                  onClick={() => setBanModalOpen(true)}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Permanent Ban
                </Button>
              </div>
            </div>

            {/* User Statistics (Placeholder) */}
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-medium mb-3">User Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Posts: </span>
                  <span className="font-medium">24</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Comments: </span>
                  <span className="font-medium">156</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Orders: </span>
                  <span className="font-medium">8</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Active: </span>
                  <span className="font-medium">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Components */}
      <EditProfileModal
        user={user}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveProfile}
      />

      <DeleteConfirmationDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteUser}
        userName={userName}
      />

      <ResetPasswordDialog
        open={resetPasswordModalOpen}
        onOpenChange={setResetPasswordModalOpen}
        userEmail={user?.email || ""}
        onReset={handleResetPassword}
      />

      <RestrictUserDialog
        open={restrictModalOpen}
        onOpenChange={setRestrictModalOpen}
        user={user}
        onRestrict={handleRestrictUser}
      />

      <PermanentBanDialog
        open={banModalOpen}
        onOpenChange={setBanModalOpen}
        userName={userName}
        onConfirm={handlePermanentBan}
      />
    </>
  );
}
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Target, TrendingUp, Trash2, Edit, Save, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import type { BusinessGoal } from "@/types/business"

interface UpdateGoalDialogProps {
  goal: BusinessGoal
  onGoalUpdated: () => void
  trigger?: React.ReactNode
}

interface UpdateFormData {
  current: number
  status: string
}

export function UpdateGoalDialog({ goal, onGoalUpdated, trigger }: UpdateGoalDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateFormData>({
    current: goal.current,
    status: goal.status,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error("You must be signed in to update a goal")
      return
    }

    if (formData.current < 0) {
      toast.error("Current progress cannot be negative")
      return
    }

    try {
      setLoading(true)
      
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('business_goals')
        .update({
          current: formData.current,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', goal.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating goal:', error)
        toast.error('Failed to update goal')
        return
      }

      toast.success('Goal updated successfully!')
      setOpen(false)
      onGoalUpdated()
      
    } catch (err) {
      console.error('Error updating goal:', err)
      toast.error('Failed to update goal')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user?.id) {
      toast.error("You must be signed in to delete a goal")
      return
    }

    try {
      setDeleteLoading(true)
      
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('business_goals')
        .delete()
        .eq('id', goal.id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting goal:', error)
        toast.error('Failed to delete goal')
        return
      }

      toast.success('Goal deleted successfully!')
      setOpen(false)
      onGoalUpdated()
      
    } catch (err) {
      console.error('Error deleting goal:', err)
      toast.error('Failed to delete goal')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleInputChange = (field: keyof UpdateFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === "USD" || unit === "EUR") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: unit === "EUR" ? "EUR" : "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    }
    return `${value} ${unit}`
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Update Progress
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Update Goal Progress
          </DialogTitle>
          <DialogDescription>
            Update the current progress and status of your goal: {goal.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Goal Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target:</span>
                <span className="font-medium">{formatValue(goal.target, goal.unit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Progress:</span>
                <span className="font-medium">{formatValue(goal.current, goal.unit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">{Math.round(calculateProgress(goal.current, goal.target))}%</span>
              </div>
            </div>
          </div>

          {/* Current Progress Input */}
          <div className="space-y-2">
            <Label htmlFor="current">Current Progress *</Label>
            <Input
              id="current"
              type="number"
              placeholder="0"
              value={formData.current || ''}
              onChange={(e) => handleInputChange('current', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the current amount achieved towards your {formatValue(goal.target, goal.unit)} target
            </p>
          </div>

          {/* Status Update */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress Preview */}
          <div className="space-y-2">
            <Label>Progress Preview</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="font-medium">{Math.round(calculateProgress(formData.current, goal.target))}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress(formData.current, goal.target)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatValue(formData.current, goal.unit)}</span>
                <span>{formatValue(goal.target, goal.unit)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Goal
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Goal
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Goal
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

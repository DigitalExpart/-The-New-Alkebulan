"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertCircle, CheckCircle } from "lucide-react"
import type { CreateProposalData } from "@/types/governance"

interface CreateProposalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateProposalData) => void
}

export function CreateProposalModal({ isOpen, onClose, onSubmit }: CreateProposalModalProps) {
  const [formData, setFormData] = useState<CreateProposalData>({
    title: "",
    type: "feature",
    description: "",
    fullDescription: "",
    votingDuration: 7,
    quorumRequired: 500,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const proposalTypes = [
    { value: "policy", label: "Policy Change", description: "Changes to community rules or guidelines" },
    { value: "funding", label: "Funding Request", description: "Allocation of community treasury funds" },
    { value: "feature", label: "Feature Request", description: "New platform features or improvements" },
    { value: "rule-change", label: "Rule Change", description: "Modifications to governance rules" },
    { value: "upgrade", label: "System Upgrade", description: "Technical upgrades or infrastructure changes" },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Short description is required"
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters"
    }

    if (!formData.fullDescription.trim()) {
      newErrors.fullDescription = "Full proposal details are required"
    } else if (formData.fullDescription.length < 200) {
      newErrors.fullDescription = "Full description must be at least 200 characters"
    }

    if (formData.quorumRequired < 100) {
      newErrors.quorumRequired = "Minimum quorum is 100 votes"
    }

    if (formData.votingDuration < 3 || formData.votingDuration > 30) {
      newErrors.votingDuration = "Voting duration must be between 3 and 30 days"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)

      // Reset form
      setFormData({
        title: "",
        type: "feature",
        description: "",
        fullDescription: "",
        votingDuration: 7,
        quorumRequired: 500,
      })

      onClose()
    } catch (error) {
      console.error("Error creating proposal:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateProposalData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Proposal
          </DialogTitle>
          <DialogDescription>
            Submit a proposal for community consideration. All proposals will be reviewed before voting begins.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Proposal Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Proposal Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select proposal type" />
              </SelectTrigger>
              <SelectContent>
                {proposalTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title</Label>
            <Input
              id="title"
              placeholder="Enter a clear, descriptive title for your proposal"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </div>
            )}
            <div className="text-sm text-muted-foreground">{formData.title.length}/100 characters</div>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a brief summary of your proposal (50-300 characters)"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </div>
            )}
            <div className="text-sm text-muted-foreground">{formData.description.length}/300 characters</div>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <Label htmlFor="fullDescription">Full Proposal Details</Label>
            <Textarea
              id="fullDescription"
              placeholder="Provide comprehensive details about your proposal including implementation plan, budget requirements, timeline, and expected outcomes. Use markdown formatting for better readability."
              value={formData.fullDescription}
              onChange={(e) => handleInputChange("fullDescription", e.target.value)}
              rows={10}
              className={errors.fullDescription ? "border-red-500" : ""}
            />
            {errors.fullDescription && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.fullDescription}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              {formData.fullDescription.length} characters (minimum 200)
            </div>
          </div>

          {/* Voting Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="votingDuration">Voting Duration (Days)</Label>
              <Input
                id="votingDuration"
                type="number"
                min="3"
                max="30"
                value={formData.votingDuration}
                onChange={(e) => handleInputChange("votingDuration", Number.parseInt(e.target.value) || 7)}
                className={errors.votingDuration ? "border-red-500" : ""}
              />
              {errors.votingDuration && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.votingDuration}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quorumRequired">Required Quorum</Label>
              <Input
                id="quorumRequired"
                type="number"
                min="100"
                value={formData.quorumRequired}
                onChange={(e) => handleInputChange("quorumRequired", Number.parseInt(e.target.value) || 500)}
                className={errors.quorumRequired ? "border-red-500" : ""}
              />
              {errors.quorumRequired && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.quorumRequired}
                </div>
              )}
            </div>
          </div>

          {/* Requirements Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proposal Requirements</CardTitle>
              <CardDescription>Please ensure your proposal meets all requirements before submission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {formData.title.length >= 10 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Title must be at least 10 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {formData.description.length >= 50 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Description must be at least 50 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {formData.fullDescription.length >= 200 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Full description must be at least 200 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {formData.quorumRequired >= 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Minimum quorum of 100 votes required</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Proposal..." : "Create Proposal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Euro,
  PoundSterling,
} from "lucide-react"
import type { PaymentFormData, AddFundsResponse } from "@/types/payment"
import {
  formatCardNumber,
  getCardBrand,
  validateCardNumber,
  validateExpiryDate,
  formatCurrency,
} from "@/utils/payment-utils"

interface AddFundsFormProps {
  currentBalance: number
  onSuccess?: (newBalance: number) => void
}

export function AddFundsForm({ currentBalance, onSuccess }: AddFundsFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
    amount: 0,
    currency: "USD",
    saveCard: false,
  })

  const [errors, setErrors] = useState<Partial<PaymentFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [transactionResult, setTransactionResult] = useState<AddFundsResponse | null>(null)

  const cardBrand = getCardBrand(formData.cardNumber)
  const currentYear = new Date().getFullYear() % 100

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {}

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required"
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required"
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = "Invalid card number"
    }

    if (!formData.expiryMonth) {
      newErrors.expiryMonth = "Expiry month is required"
    }

    if (!formData.expiryYear) {
      newErrors.expiryYear = "Expiry year is required"
    } else if (!validateExpiryDate(formData.expiryMonth, formData.expiryYear)) {
      newErrors.expiryMonth = "Card has expired"
    }

    if (!formData.cvc.trim()) {
      newErrors.cvc = "CVC is required"
    } else if (cardBrand === "amex" && formData.cvc.length !== 4) {
      newErrors.cvc = "American Express requires 4 digits"
    } else if (cardBrand !== "amex" && formData.cvc.length !== 3) {
      newErrors.cvc = "CVC must be 3 digits"
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    } else if (formData.amount < 5) {
      newErrors.amount = "Minimum amount is $5"
    } else if (formData.amount > 10000) {
      newErrors.amount = "Maximum amount is $10,000"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const result: AddFundsResponse = {
        success: true,
        transactionId: `txn_${Date.now()}`,
        message: "Funds added successfully!",
        newBalance: currentBalance + formData.amount,
      }

      setTransactionResult(result)
      setShowSuccess(true)
      onSuccess?.(result.newBalance!)

      // Reset form
      setFormData({
        cardholderName: "",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvc: "",
        amount: 0,
        currency: "USD",
        saveCard: false,
      })
    } catch (error) {
      const result: AddFundsResponse = {
        success: false,
        message: "Payment failed. Please try again.",
      }
      setTransactionResult(result)
      setShowSuccess(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value)
    if (formatted.replace(/\s/g, "").length <= 16) {
      setFormData((prev) => ({ ...prev, cardNumber: formatted }))
    }
  }

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "USD":
        return <DollarSign className="h-4 w-4" />
      case "EUR":
        return <Euro className="h-4 w-4" />
      case "GBP":
        return <PoundSterling className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getCardIcon = (brand: string) => {
    const iconClass = "h-6 w-10 object-contain"
    switch (brand) {
      case "visa":
        return (
          <div
            className={`${iconClass} bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold`}
          >
            VISA
          </div>
        )
      case "mastercard":
        return (
          <div
            className={`${iconClass} bg-red-600 text-white rounded flex items-center justify-center text-xs font-bold`}
          >
            MC
          </div>
        )
      case "amex":
        return (
          <div
            className={`${iconClass} bg-green-600 text-white rounded flex items-center justify-center text-xs font-bold`}
          >
            AMEX
          </div>
        )
      case "discover":
        return (
          <div
            className={`${iconClass} bg-orange-600 text-white rounded flex items-center justify-center text-xs font-bold`}
          >
            DISC
          </div>
        )
      default:
        return <CreditCard className="h-6 w-10 text-gray-400" />
    }
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Add Funds to Your Account</CardTitle>
          <CardDescription className="text-base">
            Securely add money to your balance using your credit or debit card.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Balance */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Current Balance</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(currentBalance, formData.currency)}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount to Add *
              </Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {getCurrencyIcon(formData.currency)}
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    min="5"
                    max="10000"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, amount: Number.parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
                <Select
                  value={formData.currency}
                  onValueChange={(value: "USD" | "EUR" | "GBP") =>
                    setFormData((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.amount}
                </p>
              )}
            </div>

            <Separator />

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardholderName" className="text-sm font-medium">
                Cardholder Name *
              </Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="Full name as on card"
                value={formData.cardholderName}
                onChange={(e) => setFormData((prev) => ({ ...prev, cardholderName: e.target.value }))}
                className={errors.cardholderName ? "border-red-500" : ""}
              />
              {errors.cardholderName && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.cardholderName}
                </p>
              )}
            </div>

            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-sm font-medium">
                Card Number *
              </Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  className={`pr-16 ${errors.cardNumber ? "border-red-500" : ""}`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getCardIcon(cardBrand)}</div>
              </div>
              {errors.cardNumber && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.cardNumber}
                </p>
              )}
            </div>

            {/* Expiry Date and CVC */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth" className="text-sm font-medium">
                  Month *
                </Label>
                <Select
                  value={formData.expiryMonth}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, expiryMonth: value }))}
                >
                  <SelectTrigger className={errors.expiryMonth ? "border-red-500" : ""}>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                        {month.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryYear" className="text-sm font-medium">
                  Year *
                </Label>
                <Select
                  value={formData.expiryYear}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, expiryYear: value }))}
                >
                  <SelectTrigger className={errors.expiryYear ? "border-red-500" : ""}>
                    <SelectValue placeholder="YY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => currentYear + i).map((year) => (
                      <SelectItem key={year} value={(year % 100).toString().padStart(2, "0")}>
                        {(year % 100).toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvc" className="text-sm font-medium">
                  CVC *
                </Label>
                <Input
                  id="cvc"
                  type="text"
                  placeholder={cardBrand === "amex" ? "1234" : "123"}
                  maxLength={cardBrand === "amex" ? 4 : 3}
                  value={formData.cvc}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cvc: e.target.value.replace(/\D/g, "") }))}
                  className={errors.cvc ? "border-red-500" : ""}
                />
              </div>
            </div>
            {(errors.expiryMonth || errors.expiryYear || errors.cvc) && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.expiryMonth || errors.expiryYear || errors.cvc}
              </p>
            )}

            {/* Save Card Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveCard"
                checked={formData.saveCard}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, saveCard: checked as boolean }))}
              />
              <Label htmlFor="saveCard" className="text-sm">
                Save card for future payments
              </Label>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-blue-800">
                <Lock className="h-4 w-4" />
                <p className="text-sm font-medium">Secure Payment</p>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                All transactions are secured with SSL encryption and processed by our certified payment partners.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Add Funds Securely
                </>
              )}
            </Button>
          </form>

          {/* Accepted Cards */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">We accept</p>
            <div className="flex justify-center space-x-2">
              {getCardIcon("visa")}
              {getCardIcon("mastercard")}
              {getCardIcon("amex")}
              {getCardIcon("discover")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              {transactionResult?.success ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <DialogTitle className={transactionResult?.success ? "text-green-900" : "text-red-900"}>
              {transactionResult?.success ? "Payment Successful!" : "Payment Failed"}
            </DialogTitle>
            <DialogDescription className="text-center">{transactionResult?.message}</DialogDescription>
          </DialogHeader>

          {transactionResult?.success && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700">New Balance</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(transactionResult.newBalance!, formData.currency)}
                </p>
              </div>

              {transactionResult.transactionId && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">Transaction ID</p>
                  <Badge variant="outline" className="font-mono text-xs">
                    {transactionResult.transactionId}
                  </Badge>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={() => setShowSuccess(false)}
            className="w-full"
            variant={transactionResult?.success ? "default" : "destructive"}
          >
            {transactionResult?.success ? "Continue" : "Try Again"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

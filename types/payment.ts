export interface PaymentMethod {
  id: string
  type: "credit" | "debit"
  brand: "visa" | "mastercard" | "amex" | "discover"
  last4: string
  expiryMonth: number
  expiryYear: number
  holderName: string
  isDefault: boolean
  createdAt: string
}

export interface PaymentFormData {
  cardholderName: string
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvc: string
  amount: number
  currency: "USD" | "EUR" | "GBP"
  saveCard: boolean
}

export interface PaymentTransaction {
  id: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  method: PaymentMethod
  createdAt: string
  description: string
}

export interface AddFundsResponse {
  success: boolean
  transactionId?: string
  message: string
  newBalance?: number
}

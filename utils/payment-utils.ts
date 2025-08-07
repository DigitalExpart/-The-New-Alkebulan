export function formatCardNumber(value: string): string {
  // Remove all non-digit characters
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

  // Add spaces every 4 digits
  const matches = v.match(/\d{4,16}/g)
  const match = (matches && matches[0]) || ""
  const parts = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    return parts.join(" ")
  } else {
    return v
  }
}

export function getCardBrand(cardNumber: string): "visa" | "mastercard" | "amex" | "discover" | "unknown" {
  const number = cardNumber.replace(/\s/g, "")

  if (/^4/.test(number)) return "visa"
  if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return "mastercard"
  if (/^3[47]/.test(number)) return "amex"
  if (/^6(?:011|5)/.test(number)) return "discover"

  return "unknown"
}

export function validateCardNumber(cardNumber: string): boolean {
  const number = cardNumber.replace(/\s/g, "")

  // Luhn algorithm
  let sum = 0
  let isEven = false

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(number.charAt(i), 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

export function validateExpiryDate(month: string, year: string): boolean {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1

  const expMonth = Number.parseInt(month, 10)
  const expYear = Number.parseInt(year, 10)

  if (expYear < currentYear) return false
  if (expYear === currentYear && expMonth < currentMonth) return false

  return true
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

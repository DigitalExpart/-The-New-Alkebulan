export function calculateLifePathNumber(birthDate: Date): number {
  const day = birthDate.getDate()
  const month = birthDate.getMonth() + 1 // getMonth() returns 0-11
  const year = birthDate.getFullYear()

  // Convert to strings and sum all digits
  const daySum = sumDigits(day)
  const monthSum = sumDigits(month)
  const yearSum = sumDigits(year)

  // Sum all components
  let total = daySum + monthSum + yearSum

  // Reduce to single digit (except for master numbers 11, 22, 33)
  while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
    total = sumDigits(total)
  }

  return total
}

function sumDigits(num: number): number {
  let sum = 0
  while (num > 0) {
    sum += num % 10
    num = Math.floor(num / 10)
  }
  return sum
}

export function formatBirthDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function getAgeFromBirthDate(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function calculateLifePathNumber(birthDate: Date): number {
  const day = birthDate.getDate()
  const month = birthDate.getMonth() + 1
  const year = birthDate.getFullYear()

  const total = reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year)
  return reduceMasterNumbers(total)
}

export function calculateDestinyNumber(fullName: string): number {
  const letterValues: { [key: string]: number } = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    I: 9,
    J: 1,
    K: 2,
    L: 3,
    M: 4,
    N: 5,
    O: 6,
    P: 7,
    Q: 8,
    R: 9,
    S: 1,
    T: 2,
    U: 3,
    V: 4,
    W: 5,
    X: 6,
    Y: 7,
    Z: 8,
  }

  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, "")
  let total = 0

  for (const letter of cleanName) {
    total += letterValues[letter] || 0
  }

  return reduceMasterNumbers(total)
}

export function calculateSoulUrgeNumber(fullName: string): number {
  const vowels = "AEIOU"
  const letterValues: { [key: string]: number } = {
    A: 1,
    E: 5,
    I: 9,
    O: 6,
    U: 3,
  }

  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, "")
  let total = 0

  for (const letter of cleanName) {
    if (vowels.includes(letter)) {
      total += letterValues[letter] || 0
    }
  }

  return reduceMasterNumbers(total)
}

export function calculatePersonalityNumber(fullName: string): number {
  const vowels = "AEIOU"
  const letterValues: { [key: string]: number } = {
    B: 2,
    C: 3,
    D: 4,
    F: 6,
    G: 7,
    H: 8,
    J: 1,
    K: 2,
    L: 3,
    M: 4,
    N: 5,
    P: 7,
    Q: 8,
    R: 9,
    S: 1,
    T: 2,
    V: 4,
    W: 5,
    X: 6,
    Y: 7,
    Z: 8,
  }

  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, "")
  let total = 0

  for (const letter of cleanName) {
    if (!vowels.includes(letter)) {
      total += letterValues[letter] || 0
    }
  }

  return reduceMasterNumbers(total)
}

export function calculateBirthdayNumber(birthDate: Date): number {
  return reduceMasterNumbers(birthDate.getDate())
}

export function calculatePersonalYear(birthDate: Date, currentYear: number = new Date().getFullYear()): number {
  const day = birthDate.getDate()
  const month = birthDate.getMonth() + 1

  const total = reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(currentYear)
  return reduceMasterNumbers(total)
}

export function calculatePersonalMonth(
  birthDate: Date,
  currentYear: number = new Date().getFullYear(),
  currentMonth: number = new Date().getMonth() + 1,
): number {
  const personalYear = calculatePersonalYear(birthDate, currentYear)
  const total = personalYear + currentMonth
  return reduceMasterNumbers(total)
}

export function calculatePersonalDay(birthDate: Date, targetDate: Date = new Date()): number {
  const personalMonth = calculatePersonalMonth(birthDate, targetDate.getFullYear(), targetDate.getMonth() + 1)
  const total = personalMonth + targetDate.getDate()
  return reduceMasterNumbers(total)
}

function reduceToSingleDigit(num: number): number {
  while (num > 9) {
    num = Math.floor(num / 10) + (num % 10)
  }
  return num
}

function reduceMasterNumbers(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = Math.floor(num / 10) + (num % 10)
  }
  return num
}

export function getNumberElement(number: number): string {
  const elements = {
    1: "Fire",
    2: "Water",
    3: "Fire",
    4: "Earth",
    5: "Air",
    6: "Earth",
    7: "Water",
    8: "Earth",
    9: "Fire",
    11: "Air",
    22: "Earth",
    33: "Fire",
  }
  return elements[number as keyof typeof elements] || "Unknown"
}

export function getNumberColor(number: number): string {
  const colors = {
    1: "#FF6B6B",
    2: "#4ECDC4",
    3: "#45B7D1",
    4: "#96CEB4",
    5: "#FFEAA7",
    6: "#DDA0DD",
    7: "#98D8C8",
    8: "#F7DC6F",
    9: "#BB8FCE",
    11: "#85C1E9",
    22: "#F8C471",
    33: "#82E0AA",
  }
  return colors[number as keyof typeof colors] || "#A0A0A0"
}

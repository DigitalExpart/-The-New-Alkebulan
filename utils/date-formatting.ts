export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":")
  const date = new Date()
  date.setHours(Number.parseInt(hours), Number.parseInt(minutes))

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function isThisWeek(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))

  return date >= weekStart && date <= weekEnd
}

export function isThisMonth(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

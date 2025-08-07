export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears}y ago`
}

export function groupNotificationsByDate(notifications: any[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const groups: { [key: string]: any[] } = {
    Today: [],
    Yesterday: [],
    "This week": [],
    Earlier: [],
  }

  notifications.forEach((notification) => {
    const notificationDate = new Date(notification.timestamp)
    const notificationDay = new Date(
      notificationDate.getFullYear(),
      notificationDate.getMonth(),
      notificationDate.getDate(),
    )

    if (notificationDay.getTime() === today.getTime()) {
      groups["Today"].push(notification)
    } else if (notificationDay.getTime() === yesterday.getTime()) {
      groups["Yesterday"].push(notification)
    } else if (notificationDate >= thisWeek) {
      groups["This week"].push(notification)
    } else {
      groups["Earlier"].push(notification)
    }
  })

  return Object.entries(groups)
    .filter(([_, notifications]) => notifications.length > 0)
    .map(([date, notifications]) => ({ date, notifications }))
}

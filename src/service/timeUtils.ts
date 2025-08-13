/**
 * Utility functions for time calculations and formatting
 */

export const timeAgo = (dateString: Date | string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInDays > 0) {
    if (diffInDays >= 7) {
      const diffInWeeks = Math.floor(diffInDays / 7)
      if (diffInWeeks >= 4) {
        const diffInMonths = Math.floor(diffInDays / 30)
        return `${diffInMonths}m ago`
      }
      return `${diffInWeeks}w ago`
    }
    return `${diffInDays}d ago`
  } else if (diffInHours > 0) {
    const remainingMinutes = diffInMinutes % 60
    if (remainingMinutes === 0) {
      return `${diffInHours}h ago`
    } else {
      return `${diffInHours}h ${remainingMinutes}m ago`
    }
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes}m ago`
  } else {
    return 'Just now'
  }
}

export const formatRelativeTime = (dateString: Date | string): string => {
  return timeAgo(dateString)
}

export const getTimeDifference = (dateString: Date | string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  
  return {
    milliseconds: diffInMs,
    seconds: Math.floor(diffInMs / 1000),
    minutes: Math.floor(diffInMs / (1000 * 60)),
    hours: Math.floor(diffInMs / (1000 * 60 * 60)),
    days: Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  }
}

export const isRecent = (dateString: Date | string, hours: number = 24): boolean => {
  const diff = getTimeDifference(dateString)
  return diff.hours < hours
}

export const isToday = (dateString: Date | string): boolean => {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const isYesterday = (dateString: Date | string): boolean => {
  const date = new Date(dateString)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
} 
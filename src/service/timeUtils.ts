// src/service/timeUtils.ts

/**
 * Safely converts Firestore Timestamp, string, number, or Date
 * into a JavaScript Date object.
 */
export function convertTimestampToDate(value: any): Date {
  if (!value) return new Date();

  // Firestore Timestamp
  if (value.toDate && typeof value.toDate === "function") {
    return value.toDate();
  }

  // Already a Date
  if (value instanceof Date) {
    return value;
  }

  // String or number
  return new Date(value);
}

/**
 * Returns a relative "time ago" string like "3 days ago"
 * Works with Date, Timestamp, or string inputs.
 */
export function timeAgo(input: any): string {
  const date = convertTimestampToDate(input); // ✅ Ensure it's a Date
  const now = new Date();

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (isNaN(seconds)) return "—";

  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  for (const [unit, label] of intervals) {
    const count = Math.floor(seconds / unit);
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

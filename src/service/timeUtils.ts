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
 * Returns a localized "time ago" string like "3 days ago" or "3 ມື້ກ່ອນ"
 * Works with Date, Timestamp, or string inputs.
 * Supports "en" and "lo" locales.
 */
export function timeAgo(input: any, lang: "en" | "lo" = "en"): string {
  const date = convertTimestampToDate(input);
  const now = new Date();

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (isNaN(seconds)) return "—";

  // Time intervals in seconds
  const intervals: [number, "year" | "month" | "day" | "hour" | "minute"][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  const labels = {
    en: {
      year: "year",
      month: "month",
      day: "day",
      hour: "hour",
      minute: "minute",
      ago: "ago",
      justNow: "Just now",
    },
    lo: {
      year: "ປີ",
      month: "ເດືອນ",
      day: "ມື້",
      hour: "ຊົ່ວໂມງ",
      minute: "ນາທີ",
      ago: "ກ່ອນ",
      justNow: "ເມື່ອບໍ່ດົນນີ້",
    },
  };

  const locale = labels[lang] || labels.en;

  for (const [unit, label] of intervals) {
    const count = Math.floor(seconds / unit);
    if (count >= 1) {
      const unitLabel =
        lang === "en"
          ? `${label}${count > 1 ? "s" : ""}`
          : `${locale[label]}${count > 1 ? "" : ""}`; // Lao words are the same singular/plural
      return lang === "en"
        ? `${count} ${unitLabel} ${locale.ago}`
        : `${count} ${unitLabel} ${locale.ago}`;
    }
  }

  return locale.justNow;
}

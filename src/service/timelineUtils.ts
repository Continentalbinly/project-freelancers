/**
 * Timeline translations and utilities
 */

export interface TimelineOption {
  id: string;
  label_en: string;
  label_lo: string;
}

export const TIMELINE_OPTIONS: TimelineOption[] = [
  {
    id: "lessThan1Week",
    label_en: "Less than 1 week",
    label_lo: "ຫນ້ອຍກວ່າ 1 ອາທິດ",
  },
  {
    id: "oneToTwoWeeks",
    label_en: "1-2 weeks",
    label_lo: "1-2 ອາທິດ",
  },
  {
    id: "twoToFourWeeks",
    label_en: "2-4 weeks",
    label_lo: "2-4 ອາທິດ",
  },
  {
    id: "oneToTwoMonths",
    label_en: "1-2 months",
    label_lo: "1-2 ເດືອນ",
  },
  {
    id: "twoToThreeMonths",
    label_en: "2-3 months",
    label_lo: "2-3 ເດືອນ",
  },
  {
    id: "moreThan3Months",
    label_en: "More than 3 months",
    label_lo: "ຫຼາຍກວ່າ 3 ເດືອນ",
  },
];

/**
 * Get timeline label based on current language
 */
export function getTimelineLabel(
  timelineId: string,
  language: "en" | "lo" = "en"
): string {
  const timeline = TIMELINE_OPTIONS.find((t) => t.id === timelineId);
  if (!timeline) return timelineId;
  return language === "lo" ? timeline.label_lo : timeline.label_en;
}

/**
 * Get timeline data for saving to database
 */
export function getTimelineData(timelineId: string) {
  const timeline = TIMELINE_OPTIONS.find((t) => t.id === timelineId);
  if (!timeline) {
    return {
      id: timelineId,
      label_en: timelineId,
      label_lo: timelineId,
    };
  }
  return timeline;
}

/**
 * Get timeline label from stored timeline object
 */
export function getTimelineLabelFromData(
  timeline: { id?: string; label_en?: string; label_lo?: string } | string | undefined,
  language: "en" | "lo" = "en"
): string {
  // If timeline is a string (old format), try to find it
  if (typeof timeline === "string") {
    return getTimelineLabel(timeline, language);
  }

  // If timeline is an object with translations
  if (timeline && typeof timeline === "object") {
    if (language === "lo" && timeline.label_lo) {
      return timeline.label_lo;
    }
    if (timeline.label_en) {
      return timeline.label_en;
    }
    if (timeline.id) {
      return getTimelineLabel(timeline.id, language);
    }
  }

  return "N/A";
}

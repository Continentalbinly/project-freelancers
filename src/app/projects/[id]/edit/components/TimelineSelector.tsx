"use client";

export default function TimelineSelector({ formData, setFormData, t }: any) {
  const timelines = [
    t("createProject.lessThan1Week"),
    t("createProject.oneToTwoWeeks"),
    t("createProject.oneToTwoMonths"),
  ];

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-text-primary">
        {t("createProject.timeline")}
      </label>

      <select
        value={formData.timeline}
        onChange={(e) =>
          setFormData((p: any) => ({ ...p, timeline: e.target.value }))
        }
        className="border border-border rounded-lg px-3 py-2 w-full"
      >
        <option value="">{t("createProject.selectTimeline")}</option>
        {timelines.map((tline: string) => (
          <option key={tline}>{tline}</option>
        ))}
      </select>
    </div>
  );
}

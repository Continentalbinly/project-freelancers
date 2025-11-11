"use client";

export default function TipsAndResources({ t }: any) {
  const tips = [
    t("dashboard.tipsAndResources.completeProfile"),
    t("dashboard.tipsAndResources.respondQuickly"),
    t("dashboard.tipsAndResources.buildPortfolio"),
  ];

  return (
    <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-xl p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold mb-3 text-center sm:text-left">
        {t("dashboard.tipsAndResources.title")}
      </h2>
      <ul className="space-y-2 text-sm sm:text-base">
        {tips.map((tip: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mt-1.5"></div>
            <p className="text-white/90 leading-snug">{tip}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

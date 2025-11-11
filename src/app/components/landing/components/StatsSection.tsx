export default function StatsSection({
  t,
  stats,
  loading,
  formatEarnings,
}: any) {
  const items = [
    { key: "freelancers", color: "primary", value: `${stats.freelancers}+` },
    { key: "clients", color: "secondary", value: `${stats.clients}+` },
    { key: "projects", color: "success", value: `${stats.projects}+` },
    {
      key: "earned",
      color: "warning",
      value: formatEarnings(stats.totalEarned),
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          {t("landingPage.stats.title")}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-2.5">
          {items.map(({ key, color, value }) => (
            <div key={key} className="text-center">
              <div
                className={`text-3xl sm:text-4xl font-bold text-${color} mb-2`}
              >
                {loading ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded" />
                ) : (
                  value
                )}
              </div>
              <div className="text-text-secondary">
                {t(`landingPage.stats.${key}`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

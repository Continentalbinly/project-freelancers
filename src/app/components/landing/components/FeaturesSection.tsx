export default function FeaturesSection({ t }: any) {
  const features = [
    {
      iconColor: "primary",
      key: "earnWhileLearn",
    },
    {
      iconColor: "secondary",
      key: "buildPortfolio",
    },
    {
      iconColor: "success",
      key: "joinCommunity",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            {t("landingPage.features.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("landingPage.features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ iconColor, key }) => (
            <div key={key} className="text-center">
              <div
                className={`w-16 h-16 bg-${iconColor}-light rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <div className={`w-8 h-8 text-${iconColor}`}>★</div>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {t(`landingPage.features.${key}.title`)}
              </h3>
              <p className="text-text-secondary">
                {t(`landingPage.features.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

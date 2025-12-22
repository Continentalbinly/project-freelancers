interface FeaturesSectionProps {
  t: (key: string) => string;
}

export default function FeaturesSection({ t }: FeaturesSectionProps) {
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
    <section className="py-12 sm:py-16 lg:py-20 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -mr-20"></div>
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl -ml-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("landingPage.features.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto font-medium">
            {t("landingPage.features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ iconColor, key }) => (
            <div
              key={key}
              className="group bg-background-secondary border border-border rounded-2xl p-8 sm:p-10
                         hover:border-primary hover:shadow-xl hover:-translate-y-2
                         transition-all duration-300 cursor-pointer"
            >
              <div
                className={`w-16 h-16 bg-${iconColor}/10 rounded-full flex items-center justify-center mx-auto mb-6
                           group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 group-hover:-rotate-6`}
              >
                <div className={`w-8 h-8 text-${iconColor} text-2xl group-hover:scale-125 transition-transform duration-300`}>★</div>
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                {t(`landingPage.features.${key}.title`)}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {t(`landingPage.features.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HowItWorksSection({ t }: any) {
  const steps = [
    { color: "primary", num: 1, title: "step1" },
    { color: "secondary", num: 2, title: "step2" },
    { color: "success", num: 3, title: "step3" },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            {t("landingPage.howItWorks.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("landingPage.howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map(({ color, num, title }) => (
            <div key={num} className="text-center">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 bg-${color} rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                <span className="text-white font-bold text-xl sm:text-2xl">
                  {num}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t(`landingPage.howItWorks.${title}.title`)}
              </h3>
              <p className="text-text-secondary">
                {t(`landingPage.howItWorks.${title}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

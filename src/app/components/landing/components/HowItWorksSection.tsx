interface HowItWorksSectionProps {
  t: (key: string) => string;
}

export default function HowItWorksSection({ t }: HowItWorksSectionProps) {
  const steps = [
    { color: "primary", num: 1, title: "step1" },
    { color: "secondary", num: 2, title: "step2" },
    { color: "success", num: 3, title: "step3" },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("landingPage.howItWorks.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto font-medium">
            {t("landingPage.howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map(({ color, num, title }, idx) => (
            <div key={num} className="flex flex-col items-center text-center group relative">
              {/* Animated connection line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-20 top-10 w-40 h-0.5 bg-linear-to-r from-gray-300 via-gray-300/50 to-transparent
                              group-hover:from-primary group-hover:via-primary group-hover:to-primary/30 transition-all duration-500"></div>
              )}
              
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 bg-${color} rounded-full flex items-center justify-center mx-auto mb-6 
                           shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-3
                           ring-4 ring-${color}/10 group-hover:ring-${color}/30`}
              >
                <span className="text-white font-bold text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
                  {num}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                {t(`landingPage.howItWorks.${title}.title`)}
              </h3>
              <p className="text-text-secondary transition-colors duration-300">
                {t(`landingPage.howItWorks.${title}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

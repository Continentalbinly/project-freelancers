import Link from "next/link";

export default function UserTypesSection({ t }: any) {
  const userTypes = [
    {
      key: "freelancers",
      gradient: "from-primary-light to-primary/10",
      color: "primary",
      signup: "/auth/signup?type=freelancer",
      buttonStyle:
        "bg-primary text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary/30",
    },
    {
      key: "clients",
      gradient: "from-secondary-light to-secondary/10",
      color: "secondary",
      signup: "/auth/signup?type=client",
      buttonStyle:
        "bg-secondary text-white hover:bg-secondary/90 focus:ring-2 focus:ring-secondary/30",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            {t("landingPage.userTypes.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("landingPage.userTypes.subtitle")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {userTypes.map(({ key, gradient, color, signup, buttonStyle }) => (
            <div
              key={key}
              className={`bg-gradient-to-br ${gradient} rounded-2xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <h3 className="text-2xl font-bold text-text-primary mb-4">
                {t(`landingPage.userTypes.${key}.title`)}
              </h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                {t(`landingPage.userTypes.${key}.description`)}
              </p>

              <ul className="space-y-3 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="flex items-center text-text-secondary">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 mr-3 rounded-full bg-${color}/10 text-${color}`}
                    >
                      ✓
                    </span>
                    {t(`landingPage.userTypes.${key}.benefits.${i}`)}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Link
                href={signup}
                className={`inline-block px-6 py-3 rounded-lg font-semibold shadow-sm ${buttonStyle} transition duration-200`}
              >
                {t(`landingPage.userTypes.${key}.joinButton`)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

export default function UserTypesSection({ t }: any) {
  const userTypes = [
    {
      key: "freelancers",
      color: "primary",
      borderColor: "border-primary/30",
      hoverBorder: "hover:border-primary",
      iconBg: "bg-primary/10",
      signup: "/auth/signup?type=freelancer",
      buttonStyle:
        "bg-primary text-white hover:bg-primary-hover focus:ring-2 focus:ring-primary/30",
    },
    {
      key: "clients",
      color: "secondary",
      borderColor: "border-secondary/30",
      hoverBorder: "hover:border-secondary",
      iconBg: "bg-secondary/10",
      signup: "/auth/signup?type=client",
      buttonStyle:
        "bg-secondary text-white hover:bg-secondary-hover focus:ring-2 focus:ring-secondary/30",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("landingPage.userTypes.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto font-medium">
            {t("landingPage.userTypes.subtitle")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {userTypes.map(({ key, color, borderColor, hoverBorder, iconBg, signup, buttonStyle }) => (
            <div
              key={key}
              className={`group relative bg-background-secondary rounded-2xl p-8 sm:p-10 
                         shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 
                         overflow-hidden border-2 ${borderColor} ${hoverBorder}`}
            >
              {/* Decorative corner accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${iconBg} rounded-full blur-3xl -mr-16 -mt-16 opacity-50`}></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mb-6 
                               group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`text-3xl text-${color}`}>
                    {key === 'freelancers' ? '💼' : '🎯'}
                  </div>
                </div>

                <h3 className={`text-2xl font-bold mb-4 group-hover:text-${color} transition-colors duration-300`}>
                  {t(`landingPage.userTypes.${key}.title`)}
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed font-medium">
                  {t(`landingPage.userTypes.${key}.description`)}
                </p>

                <ul className="space-y-3 mb-8">
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className="flex items-start text-text-secondary group/item">
                      <span className={`inline-flex items-center justify-center w-5 h-5 mr-3 mt-0.5 rounded-full ${iconBg} text-${color} font-bold text-sm
                                       group-hover/item:scale-110 transition-transform duration-300 flex-shrink-0`}>
                        ✓
                      </span>
                      <span className="group-hover/item:text-text-primary transition-colors duration-300">
                        {t(`landingPage.userTypes.${key}.benefits.${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Link
                  href={signup}
                  className={`inline-block px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-xl ${buttonStyle} 
                             transition-all duration-300 hover:scale-105 active:scale-95`}
                >
                  {t(`landingPage.userTypes.${key}.joinButton`)}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

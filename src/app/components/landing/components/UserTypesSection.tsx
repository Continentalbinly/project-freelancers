"use client";
import { useRouter } from "next/navigation";
import MarketingSection from "@/app/(page)/components/MarketingSection";
import Stagger from "@/app/components/motion/Stagger";
import StaggerItem from "@/app/components/motion/StaggerItem";
import { Briefcase, Target } from "lucide-react";
import { Check } from "lucide-react";

interface UserTypesSectionProps {
  t: (key: string) => string;
}

export default function UserTypesSection({ t }: UserTypesSectionProps) {
  const router = useRouter();
  const userTypes = [
    {
      key: "freelancers",
      textClass: "text-primary",
      borderColor: "border-primary/30",
      hoverBorder: "hover:border-primary/40",
      iconBg: "bg-primary/10",
      icon: Briefcase,
      signup: "/auth/signup?type=freelancer",
      buttonStyle:
        "bg-primary text-white hover:bg-primary-hover focus:ring-2 focus:ring-primary/30",
    },
    {
      key: "clients",
      textClass: "text-secondary",
      borderColor: "border-secondary/30",
      hoverBorder: "hover:border-secondary/40",
      iconBg: "bg-secondary/10",
      icon: Target,
      signup: "/auth/signup?type=client",
      buttonStyle:
        "bg-secondary text-white hover:bg-secondary-hover focus:ring-2 focus:ring-secondary/30",
    },
  ];

  return (
    <MarketingSection
      id="for-freelancers"
      title={t("landingPage.userTypes.title")}
      subtitle={t("landingPage.userTypes.subtitle")}
      background="default"
    >
      <Stagger className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {userTypes.map(
          ({
            key,
            textClass,
            borderColor,
            hoverBorder,
            iconBg,
            icon: Icon,
            signup,
            buttonStyle,
          }) => (
            <StaggerItem key={key}>
              <div
                className={`group relative rounded-2xl border-2 ${borderColor} ${hoverBorder} bg-background-secondary p-8 sm:p-10 
                         shadow-lg hover:shadow-xl
                         transition-[box-shadow,border-color] duration-200 
                         overflow-hidden`}
              >
                {/* Decorative corner accent */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 ${iconBg} rounded-full blur-3xl -mr-16 -mt-16 opacity-50`}
                ></div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mb-6`}
                  >
                    <Icon className={`w-8 h-8 ${textClass}`} />
                  </div>

                  <h3 className={`text-2xl font-bold mb-4 text-text-primary`}>
                    {t(`landingPage.userTypes.${key}.title`)}
                  </h3>
                  <p className="text-text-secondary mb-6 leading-relaxed font-medium">
                    {t(`landingPage.userTypes.${key}.description`)}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[0, 1, 2, 3].map((i) => (
                      <li
                        key={i}
                        className="flex items-start text-text-secondary"
                      >
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 mr-3 mt-0.5 rounded-full ${iconBg} ${textClass} font-bold text-sm shrink-0`}
                        >
                          <Check className="w-3 h-3" />
                        </span>
                        <span>
                          {t(`landingPage.userTypes.${key}.benefits.${i}`)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <button
                    onClick={() => router.push(signup)}
                    className={`inline-block px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg ${buttonStyle} 
                             transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                  >
                    {t(`landingPage.userTypes.${key}.joinButton`)}
                  </button>
                </div>
              </div>
            </StaggerItem>
          )
        )}
      </Stagger>
    </MarketingSection>
  );
}

"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function SuccessStoriesSection() {
  const { t } = useTranslationContext();

  const stories = [0, 1, 2];

  return (
    <section className="py-16 ">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t("freelancersPage.successStories.title")}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          {t("freelancersPage.successStories.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mr-4 text-white font-bold text-lg">
                  {t(`freelancersPage.successStories.stories.${i}.name`).charAt(
                    0
                  )}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t(`freelancersPage.successStories.stories.${i}.name`)}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t(`freelancersPage.successStories.stories.${i}.role`)}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {t(`freelancersPage.successStories.stories.${i}.quote`)}
              </p>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {t(`freelancersPage.successStories.stories.${i}.earnings`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

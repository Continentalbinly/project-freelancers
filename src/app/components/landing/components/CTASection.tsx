import Link from "next/link";

export default function CTASection({ t }: any) {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary to-secondary dark:from-gray-800 dark:to-gray-700">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          {t("landingPage.cta.title")}
        </h2>
        <p className="text-xl text-white/90 mb-8">
          {t("landingPage.cta.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup?type=freelancer"
            className="btn bg-white dark:bg-gray-200 text-primary hover:bg-gray-100 dark:hover:bg-gray-300 px-8 py-4 text-lg"
          >
            {t("landingPage.cta.startAsFreelancer")}
          </Link>
          <Link
            href="/auth/signup?type=client"
            className="btn bg-white dark:bg-gray-200 text-secondary hover:bg-gray-100 dark:hover:bg-gray-300 px-8 py-4 text-lg"
          >
            {t("landingPage.cta.startAsClient")}
          </Link>
        </div>
      </div>
    </section>
  );
}

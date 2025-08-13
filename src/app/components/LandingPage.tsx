import Link from "next/link";
import { useTranslationContext } from './LanguageProvider';
import { useEffect, useState } from 'react';
import { formatEarnings } from '@/service/currencyUtils';

interface PlatformStats {
  freelancers: number;
  clients: number;
  projects: number;
  totalEarned: number;
}

export default function LandingPage() {
  const { t } = useTranslationContext();
  const [stats, setStats] = useState<PlatformStats>({
    freelancers: 0,
    clients: 0,
    projects: 0,
    totalEarned: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch platform statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          console.error('Failed to fetch stats:', data.error);
        }
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light to-secondary-light py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              {t('landingPage.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-8 max-w-4xl mx-auto">
              {t('landingPage.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup?type=freelancer" className="btn btn-primary px-8 py-4 text-lg">
                {t('landingPage.hero.startEarning')}
              </Link>
              <Link href="/how-it-works" className="btn btn-outline px-8 py-4 text-lg">
                {t('landingPage.hero.learnHow')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('landingPage.howItWorks.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('landingPage.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('landingPage.howItWorks.step1.title')}</h3>
              <p className="text-text-secondary">
                {t('landingPage.howItWorks.step1.description')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('landingPage.howItWorks.step2.title')}</h3>
              <p className="text-text-secondary">
                {t('landingPage.howItWorks.step2.description')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('landingPage.howItWorks.step3.title')}</h3>
              <p className="text-text-secondary">
                {t('landingPage.howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('landingPage.features.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('landingPage.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">{t('landingPage.features.earnWhileLearn.title')}</h3>
              <p className="text-text-secondary">
                {t('landingPage.features.earnWhileLearn.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">{t('landingPage.features.buildPortfolio.title')}</h3>
              <p className="text-text-secondary">
                {t('landingPage.features.buildPortfolio.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">{t('landingPage.features.joinCommunity.title')}</h3>
              <p className="text-text-secondary">
                {t('landingPage.features.joinCommunity.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('landingPage.userTypes.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('landingPage.userTypes.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Freelancers Section */}
            <div className="bg-gradient-to-br from-primary-light to-primary/10 rounded-xl p-8 sm:p-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text-primary">{t('landingPage.userTypes.freelancers.title')}</h3>
              </div>
              <p className="text-text-secondary mb-6">
                {t('landingPage.userTypes.freelancers.description')}
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-text-secondary">
                  <svg className="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('landingPage.userTypes.freelancers.benefits.0')}
                </li>
                <li className="flex items-center text-text-secondary">
                  <svg className="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('landingPage.userTypes.freelancers.benefits.1')}
                </li>
                <li className="flex items-center text-text-secondary">
                  <svg className="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('landingPage.userTypes.freelancers.benefits.2')}
                </li>
                <li className="flex items-center text-text-secondary">
                  <svg className="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('landingPage.userTypes.freelancers.benefits.3')}
                </li>
              </ul>
              <Link href="/auth/signup?type=freelancer" className="btn btn-primary w-full sm:w-auto">
                {t('landingPage.userTypes.freelancers.joinButton')}
              </Link>
            </div>

            {/* Clients Section */}
            <div className="bg-gradient-to-br from-secondary-light to-secondary/10 rounded-xl p-8 sm:p-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h14-4h1m-1 4h1m-5 10v-5a1 1 0 11-1-1h2a1 1 0 011 1v5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text-primary">{t('landingPage.userTypes.clients.title')}</h3>
              </div>
              <p className="text-text-secondary mb-6">
                {t('landingPage.userTypes.clients.description')}
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-text-secondary">
                  <svg className="w-5 h-5 text-secondary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('landingPage.userTypes.clients.benefits.0')}
                </li>
                <li className="flex items-center text-text-secondary">
                  <svg className="w-5 h-5 text-secondary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('landingPage.userTypes.clients.benefits.1')}
                </li>
                <li className="flex items-center text-text-secondary">
                  <svg className="w-5 h-5 text-secondary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('landingPage.userTypes.clients.benefits.2')}
                </li>
                <li className="flex items-center text-text-secondary">
                  <svg className="w-5 h-5 text-secondary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('landingPage.userTypes.clients.benefits.3')}
                </li>
              </ul>
              <Link href="/auth/signup?type=client" className="btn btn-secondary w-full sm:w-auto">
                {t('landingPage.userTypes.clients.joinButton')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('landingPage.stats.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('landingPage.stats.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                {loadingStats ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  `${stats.freelancers}+`
                )}
              </div>
              <div className="text-text-secondary">{t('landingPage.stats.freelancers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-secondary mb-2">
                {loadingStats ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  `${stats.clients}+`
                )}
              </div>
              <div className="text-text-secondary">{t('landingPage.stats.clients')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-success mb-2">
                {loadingStats ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  `${stats.projects}+`
                )}
              </div>
              <div className="text-text-secondary">{t('landingPage.stats.projects')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-warning mb-2">
                {loadingStats ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  formatEarnings(stats.totalEarned)
                )}
              </div>
              <div className="text-text-secondary">{t('landingPage.stats.earned')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('landingPage.cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('landingPage.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?type=freelancer" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg">
              {t('landingPage.cta.startAsFreelancer')}
            </Link>
            <Link href="/auth/signup?type=client" className="btn bg-white text-secondary hover:bg-gray-100 px-8 py-4 text-lg">
              {t('landingPage.cta.startAsClient')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 
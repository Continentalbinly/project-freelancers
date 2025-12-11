'use client'

import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import { useEffect, useState } from 'react'
import { formatEarnings } from '@/service/currencyUtils'

interface ImpactStats {
  freelancers: number;
  clients: number;
  projects: number;
  totalEarned: number;
  completedProjects: number;
  activeProjects: number;
  totalBudget: number;
}

export default function AboutPage() {
  const { t } = useTranslationContext()
  const [impactStats, setImpactStats] = useState<ImpactStats>({
    freelancers: 0,
    clients: 0,
    projects: 0,
    totalEarned: 0,
    completedProjects: 0,
    activeProjects: 0,
    totalBudget: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch impact statistics
  useEffect(() => {
    const fetchImpactStats = async () => {
      try {
        setLoadingStats(true);
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
          setImpactStats(data.data);
        } else {
          //console.error('Failed to fetch impact stats:', data.error);
        }
      } catch (error) {
        //console.error('Error fetching impact statistics:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchImpactStats();
  }, []);

  return (
    <div className="bg-background ">
      {/* Hero Section */}
      <section className="bg-background-secondary py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('aboutPage.title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto">
              {t('aboutPage.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('aboutPage.mission.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('aboutPage.mission.paragraph1')}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('aboutPage.mission.paragraph2')}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t('aboutPage.mission.paragraph3')}
              </p>
            </div>
            <div className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('aboutPage.mission.values.title')}</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('aboutPage.mission.values.quality.title')}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{t('aboutPage.mission.values.quality.description')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold   mb-2">{t('aboutPage.mission.values.community.title')}</h4>
                    <p className="text-text-secondary">{t('aboutPage.mission.values.community.description')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold   mb-2">{t('aboutPage.mission.values.trust.title')}</h4>
                    <p className="text-text-secondary">{t('aboutPage.mission.values.trust.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('aboutPage.impact.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('aboutPage.impact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                {loadingStats ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  `${impactStats.freelancers}+`
                )}
              </div>
              <div className="text-gray-600 dark:text-gray-300">{t('aboutPage.impact.freelancers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-secondary mb-2">
                {loadingStats ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  `${impactStats.clients}+`
                )}
              </div>
              <div className="text-gray-600 dark:text-gray-300">{t('aboutPage.impact.clients')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-success mb-2">
                {loadingStats ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  `${impactStats.projects}+`
                )}
              </div>
              <div className="text-gray-600 dark:text-gray-300">{t('aboutPage.impact.projects')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-warning mb-2">
                {loadingStats ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  formatEarnings(impactStats.totalEarned)
                )}
              </div>
              <div className="text-gray-600 dark:text-gray-300">{t('aboutPage.impact.earned')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('aboutPage.team.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('aboutPage.team.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 - Anousone */}
            <div className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('aboutPage.team.members.anousone.name')}</h3>
              <p className="text-secondary font-medium mb-2">{t('aboutPage.team.members.anousone.role')}</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t('aboutPage.team.members.anousone.description')}
              </p>
            </div>

            {/* Team Member 2 - Thipphasone */}
            <div className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('aboutPage.team.members.thipphasone.name')}</h3>
              <p className="text-secondary font-medium mb-2">{t('aboutPage.team.members.thipphasone.role')}</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t('aboutPage.team.members.thipphasone.description')}
              </p>
            </div>

            {/* Team Member 3 - Thidaphone */}
            <div className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('aboutPage.team.members.thidaphone.name')}</h3>
              <p className="text-secondary font-medium mb-2">{t('aboutPage.team.members.thidaphone.role')}</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t('aboutPage.team.members.thidaphone.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('aboutPage.story.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('aboutPage.story.paragraph1')}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('aboutPage.story.paragraph2')}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t('aboutPage.story.paragraph3')}
              </p>
            </div>
            <div className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('aboutPage.story.beliefs.title')}</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-gray-600 dark:text-gray-300">{t('aboutPage.story.beliefs.belief1')}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                  <p className="text-gray-600 dark:text-gray-300">{t('aboutPage.story.beliefs.belief2')}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <p className="text-gray-600 dark:text-gray-300">{t('aboutPage.story.beliefs.belief3')}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                  <p className="text-gray-600 dark:text-gray-300">{t('aboutPage.story.beliefs.belief4')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('aboutPage.cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('aboutPage.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?type=freelancer" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg">
              {t('aboutPage.cta.joinAsFreelancer')}
            </Link>
            <Link href="/auth/signup?type=client" className="btn bg-white text-secondary hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg">
              {t('aboutPage.cta.joinAsClient')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 
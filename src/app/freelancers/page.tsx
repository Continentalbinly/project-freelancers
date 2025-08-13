'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore'
import { db } from '@/service/firebase'
import { formatEarnings } from '@/service/currencyUtils'
import { timeAgo } from '@/service/timeUtils'
import Avatar from '@/app/utils/avatarHandler'

export default function FreelancersPage() {
  const { t } = useTranslationContext()
  const [completedProjects, setCompletedProjects] = useState<any[]>([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)

  // Fetch completed projects for portfolio
  useEffect(() => {
    fetchCompletedProjects()
  }, [])

  const fetchCompletedProjects = async () => {
    try {
      setLoadingPortfolio(true)
      
      // Fetch projects with status 'completed' and has acceptedFreelancerId
      const projectsRef = collection(db, 'projects')
      const projectsQuery = query(
        projectsRef,
        where('status', '==', 'completed'),
        where('acceptedFreelancerId', '!=', null),
        orderBy('completedAt', 'desc'),
        limit(9)
      )
      
      const projectsSnap = await getDocs(projectsQuery)
      console.log('Found completed projects:', projectsSnap.docs.length)
      
      // Fetch freelancer profiles for each completed project
      const projectsWithFreelancers = await Promise.all(
        projectsSnap.docs.map(async (projectDoc) => {
          const projectData = projectDoc.data()
          console.log('Project data:', projectData.title, 'Freelancer ID:', projectData.acceptedFreelancerId)
          
          // Fetch freelancer profile
          let freelancerProfile: any = null
          if (projectData.acceptedFreelancerId) {
            // Try to get profile directly by document ID (which is the userId)
            try {
              const profileDocRef = doc(db, 'profiles', projectData.acceptedFreelancerId)
              const profileDocSnap = await getDoc(profileDocRef)
              if (profileDocSnap.exists()) {
                freelancerProfile = profileDocSnap.data()
                console.log('Freelancer profile found by ID:', freelancerProfile.fullName)
              } else {
                console.log('No profile found for ID:', projectData.acceptedFreelancerId)
              }
            } catch (error) {
              console.error('Error fetching profile:', error)
            }
          }
          
          return {
            id: projectDoc.id,
            ...projectData,
            freelancer: freelancerProfile,
            completedAt: projectData.completedAt?.toDate() || new Date()
          }
        })
      )
      
      console.log('Final projects with freelancers:', projectsWithFreelancers)
      setCompletedProjects(projectsWithFreelancers)
    } catch (error) {
      console.error('Error fetching completed projects:', error)
    } finally {
      setLoadingPortfolio(false)
    }
  }

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light to-primary py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              {t('freelancersPage.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-8 max-w-4xl mx-auto">
              {t('freelancersPage.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup?type=freelancer" className="btn btn-primary px-8 py-4 text-lg">
                {t('freelancersPage.hero.startEarning')}
              </Link>
              <Link href="/projects" className="btn btn-outline px-8 py-4 text-lg">
                {t('freelancersPage.hero.browseProjects')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('freelancersPage.portfolio.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('freelancersPage.portfolio.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingPortfolio ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg border border-border overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : completedProjects.length > 0 ? (
              // Real completed projects
              completedProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={project.imageUrl || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop"}
                      alt={`${project.title} Portfolio`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
                        <span className="text-sm font-semibold text-text-primary">{project.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('projects.statuses.completed')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {project.freelancer ? (
                          <Avatar
                            src={project.freelancer.avatarUrl}
                            alt={project.freelancer.fullName}
                            name={project.freelancer.fullName}
                            size="lg"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">F</span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-text-primary">
                          {project.freelancer?.fullName || 'Freelancer'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-success font-semibold">
                          {formatEarnings(project.budget)}
                        </span>
                        <div className="text-xs text-text-secondary">
                          {timeAgo(project.completedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // No completed projects message
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {t('freelancersPage.portfolio.noProjects')}
                </h3>
                <p className="text-text-secondary">
                  {t('freelancersPage.portfolio.noProjectsDesc')}
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link href="/projects" className="btn btn-primary px-8 py-3 text-lg">
              {t('freelancersPage.portfolio.viewMore')}
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('freelancersPage.howItWorks.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('freelancersPage.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('freelancersPage.howItWorks.steps.0.title')}</h3>
              <p className="text-text-secondary">
                {t('freelancersPage.howItWorks.steps.0.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('freelancersPage.howItWorks.steps.1.title')}</h3>
              <p className="text-text-secondary">
                {t('freelancersPage.howItWorks.steps.1.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('freelancersPage.howItWorks.steps.2.title')}</h3>
              <p className="text-text-secondary">
                {t('freelancersPage.howItWorks.steps.2.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('freelancersPage.benefits.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('freelancersPage.benefits.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('freelancersPage.benefits.features.0.title')}</h3>
              <p className="text-text-secondary">
                {t('freelancersPage.benefits.features.0.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('freelancersPage.benefits.features.1.title')}</h3>
              <p className="text-text-secondary">
                {t('freelancersPage.benefits.features.1.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="w-12 h-12 bg-warning-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('freelancersPage.benefits.features.2.title')}</h3>
              <p className="text-text-secondary">
                {t('freelancersPage.benefits.features.2.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="w-12 h-12 bg-info-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('freelancersPage.benefits.features.3.title')}</h3>
              <p className="text-text-secondary">
                {t('freelancersPage.benefits.features.3.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('freelancersPage.benefits.features.4.title')}</h3>
              <p className="text-text-secondary">
                {t('freelancersPage.benefits.features.4.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('freelancersPage.benefits.features.5.title')}</h3>
              <p className="text-text-secondary">
                {t('freelancersPage.benefits.features.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Skills */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('freelancersPage.popularSkills.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('freelancersPage.popularSkills.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-light rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{t('freelancersPage.popularSkills.skills.0.title')}</h3>
              <p className="text-text-secondary text-sm">{t('freelancersPage.popularSkills.skills.0.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-light rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{t('freelancersPage.popularSkills.skills.1.title')}</h3>
              <p className="text-text-secondary text-sm">{t('freelancersPage.popularSkills.skills.1.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success-light rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{t('freelancersPage.popularSkills.skills.2.title')}</h3>
              <p className="text-text-secondary text-sm">{t('freelancersPage.popularSkills.skills.2.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-warning-light rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{t('freelancersPage.popularSkills.skills.3.title')}</h3>
              <p className="text-text-secondary text-sm">{t('freelancersPage.popularSkills.skills.3.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('freelancersPage.successStories.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('freelancersPage.successStories.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">{t('freelancersPage.successStories.stories.0.name')}</h4>
                  <p className="text-sm text-text-secondary">{t('freelancersPage.successStories.stories.0.role')}</p>
                </div>
              </div>
              <p className="text-text-secondary mb-4">
                {t('freelancersPage.successStories.stories.0.quote')}
              </p>
              <div className="text-sm text-primary font-medium">{t('freelancersPage.successStories.stories.0.earnings')}</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">{t('freelancersPage.successStories.stories.1.name')}</h4>
                  <p className="text-sm text-text-secondary">{t('freelancersPage.successStories.stories.1.role')}</p>
                </div>
              </div>
              <p className="text-text-secondary mb-4">
                {t('freelancersPage.successStories.stories.1.quote')}
              </p>
              <div className="text-sm text-secondary font-medium">{t('freelancersPage.successStories.stories.1.earnings')}</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">A</span>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">{t('freelancersPage.successStories.stories.2.name')}</h4>
                  <p className="text-sm text-text-secondary">{t('freelancersPage.successStories.stories.2.role')}</p>
                </div>
              </div>
              <p className="text-text-secondary mb-4">
                {t('freelancersPage.successStories.stories.2.quote')}
              </p>
              <div className="text-sm text-success font-medium">{t('freelancersPage.successStories.stories.2.earnings')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('freelancersPage.cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('freelancersPage.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?type=freelancer" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg">
              {t('freelancersPage.cta.createProfile')}
            </Link>
            <Link href="/projects" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg">
              {t('freelancersPage.cta.browseProjects')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 
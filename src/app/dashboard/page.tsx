'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Avatar, { getAvatarProps } from '@/app/utils/avatarHandler'
import { timeAgo } from '@/service/timeUtils'
import { formatEarnings } from '@/service/currencyUtils'
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { db } from '@/service/firebase'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import en from '@/lib/i18n/en'
import lo from '@/lib/i18n/lo'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const { t, currentLanguage } = useTranslationContext()

  // Get the current translations object
  const translations = currentLanguage === 'lo' ? lo : en

  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalEarned: 0,
    totalSpent: 0,
    projectsCompleted: 0,
    proposalsSubmitted: 0,
    proposalsReceived: 0,
    rating: 0
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoadingActivity(true)

      if (!user) return

      // Fetch user's projects (as client or freelancer) - simplified query
      const projectsRef = collection(db, 'projects')
      const projectsQuery = query(projectsRef, orderBy('updatedAt', 'desc'), limit(20))
      const projectsSnap = await getDocs(projectsQuery)

      // Filter projects for current user client-side to avoid composite index issues
      const userProjects = projectsSnap.docs.filter(doc => {
        const data = doc.data()
        return data.clientId === user.uid || data.acceptedFreelancerId === user.uid
      })

      // Fetch user's proposals - simplified query without composite index
      const proposalsRef = collection(db, 'proposals')
      const proposalsQuery = query(proposalsRef, orderBy('createdAt', 'desc'), limit(20))
      const proposalsSnap = await getDocs(proposalsQuery)

      // Filter proposals for current user client-side
      const userProposals = proposalsSnap.docs.filter(doc => {
        const data = doc.data()
        return data.freelancerId === user.uid
      })

      // Process activities
      const activities: any[] = []

      // Add project activities
      userProjects.forEach(doc => {
        const data = doc.data()

        if (data.clientId === user.uid) {
          // User is the client
          activities.push({
            id: doc.id,
            type: 'project_created',
            title: data.title,
            description: t('dashboard.recentActivity.projectCreated').replace('{title}', data.title),
            amount: data.budget,
            date: data.createdAt?.toDate() || new Date(),
            status: data.status
          })

          if (data.status === 'completed') {
            activities.push({
              id: `${doc.id}_completed`,
              type: 'project_completed',
              title: data.title,
              description: `Completed project "${data.title}"`,
              amount: data.budget,
              date: data.updatedAt?.toDate() || new Date(),
              status: 'completed'
            })
          }
        }

        if (data.acceptedFreelancerId === user.uid) {
          // User is the freelancer
          activities.push({
            id: `${doc.id}_assigned`,
            type: 'project_assigned',
            title: data.title,
            description: t('dashboard.recentActivity.projectAssigned').replace('{title}', data.title),
            amount: data.budget,
            date: data.updatedAt?.toDate() || new Date(),
            status: data.status
          })

          if (data.status === 'completed') {
            activities.push({
              id: `${doc.id}_completed`,
              type: 'project_completed',
              title: data.title,
              description: `Completed project "${data.title}"`,
              amount: data.budget,
              date: data.updatedAt?.toDate() || new Date(),
              status: 'completed'
            })
          }
        }
      })

      // Add proposal activities
      userProposals.forEach(doc => {
        const data = doc.data()
        activities.push({
          id: doc.id,
          type: 'proposal_submitted',
          title: t('dashboard.recentActivity.proposalSubmitted').replace('{title}', data.projectTitle || 'Project'),
          description: t('dashboard.recentActivity.proposalSubmittedDescription').replace('{title}', data.projectTitle || 'project'),
          amount: data.budget,
          date: data.createdAt?.toDate() || new Date(),
          status: data.status
        })
      })

      // Sort by date and take recent 6
      activities.sort((a, b) => b.date.getTime() - a.date.getTime())
      setRecentActivity(activities.slice(0, 6))

      // Calculate stats for both freelancers and clients
      const activeProjects = userProjects.filter(doc => {
        const data = doc.data()
        return data.status === 'open' || data.status === 'in_progress'
      }).length

      const completedProjects = userProjects.filter(doc => {
        const data = doc.data()
        return data.status === 'completed'
      }).length

      // Calculate earnings (only for freelancers who completed projects)
      const totalEarned = userProjects.reduce((total, doc) => {
        const data = doc.data()
        if (data.status === 'completed' && data.acceptedFreelancerId === user.uid) {
          return total + (data.budget || 0)
        }
        return total
      }, 0)

      // Calculate spending (only for clients who completed projects)
      const totalSpent = userProjects.reduce((total, doc) => {
        const data = doc.data()
        if (data.status === 'completed' && data.clientId === user.uid) {
          return total + (data.budget || 0)
        }
        return total
      }, 0)

      // Calculate proposals received (for clients)
      const proposalsReceived = userProjects.reduce((total, doc) => {
        const data = doc.data()
        if (data.clientId === user.uid) {
          // This would need a separate query to get actual proposal count
          // For now, we'll use the proposalsCount field if available
          return total + (data.proposalsCount || 0)
        }
        return total
      }, 0)

      // Calculate rating based on user type
      let userRating = 0
      const userType = profile?.userType
      const isClient = Array.isArray(userType) ? userType.includes('client') : userType === 'client'
      const isFreelancer = Array.isArray(userType) ? userType.includes('freelancer') : userType === 'freelancer'

      if (isClient && !isFreelancer) {
        // For clients, we can use a different rating logic or show N/A
        // For now, we'll show the same rating field but with different context
        userRating = profile?.rating || 0
      } else if (isFreelancer) {
        // For freelancers, use the standard rating
        userRating = profile?.rating || 0
      } else {
        // For dual account users, show the freelancer rating as primary
        userRating = profile?.rating || 0
      }

      setStats({
        activeProjects,
        totalEarned,
        totalSpent,
        projectsCompleted: completedProjects,
        proposalsSubmitted: userProposals.length,
        proposalsReceived,
        rating: userRating
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoadingActivity(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">{t('dashboard.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_completed':
        return (
          <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'proposal_submitted':
        return (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'project_created':
      case 'project_assigned':
        return (
          <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10'
      case 'pending':
        return 'text-warning bg-warning/10'
      case 'in_progress':
        return 'text-secondary bg-secondary/10'
      case 'open':
        return 'text-primary bg-primary/10'
      default:
        return 'text-text-secondary bg-background-secondary'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-4 sm:gap-6">
            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-3 sm:gap-4 min-w-0 flex-1 text-center sm:text-left">
              <div className="flex-shrink-0">
                <Avatar {...getAvatarProps(profile, user)} size="xl" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary break-words leading-tight">
                  {t('dashboard.header.welcomeBack').replace('{name}', profile?.fullName || user.email?.split('@')[0] || '')}
                </h1>
                <p className="text-sm sm:text-base text-text-secondary mt-1 sm:mt-2">
                  {(() => {
                    const userType = profile?.userType;

                    if (Array.isArray(userType)) {
                      if (userType.length === 0) {
                        return t('dashboard.header.member');
                      } else if (userType.length === 1) {
                        return userType[0] === 'freelancer' ? t('dashboard.header.freelancer') : t('dashboard.header.client');
                      } else {
                        return userType.map(type => type === 'freelancer' ? t('dashboard.header.freelancer') : t('dashboard.header.client')).join(' & ');
                      }
                    } else if (typeof userType === 'string') {
                      return userType === 'freelancer' ? t('dashboard.header.freelancer') : t('dashboard.header.client');
                    } else {
                      return t('dashboard.header.member');
                    }
                  })()} • {profile?.email}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Link href="/projects" className="btn btn-primary text-center">
                {t('dashboard.header.browseProjects')}
              </Link>
              {(Array.isArray(profile?.userType) ? profile.userType.includes('client') : profile?.userType === 'client') && (
                <Link href="/projects/create" className="btn btn-secondary text-center">
                  {t('dashboard.header.postProject')}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">{t('dashboard.stats.activeProjects')}</p>
                <p className="text-xl sm:text-2xl font-bold text-text-primary">{stats.activeProjects}</p>
                <p className="text-xs text-success mt-1">{t('dashboard.stats.currentlyWorking')}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Earnings/Spent Card - Show both for dual account users */}
          {(() => {
            const userType = profile?.userType;
            const isClient = Array.isArray(userType) ? userType.includes('client') : userType === 'client';
            const isFreelancer = Array.isArray(userType) ? userType.includes('freelancer') : userType === 'freelancer';
            const hasBoth = isClient && isFreelancer;

            if (hasBoth) {
              // Show both cards for dual account users
              return (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-secondary">{t('dashboard.stats.totalEarned')}</p>
                        <p className="text-xl sm:text-2xl font-bold text-text-primary">{formatEarnings(stats.totalEarned)}</p>
                        <p className="text-xs text-success mt-1">{t('dashboard.stats.fromCompletedProjects')}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-secondary">{t('dashboard.stats.totalSpent')}</p>
                        <p className="text-xl sm:text-2xl font-bold text-text-primary">{formatEarnings(stats.totalSpent)}</p>
                        <p className="text-xs text-error mt-1">{t('dashboard.stats.onCompletedProjects')}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-error/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </>
              );
            } else {
              // Show single card for single account users
              return (
                <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">
                        {isClient ? t('dashboard.stats.totalSpent') : t('dashboard.stats.totalEarned')}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-text-primary">
                        {isClient ? formatEarnings(stats.totalSpent) : formatEarnings(stats.totalEarned)}
                      </p>
                      <p className="text-xs text-success mt-1">
                        {isClient ? t('dashboard.stats.onCompletedProjects') : t('dashboard.stats.fromCompletedProjects')}
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            }
          })()}

          <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">{t('dashboard.stats.completed')}</p>
                <p className="text-xl sm:text-2xl font-bold text-text-primary">{stats.projectsCompleted}</p>
                <p className="text-xs text-secondary mt-1">{t('dashboard.stats.projectsFinished')}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {(() => {
            const userType = profile?.userType;
            const isClient = Array.isArray(userType) ? userType.includes('client') : userType === 'client';
            const isFreelancer = Array.isArray(userType) ? userType.includes('freelancer') : userType === 'freelancer';
            const hasBoth = isClient && isFreelancer;

            // Determine rating label and context
            let ratingLabel = t('dashboard.stats.rating');
            let ratingContext = '★★★★☆';

            if (isClient && !isFreelancer) {
              ratingLabel = t('dashboard.stats.clientRating');
              ratingContext = t('dashboard.stats.asClient');
            } else if (isFreelancer && !isClient) {
              ratingLabel = t('dashboard.stats.freelancerRating');
              ratingContext = t('dashboard.stats.fromClients');
            } else if (hasBoth) {
              ratingLabel = t('dashboard.stats.overallRating');
              ratingContext = t('dashboard.stats.combinedRating');
            }

            return (
              <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">{ratingLabel}</p>
                    {stats.rating > 0 ? (
                      <p className="text-xl sm:text-2xl font-bold text-text-primary">{stats.rating}/5</p>
                    ) : (
                      <p className="text-xl sm:text-2xl font-bold text-text-secondary">{t('dashboard.stats.noRatingsYet')}</p>
                    )}
                    <p className="text-xs text-warning mt-1">{ratingContext}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">{t('dashboard.quickActions.title')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {(Array.isArray(profile?.userType) ? profile.userType.includes('freelancer') : profile?.userType === 'freelancer') && (
                  <>
                    <Link href="/projects" className="flex items-center p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all duration-200">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{t('dashboard.quickActions.findProjects.title')}</h3>
                        <p className="text-sm text-text-secondary">{t('dashboard.quickActions.findProjects.description')}</p>
                      </div>
                    </Link>

                    <Link href="/profile" className="flex items-center p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all duration-200">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{t('dashboard.quickActions.updateProfile.title')}</h3>
                        <p className="text-sm text-text-secondary">{t('dashboard.quickActions.updateProfile.description')}</p>
                      </div>
                    </Link>

                    <Link href="/proposals" className="flex items-center p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all duration-200">
                      <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{t('dashboard.quickActions.myProposals.title')}</h3>
                        <p className="text-sm text-text-secondary">{t('dashboard.quickActions.myProposals.description')}</p>
                      </div>
                    </Link>

                    <Link href="/messages" className="flex items-center p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all duration-200">
                      <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{t('dashboard.quickActions.messages.title')}</h3>
                        <p className="text-sm text-text-secondary">{t('dashboard.quickActions.messages.description')}</p>
                      </div>
                    </Link>
                  </>
                )}

                {(Array.isArray(profile?.userType) ? profile.userType.includes('client') : profile?.userType === 'client') && (
                  <>
                    <Link href="/projects/create" className="flex items-center p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all duration-200">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{t('dashboard.quickActions.postProject.title')}</h3>
                        <p className="text-sm text-text-secondary">{t('dashboard.quickActions.postProject.description')}</p>
                      </div>
                    </Link>

                    <Link href="/projects/manage" className="flex items-center p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all duration-200">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{t('dashboard.quickActions.manageProjects.title')}</h3>
                        <p className="text-sm text-text-secondary">{t('dashboard.quickActions.manageProjects.description')}</p>
                      </div>
                    </Link>

                    <Link href="/proposals?tab=received" className="flex items-center p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all duration-200">
                      <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{t('dashboard.quickActions.reviewProposals.title')}</h3>
                        <p className="text-sm text-text-secondary">{t('dashboard.quickActions.reviewProposals.description')}</p>
                      </div>
                    </Link>

                    <Link href="/messages" className="flex items-center p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all duration-200">
                      <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{t('dashboard.quickActions.messagesClient.title')}</h3>
                        <p className="text-sm text-text-secondary">{t('dashboard.quickActions.messagesClient.description')}</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">{t('dashboard.recentActivity.title')}</h2>
              {loadingActivity ? (
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-3 sm:p-4 rounded-lg border border-border animate-pulse">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg mr-3 sm:mr-4"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2">{t('dashboard.recentActivity.noActivity')}</h3>
                  <p className="text-sm sm:text-base text-text-secondary">{t('dashboard.recentActivity.noActivityDescription')}</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center p-3 sm:p-4 rounded-lg border border-border hover:shadow-sm transition-all duration-200">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-background-secondary rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary text-sm sm:text-base truncate">{activity.title}</h3>
                        <p className="text-xs sm:text-sm text-text-secondary line-clamp-2">{activity.description}</p>
                        <div className="flex flex-wrap items-center mt-2 gap-2 sm:gap-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-text-secondary">{timeAgo(activity.date, currentLanguage)}</span>
                          {activity.amount && (
                            <span className="text-xs font-medium text-success">{formatEarnings(activity.amount)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4">{t('dashboard.profileSummary.title')}</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-text-secondary">{t('dashboard.profileSummary.memberSince')}</span>
                  <span className="text-xs sm:text-sm font-medium text-text-primary">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-text-secondary">{t('dashboard.profileSummary.skills')}</span>
                  <span className="text-xs sm:text-sm font-medium text-text-primary">
                    {profile?.skills?.length || 0} skills
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-text-secondary">{t('dashboard.profileSummary.hourlyRate')}</span>
                  <span className="text-xs sm:text-sm font-medium text-text-primary">
                    {profile?.hourlyRate ? `${formatEarnings(Number(profile.hourlyRate))}/hr` : t('dashboard.profileSummary.notSet')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-text-secondary">{t('dashboard.profileSummary.location')}</span>
                  <span className="text-xs sm:text-sm font-medium text-text-primary">
                    {profile?.city && profile?.country ? `${profile.city}, ${profile.country}` : t('dashboard.profileSummary.notSet')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4">{t('dashboard.thisMonth.title')}</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-text-secondary">{t('dashboard.thisMonth.projectsCompleted')}</span>
                  <span className="text-xs sm:text-sm font-medium text-success">+{stats.projectsCompleted}</span>
                </div>

                {(() => {
                  const userType = profile?.userType;
                  const isClient = Array.isArray(userType) ? userType.includes('client') : userType === 'client';
                  const isFreelancer = Array.isArray(userType) ? userType.includes('freelancer') : userType === 'freelancer';
                  const hasBoth = isClient && isFreelancer;

                  if (hasBoth) {
                    // Show both earnings and spent for dual account users
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-text-secondary">{t('dashboard.thisMonth.earnings')}</span>
                          <span className="text-xs sm:text-sm font-medium text-success">+{formatEarnings(stats.totalEarned)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-text-secondary">{t('dashboard.thisMonth.spent')}</span>
                          <span className="text-xs sm:text-sm font-medium text-error">+{formatEarnings(stats.totalSpent)}</span>
                        </div>
                      </>
                    );
                  } else {
                    // Show single earnings/spent for single account users
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-text-secondary">
                          {isClient ? t('dashboard.thisMonth.spent') : t('dashboard.thisMonth.earnings')}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-success">
                          +{isClient ? formatEarnings(stats.totalSpent) : formatEarnings(stats.totalEarned)}
                        </span>
                      </div>
                    );
                  }
                })()}

                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-text-secondary">{t('dashboard.thisMonth.proposalsSent')}</span>
                  <span className="text-xs sm:text-sm font-medium text-primary">+{stats.proposalsSubmitted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-text-secondary">{t('dashboard.thisMonth.activeProjects')}</span>
                  <span className="text-xs sm:text-sm font-medium text-success">{stats.activeProjects}</span>
                </div>
              </div>
            </div>

            {/* Tips & Resources */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-4 sm:p-6 text-white">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('dashboard.tipsAndResources.title')}</h2>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm text-white/90">{t('dashboard.tipsAndResources.completeProfile')}</p>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm text-white/90">{t('dashboard.tipsAndResources.respondQuickly')}</p>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm text-white/90">{t('dashboard.tipsAndResources.buildPortfolio')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
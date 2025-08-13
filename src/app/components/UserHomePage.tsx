'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Avatar, { getAvatarProps } from '@/app/utils/avatarHandler'
import ProjectImage, { getProjectImageProps } from '@/app/utils/projectImageHandler'
import { formatEarnings } from '@/service/currencyUtils'
import { timeAgo } from '@/service/timeUtils'
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { db } from '@/service/firebase'
import FavoriteButton from '@/app/components/FavoriteButton'
import { useTranslationContext } from './LanguageProvider'

export default function UserHomePage() {
  const { t } = useTranslationContext()
  const { user, profile } = useAuth()
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Recent activity states
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loadingActivity, setLoadingActivity] = useState(true)
  
  // User stats states
  const [userStats, setUserStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    activeProjects: 0,
    projectsCompleted: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)

  const fetchRecentProjects = async () => {
    try {
      setLoadingProjects(true)
      const projectsRef = collection(db, 'projects')
      const q = query(projectsRef, orderBy('createdAt', 'desc'), limit(6))
      const querySnapshot = await getDocs(q)
      
      const projects = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data()
        
        // Fetch actual proposals count for this project
        const proposalsQuery = query(
          collection(db, 'proposals'),
          where('projectId', '==', doc.id)
        )
        const proposalsSnap = await getDocs(proposalsQuery)
        const actualProposalsCount = proposalsSnap.size
        
        return {
          id: doc.id,
          ...data,
          proposalsCount: actualProposalsCount, // Use actual count from proposals collection
          createdAt: data.createdAt?.toDate() || new Date()
        }
      }))
      
      setRecentProjects(projects)
    } catch (error) {
      console.error('Error fetching recent projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      setLoadingActivity(true)
      const activities: any[] = []
      
      if (!user) return
      
      // Get all projects and filter client-side to avoid composite index issues
      const projectsRef = collection(db, 'projects')
      const projectsQuery = query(projectsRef, orderBy('updatedAt', 'desc'), limit(20))
      const projectsSnap = await getDocs(projectsQuery)
      
      // Filter projects where user is client or freelancer
      const userProjects = projectsSnap.docs.filter(doc => {
        const data = doc.data()
        return data.clientId === user.uid || data.acceptedFreelancerId === user.uid
      })
      
      // Calculate user stats from projects
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
      
      setUserStats({
        totalEarned,
        totalSpent,
        activeProjects,
        projectsCompleted: completedProjects
      })
      
      // Process client projects
      userProjects.forEach(doc => {
        const data = doc.data()
        
        if (data.clientId === user.uid) {
          // User is the client
          const activity = {
            id: doc.id,
            type: 'project_created',
            title: data.title,
            status: data.status,
            timestamp: data.createdAt?.toDate() || new Date(),
            projectId: doc.id
          }
          activities.push(activity)
          
          // Add completion activities
          if (data.clientCompleted && data.clientCompleted.completedAt) {
            activities.push({
              id: `${doc.id}_client_completed`,
              type: 'project_completed',
              title: data.title,
              status: 'completed',
              timestamp: data.clientCompleted.completedAt.toDate(),
              projectId: doc.id,
              role: 'client'
            })
          }
        }
        
        if (data.acceptedFreelancerId === user.uid) {
          // User is the freelancer
          const activity = {
            id: `${doc.id}_assigned`,
            type: 'project_assigned',
            title: data.title,
            status: data.status,
            timestamp: data.updatedAt?.toDate() || new Date(),
            projectId: doc.id
          }
          activities.push(activity)
          
          // Add completion activities
          if (data.freelancerCompleted && data.freelancerCompleted.completedAt) {
            activities.push({
              id: `${doc.id}_freelancer_completed`,
              type: 'project_completed',
              title: data.title,
              status: 'completed',
              timestamp: data.freelancerCompleted.completedAt.toDate(),
              projectId: doc.id,
              role: 'freelancer'
            })
          }
        }
      })
      
      // Get user's proposals - use simple query without composite index
      const proposalsRef = collection(db, 'proposals')
      const proposalsQuery = query(proposalsRef, orderBy('createdAt', 'desc'), limit(10))
      const proposalsSnap = await getDocs(proposalsQuery)
      
      // Filter proposals for current user
      const userProposals = proposalsSnap.docs.filter(doc => {
        const data = doc.data()
        return data.freelancerId === user.uid
      })
      
      // Add proposal activities
      userProposals.forEach(doc => {
        const data = doc.data()
        activities.push({
          id: doc.id,
          type: 'proposal_submitted',
                      title: `${t('userHomePage.recentActivity.proposalSubmitted').replace('{title}', data.projectTitle || 'Project')}`,
          status: data.status,
          timestamp: data.createdAt?.toDate() || new Date(),
          projectId: data.projectId
        })
      })
      
      // Sort by timestamp and take the most recent 6
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setRecentActivity(activities.slice(0, 6))
      
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      // Set empty array on error to avoid breaking the UI
      setRecentActivity([])
    } finally {
      setLoadingActivity(false)
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchRecentProjects()
    fetchRecentActivity()
  }, [user])

  const formatBudget = (budget: number, budgetType: string) => {
    if (budgetType === 'hourly') {
      return `₭${Number(budget).toLocaleString()}${t('userHomePage.recentProjects.projectCard.perHour')}`
    }
    return `₭${Number(budget).toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-success/10 text-success',
      in_progress: 'bg-warning/10 text-warning',
      completed: 'bg-primary/10 text-primary',
      cancelled: 'bg-error/10 text-error'
    }
    return colors[status as keyof typeof colors] || 'bg-background-secondary text-text-secondary'
  }

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      open: t('userHomePage.filters.statusOptions.open'),
      in_progress: t('userHomePage.filters.statusOptions.inProgress'),
      completed: t('userHomePage.filters.statusOptions.completed'),
      cancelled: t('userHomePage.filters.statusOptions.cancelled')
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  const getActivityIcon = (type: string) => {
    const icons = {
      project_created: '📝',
      project_assigned: '✅',
      project_completed: '🎉',
      proposal_submitted: '📋'
    }
    return icons[type as keyof typeof icons] || '📊'
  }

  const getActivityColor = (type: string) => {
    const colors = {
      project_created: 'bg-primary-light',
      project_assigned: 'bg-success-light',
      project_completed: 'bg-warning-light',
      proposal_submitted: 'bg-secondary-light'
    }
    return colors[type as keyof typeof colors] || 'bg-background-secondary'
  }

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'project_created':
        return `${t('userHomePage.recentActivity.projectCreated').replace('{title}', activity.title)}`
      case 'project_assigned':
        return `${t('userHomePage.recentActivity.projectAssigned').replace('{title}', activity.title)}`
      case 'project_completed':
        return `${t('userHomePage.recentActivity.projectCompleted').replace('{title}', activity.title)}`
      case 'proposal_submitted':
        return activity.title
      default:
        return activity.title
    }
  }

  const categories = [
    { value: 'all', label: t('userHomePage.filters.allCategories') },
    { value: 'web-development', label: t('userHomePage.filters.categories.webDevelopment') },
    { value: 'content-writing', label: t('userHomePage.filters.categories.contentWriting') },
    { value: 'data-analysis', label: t('userHomePage.filters.categories.dataAnalysis') },
    { value: 'design', label: t('userHomePage.filters.categories.design') },
    { value: 'research', label: t('userHomePage.filters.categories.research') },
    { value: 'translation', label: t('userHomePage.filters.categories.translation') }
  ]

  const budgetRanges = [
    { value: 'all', label: t('userHomePage.filters.allBudgets') },
    { value: '0-50000', label: '₭0 - ₭50K' },
    { value: '50000-200000', label: '₭50K - ₭200K' },
    { value: '200000-500000', label: '₭200K - ₭500K' },
    { value: '500000+', label: '₭500K+' }
  ]

  const statusOptions = [
    { value: 'all', label: t('userHomePage.filters.allStatus') },
    { value: 'open', label: t('userHomePage.filters.statusOptions.open') },
    { value: 'in_progress', label: t('userHomePage.filters.statusOptions.inProgress') },
    { value: 'completed', label: t('userHomePage.filters.statusOptions.completed') }
  ]

  const quickActions = [
    {
              title: t('userHomePage.quickActions.dashboard.title'),
        description: t('userHomePage.quickActions.dashboard.description'),
      icon: '📊',
      href: '/dashboard',
      color: 'bg-primary-light',
      showFor: ['all']
    },
    {
              title: t('userHomePage.quickActions.findProjects.title'),
        description: t('userHomePage.quickActions.findProjects.description'),
      icon: '🔍',
      href: '/projects',
      color: 'bg-secondary-light',
      showFor: ['freelancer', 'all']
    },
    {
              title: t('userHomePage.quickActions.postProject.title'),
        description: t('userHomePage.quickActions.postProject.description'),
      icon: '📝',
      href: '/projects/create',
      color: 'bg-success/10',
      showFor: ['client', 'all']
    },
    {
              title: t('userHomePage.quickActions.myProposals.title'),
        description: t('userHomePage.quickActions.myProposals.description'),
      icon: '📋',
      href: '/proposals',
      color: 'bg-warning/10',
      showFor: ['freelancer', 'all']
    },
    {
              title: t('userHomePage.quickActions.manageProjects.title'),
        description: t('userHomePage.quickActions.manageProjects.description'),
      icon: '📁',
      href: '/projects/manage',
      color: 'bg-info/10',
      showFor: ['client', 'all']
    },
    {
              title: t('userHomePage.quickActions.reviewProposals.title'),
        description: t('userHomePage.quickActions.reviewProposals.description'),
      icon: '📋',
      href: '/proposals/received',
      color: 'bg-purple/10',
      showFor: ['client', 'all']
    }
  ]

  return (
    <div className="bg-background-secondary min-h-screen">
      {/* Header Section */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-4 sm:gap-6">
            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-3 sm:gap-4 min-w-0 flex-1 text-center sm:text-left">
              <div className="flex-shrink-0">
                <Avatar {...getAvatarProps(profile, user)} size="lg" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary break-words leading-tight">
                  {t('userHomePage.header.welcomeBack').replace('{name}', profile?.fullName || user?.email?.split('@')[0] || '')}
                </h1>
                <p className="text-sm sm:text-base text-text-secondary mt-1 sm:mt-2">
                  {(() => {
                    // Handle userType as array (new system) or string (old system)
                    const userType = profile?.userType;
                    
                    if (Array.isArray(userType)) {
                      // New system: userType is an array
                      if (userType.length === 0) {
                        return t('userHomePage.header.member');
                      } else if (userType.length === 1) {
                        return userType[0] === 'freelancer' ? t('userHomePage.header.freelancer') : t('userHomePage.header.client');
                      } else {
                        return userType.map(type => type === 'freelancer' ? t('userHomePage.header.freelancer') : t('userHomePage.header.client')).join(' & ');
                      }
                    } else if (typeof userType === 'string') {
                      // Old system: userType is a string
                      return userType === 'freelancer' ? t('userHomePage.header.freelancer') : t('userHomePage.header.client');
                    } else {
                      return t('userHomePage.header.member');
                    }
                  })()}
                </p>
                
                <div className="mt-2 sm:mt-3">
                                      <Link href="/dashboard" className="text-primary hover:text-primary-hover font-medium text-sm">
                      {t('userHomePage.header.viewDashboard')} →
                    </Link>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-3 sm:gap-4 text-xs sm:text-sm w-full lg:w-auto lg:self-end">
                              <div className="text-center min-w-[60px] sm:min-w-[70px]">
                  <div className="text-lg sm:text-xl font-bold text-primary">{userStats.activeProjects}</div>
                  <div className="text-text-secondary text-xs">{t('userHomePage.stats.active')}</div>
                </div>
                <div className="text-center min-w-[60px] sm:min-w-[70px]">
                  <div className="text-lg sm:text-xl font-bold text-success">{userStats.projectsCompleted}</div>
                  <div className="text-text-secondary text-xs">{t('userHomePage.stats.completed')}</div>
                </div>
              {(() => {
                const userType = profile?.userType;
                const isClient = Array.isArray(userType) ? userType.includes('client') : userType === 'client';
                const isFreelancer = Array.isArray(userType) ? userType.includes('freelancer') : userType === 'freelancer';
                const hasBoth = isClient && isFreelancer;
                
                if (hasBoth) {
                  // Show both earned and spent for dual account users
                  return (
                    <>
                                              <div className="text-center min-w-[60px] sm:min-w-[70px]">
                          <div className="text-lg sm:text-xl font-bold text-success">{formatEarnings(userStats.totalEarned)}</div>
                          <div className="text-text-secondary text-xs">{t('userHomePage.stats.earned')}</div>
                        </div>
                        <div className="text-center min-w-[60px] sm:min-w-[70px]">
                          <div className="text-lg sm:text-xl font-bold text-error">{formatEarnings(userStats.totalSpent)}</div>
                          <div className="text-text-secondary text-xs">{t('userHomePage.stats.spent')}</div>
                        </div>
                    </>
                  );
                } else {
                  // Show single earned/spent for single account users
                  return (
                    <div className="text-center min-w-[60px] sm:min-w-[70px]">
                      <div className="text-lg sm:text-xl font-bold text-secondary">
                        {formatEarnings(isClient ? userStats.totalSpent : userStats.totalEarned)}
                      </div>
                                              <div className="text-text-secondary text-xs">
                          {isClient ? t('userHomePage.stats.spent') : t('userHomePage.stats.earned')}
                        </div>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Section */}
        <div 
          id="search-section"
          className="bg-white rounded-lg shadow-sm border border-border p-6 mb-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
                    {t('userHomePage.search.title')}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {t('userHomePage.search.subtitle')}
                  </p>
              </div>
              
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white text-text-primary border-border hover:border-primary'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                <span className="text-sm font-medium">{t('userHomePage.search.filters')}</span>
                <span className={`w-2 h-2 rounded-full transition-colors ${
                  showFilters ? 'bg-white' : 'bg-primary'
                }`}></span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('userHomePage.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
              <Link 
                href={`/projects?search=${searchQuery}&category=${selectedCategory}&budget=${selectedBudget}&status=${selectedStatus}`}
                className="btn btn-primary px-6 py-3 whitespace-nowrap"
              >
                {t('userHomePage.search.searchButton')}
              </Link>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-border pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">{t('userHomePage.filters.category')}</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget Filter */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">{t('userHomePage.filters.budgetRange')}</label>
                    <select
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                      {budgetRanges.map((budget) => (
                        <option key={budget.value} value={budget.value}>
                          {budget.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">{t('userHomePage.filters.status')}</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSelectedCategory('all')
                        setSelectedBudget('all')
                        setSelectedStatus('all')
                        setSearchQuery('')
                      }}
                      className="w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg hover:border-primary transition-colors"
                    >
                      {t('userHomePage.filters.clearFilters')}
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(selectedCategory !== 'all' || selectedBudget !== 'all' || selectedStatus !== 'all' || searchQuery) && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light text-primary text-sm rounded-full">
                                                     {t('userHomePage.search.searchButton')}: "{searchQuery}"
                          <button
                            onClick={() => setSearchQuery('')}
                            className="ml-1 hover:text-primary-hover"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {selectedCategory !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-light text-secondary text-sm rounded-full">
                          {categories.find(c => c.value === selectedCategory)?.label}
                          <button
                            onClick={() => setSelectedCategory('all')}
                            className="ml-1 hover:text-secondary-hover"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {selectedBudget !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-success-light text-success text-sm rounded-full">
                          {budgetRanges.find(b => b.value === selectedBudget)?.label}
                          <button
                            onClick={() => setSelectedBudget('all')}
                            className="ml-1 hover:text-success-hover"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {selectedStatus !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning-light text-warning text-sm rounded-full">
                          {statusOptions.find(s => s.value === selectedStatus)?.label}
                          <button
                            onClick={() => setSelectedStatus('all')}
                            className="ml-1 hover:text-warning-hover"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">{t('userHomePage.quickActions.title')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(() => {
                  const userType = profile?.userType;
                  const isClient = Array.isArray(userType) ? userType.includes('client') : userType === 'client';
                  const isFreelancer = Array.isArray(userType) ? userType.includes('freelancer') : userType === 'freelancer';
                  
                  // Filter actions based on user type
                  const filteredActions = quickActions.filter(action => {
                    if (action.showFor.includes('all')) return true;
                    if (isClient && action.showFor.includes('client')) return true;
                    if (isFreelancer && action.showFor.includes('freelancer')) return true;
                    return false;
                  });
                  
                  return filteredActions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className="flex items-center p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
                    >
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mr-4 text-2xl`}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{action.title}</h3>
                        <p className="text-sm text-text-secondary">{action.description}</p>
                      </div>
                    </Link>
                  ));
                })()}
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary">{t('userHomePage.recentProjects.title')}</h2>
                <Link href="/projects" className="text-primary hover:text-primary-hover font-medium">
                  {t('userHomePage.recentProjects.viewAll')}
                </Link>
              </div>
              
              {loadingProjects ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded mb-2 w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-gray-200 rounded mb-1 w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{t('userHomePage.recentProjects.noProjects')}</h3>
                  <p className="text-text-secondary">{t('userHomePage.recentProjects.noProjectsDescription')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl shadow-lg border border-border overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 h-full">
                      {/* Project Image */}
                      <div className="relative aspect-video overflow-hidden">
                        <ProjectImage 
                          {...getProjectImageProps(project)} 
                          size="full"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Project Content */}
                      <div className="p-4 sm:p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                              {project.title}
                            </h3>
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                {getStatusLabel(project.status)}
                              </span>
                                                              <span className="text-xs text-text-secondary">
                                  {project.views} {t('userHomePage.recentProjects.projectCard.views')}
                                </span>
                            </div>
                          </div>
                          <FavoriteButton 
                            projectId={project.id} 
                            size="md" 
                            className="ml-2 flex-shrink-0"
                            isProjectOwner={user?.uid === project.clientId}
                          />
                        </div>
                        
                        {/* Project Description */}
                        <p className="text-text-secondary text-sm mb-3 line-clamp-3 flex-1">{project.description}</p>
                        
                        {/* Project Details */}
                        <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                          <span>•</span>
                          <span>{timeAgo(project.createdAt)}</span>
                        </div>
                        
                        {/* Budget and Skills */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="text-lg font-bold text-primary">{formatBudget(project.budget, project.budgetType)}</div>
                            <div className="text-sm text-text-secondary">{t('userHomePage.recentProjects.projectCard.budget')}</div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {project.skillsRequired.slice(0, 3).map((skill: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {project.skillsRequired.length > 3 && (
                                                              <span className="px-2 py-1 bg-background-secondary text-text-secondary text-xs rounded-full">
                                  +{project.skillsRequired.length - 3} {t('userHomePage.recentProjects.projectCard.moreSkills').replace('{count}', (project.skillsRequired.length - 3).toString())}
                                </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                          <Link 
                            href={`/projects/${project.id}`}
                            className="btn btn-primary text-sm px-4 py-2 flex-1 text-center"
                          >
                            {t('userHomePage.recentProjects.projectCard.viewDetails')}
                          </Link>
                          {project.status === 'open' && project.clientId !== user?.uid && (
                            <Link 
                              href={`/projects/${project.id}/propose`}
                              className="btn btn-outline text-sm px-4 py-2 flex-1 text-center"
                            >
                              {t('userHomePage.recentProjects.projectCard.applyNow')}
                            </Link>
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
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="font-semibold text-text-primary mb-4">{t('userHomePage.profileSummary.title')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    {(() => {
                      const userType = profile?.userType;
                      const isClient = Array.isArray(userType) ? userType.includes('client') : userType === 'client';
                      const isFreelancer = Array.isArray(userType) ? userType.includes('freelancer') : userType === 'freelancer';
                      
                                              if (isClient && !isFreelancer) {
                          return t('userHomePage.profileSummary.clientRating');
                        } else if (isFreelancer && !isClient) {
                          return t('userHomePage.profileSummary.freelancerRating');
                        } else {
                          return t('userHomePage.profileSummary.rating');
                        }
                    })()}
                  </span>
                  <span className="font-medium">
                    {(() => {
                      const rating = profile?.rating || 0;
                      return rating > 0 ? `${rating}/5 ⭐` : t('userHomePage.profileSummary.noRatingsYet');
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                                      <span className="text-text-secondary">{t('userHomePage.profileSummary.projectsCompleted')}</span>
                  <span className="font-medium">{userStats.projectsCompleted}</span>
                </div>
                {(() => {
                  const userType = profile?.userType;
                  const isClient = Array.isArray(userType) ? userType.includes('client') : userType === 'client';
                  const isFreelancer = Array.isArray(userType) ? userType.includes('freelancer') : userType === 'freelancer';
                  const hasBoth = isClient && isFreelancer;
                  
                  if (hasBoth) {
                    // Show both earned and spent for dual account users
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">{t('userHomePage.profileSummary.totalEarned')}</span>
                          <span className="font-medium">{formatEarnings(userStats.totalEarned)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">{t('userHomePage.profileSummary.totalSpent')}</span>
                          <span className="font-medium">{formatEarnings(userStats.totalSpent)}</span>
                        </div>
                      </>
                    );
                  } else {
                    // Show single earned/spent for single account users
                    return (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          {isClient ? t('userHomePage.profileSummary.totalSpent') : t('userHomePage.profileSummary.totalEarned')}
                        </span>
                        <span className="font-medium">
                          {formatEarnings(isClient ? userStats.totalSpent : userStats.totalEarned)}
                        </span>
                      </div>
                    );
                  }
                })()}
                <div className="flex justify-between">
                                      <span className="text-text-secondary">{t('userHomePage.profileSummary.activeProjects')}</span>
                  <span className="font-medium">{userStats.activeProjects}</span>
                </div>
              </div>
              <Link href="/profile" className="btn btn-outline w-full mt-4">{t('userHomePage.profileSummary.editProfile')}</Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="font-semibold text-text-primary mb-4">{t('userHomePage.recentActivity.title')}</h3>
              <div className="space-y-3">
                {loadingActivity ? (
                  // Loading state
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-1 w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : recentActivity.length === 0 ? (
                  // Empty state
                  <div className="text-center py-4">
                    <div className="w-8 h-8 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-text-secondary">{t('userHomePage.recentActivity.noActivity')}</p>
                    <p className="text-xs text-text-secondary mt-1">{t('userHomePage.recentActivity.noActivityDescription')}</p>
                  </div>
                ) : (
                  // Activity list
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-sm text-text-primary">{getActivityIcon(activity.type)}</span>
                          <span className="ml-2 text-sm text-text-primary">{getActivityText(activity)}</span>
                        </div>
                        <p className="text-xs text-text-secondary">
                          {timeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-primary-light to-secondary-light rounded-lg p-6">
                              <h3 className="font-semibold text-text-primary mb-3">{t('userHomePage.quickTips.title')}</h3>
              <ul className="text-sm text-text-secondary space-y-2">
                {(() => {
                  const userType = profile?.userType;
                  const isClient = Array.isArray(userType) ? userType.includes('client') : userType === 'client';
                  const isFreelancer = Array.isArray(userType) ? userType.includes('freelancer') : userType === 'freelancer';
                  
                  if (isClient && !isFreelancer) {
                    // Client-only tips
                    return (
                      <>
                        <li>• {t('userHomePage.quickTips.clientTips.tip1')}</li>
                        <li>• {t('userHomePage.quickTips.clientTips.tip2')}</li>
                        <li>• {t('userHomePage.quickTips.clientTips.tip3')}</li>
                        <li>• {t('userHomePage.quickTips.clientTips.tip4')}</li>
                      </>
                    );
                  } else if (isFreelancer && !isClient) {
                    // Freelancer-only tips
                    return (
                      <>
                        <li>• {t('userHomePage.quickTips.freelancerTips.tip1')}</li>
                        <li>• {t('userHomePage.quickTips.freelancerTips.tip2')}</li>
                        <li>• {t('userHomePage.quickTips.freelancerTips.tip3')}</li>
                        <li>• {t('userHomePage.quickTips.freelancerTips.tip4')}</li>
                      </>
                    );
                  } else {
                    // Dual account or general tips
                    return (
                      <>
                        <li>• {t('userHomePage.quickTips.generalTips.tip1')}</li>
                        <li>• {t('userHomePage.quickTips.generalTips.tip2')}</li>
                        <li>• {t('userHomePage.quickTips.generalTips.tip3')}</li>
                        <li>• {t('userHomePage.quickTips.generalTips.tip4')}</li>
                      </>
                    );
                  }
                })()}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
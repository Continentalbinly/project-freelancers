'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import Link from 'next/link'
import { collection, query, orderBy, getDocs, where, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/service/firebase'
import { formatEarnings } from '@/service/currencyUtils'
import { timeAgo } from '@/service/timeUtils'
import { ChevronLeftIcon, EyeIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

interface Project {
  id: string
  title: string
  description: string
  budget: number
  budgetType: 'fixed' | 'hourly'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  category: string
  skillsRequired: string[]
  createdAt: any
  updatedAt: any
  proposalsCount?: number
  views?: number
  acceptedFreelancerId?: string
  clientId: string
}

export default function ManageProjectsPage() {
  const { t } = useTranslationContext()
  const { user, profile } = useAuth()
  const router = useRouter()
  // Block if only freelancer
  const shouldBlock = Array.isArray(profile?.userType) ? (profile.userType.length === 1 && profile.userType[0] === 'freelancer') : profile?.userType === 'freelancer'
  useEffect(() => {
    if (shouldBlock) {
      const timeout = setTimeout(() => {
        router.push('/')
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [shouldBlock, router])
  if (shouldBlock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-secondary">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-border">
          <h2 className="text-xl font-bold text-text-primary mb-4">{t('createProject.permissionDenied')}</h2>
          <p className="text-text-secondary mb-6">{t('createProject.permissionDeniedMessage')}</p>
          <p className="text-xs text-text-secondary mt-4">{t('createProject.redirecting')}</p>
        </div>
      </div>
    )
  }
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  // Check if user is a client
  useEffect(() => {
    if (user && profile) {
      const userType = profile.userType
      const isClient = Array.isArray(userType) ? userType.includes('client') : userType === 'client'

      if (!isClient) {
        router.push('/projects')
      }
    }
  }, [user, profile, router])

  // Fetch user's projects
  useEffect(() => {
    if (user) {
      fetchUserProjects()
    }
  }, [user])

  const fetchUserProjects = async () => {
    try {
      setLoadingProjects(true)

      if (!user) return

      // Fetch projects where user is the client
      const projectsRef = collection(db, 'projects')
      const projectsQuery = query(
        projectsRef,
        where('clientId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const projectsSnap = await getDocs(projectsQuery)

      const projectsData = await Promise.all(projectsSnap.docs.map(async (doc) => {
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
          proposalsCount: actualProposalsCount,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Project
      }))

      setProjects(projectsData)
    } catch (error) {
      console.error('Error fetching user projects:', error)
    } finally {
      setLoadingProjects(false)
    }
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
      open: t('manageProjects.open'),
      in_progress: t('manageProjects.inProgress'),
      completed: t('manageProjects.completed'),
      cancelled: t('manageProjects.cancelled')
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  const formatBudget = (budget: number, budgetType: string) => {
    if (budgetType === 'hourly') {
      return `₭${budget.toLocaleString()}/hr`
    }
    return `₭${budget.toLocaleString()}`
  }

  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesCategory && matchesSearch
  })

  const categories = [
    { value: 'all', label: t('manageProjects.allCategories') },
    { value: 'web-development', label: t('manageProjects.webDevelopment') },
    { value: 'content-writing', label: t('manageProjects.contentWriting') },
    { value: 'data-analysis', label: t('manageProjects.dataAnalysis') },
    { value: 'design', label: t('manageProjects.design') },
    { value: 'research', label: t('manageProjects.research') },
    { value: 'translation', label: t('manageProjects.translation') }
  ]

  const statusOptions = [
    { value: 'all', label: t('manageProjects.allStatus') },
    { value: 'open', label: t('manageProjects.open') },
    { value: 'in_progress', label: t('manageProjects.inProgress') },
    { value: 'completed', label: t('manageProjects.completed') },
    { value: 'cancelled', label: t('manageProjects.cancelled') }
  ]

  if (loadingProjects) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">{t('manageProjects.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button suppressHydrationWarning
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-white shadow-sm border border-border hover:shadow-md transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5 text-text-primary" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('manageProjects.manageProjects')}</h1>
              <p className="text-text-secondary">{t('manageProjects.manageProjectsDesc')}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/projects/create" className="btn btn-primary">
                <PlusIcon className="w-5 h-5 mr-2" />
                {t('manageProjects.postNewProject')}
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">{t('manageProjects.searchProjects')}</label>
              <input suppressHydrationWarning
                type="text"
                placeholder={t('manageProjects.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">{t('manageProjects.status')}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">{t('manageProjects.category')}</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-text-primary">
              {t('manageProjects.yourProjects')} ({filteredProjects.length})
            </h2>
          </div>

          <div className="p-6">
            {loadingProjects ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-border rounded-lg p-6 animate-pulse">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                          <div className="h-6 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-6 bg-gray-200 rounded mb-1 w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{t('manageProjects.noProjectsFound')}</h3>
                <p className="text-text-secondary mb-6">
                  {projects.length === 0
                    ? t('manageProjects.noProjectsYet')
                    : t('manageProjects.noProjectsMatch')
                  }
                </p>
                {projects.length === 0 && (
                  <Link href="/projects/create" className="btn btn-primary">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    {t('manageProjects.postFirstProject')}
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="border border-border rounded-lg p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text-primary mb-2">{project.title}</h3>
                        <p className="text-text-secondary text-sm mb-3 line-clamp-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusLabel(project.status)}
                          </span>
                          <span className="text-text-secondary">
                            {project.views || 0} {t('manageProjects.views')}
                          </span>
                          <span className="text-text-secondary">
                            {project.proposalsCount || 0} {t('manageProjects.proposals')}
                          </span>
                          <span className="text-text-secondary">
                            {timeAgo(project.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-primary mb-1">
                          {formatBudget(project.budget, project.budgetType)}
                        </div>
                        <div className="text-sm text-text-secondary">{t('manageProjects.budget')}</div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.skillsRequired.slice(0, 5).map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {project.skillsRequired.length > 5 && (
                          <span className="px-2 py-1 bg-background-secondary text-text-secondary text-xs rounded-full">
                            +{project.skillsRequired.length - 5} {t('manageProjects.more')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                        >
                          <EyeIcon className="w-4 h-4" />
                          {t('manageProjects.viewDetails')}
                        </Link>
                        {project.status === 'open' && (
                          <Link
                            href={`/projects/${project.id}/edit`}
                            className="flex items-center gap-2 text-sm text-secondary hover:text-secondary-dark font-medium"
                          >
                            <PencilIcon className="w-4 h-4" />
                            {t('manageProjects.editProject')}
                          </Link>
                        )}
                        {project.status === 'open' && (
                          <Link
                            href={`/projects/${project.id}/proposals`}
                            className="flex items-center gap-2 text-sm text-success hover:text-success-dark font-medium"
                          >
                            <PencilIcon className="w-4 h-4" />
                            {t('manageProjects.viewProposals')} ({project.proposalsCount || 0})
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {project.status === 'open' && (
                          <button suppressHydrationWarning className="flex items-center gap-2 text-sm text-error hover:text-error-dark font-medium">
                            <TrashIcon className="w-4 h-4" />
                            {t('manageProjects.cancelProject')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
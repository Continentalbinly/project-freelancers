'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { collection, query, orderBy, getDocs, where, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/service/firebase'
import { formatLAK } from '@/service/currencyUtils'
import FavoriteButton from '@/app/components/FavoriteButton'
import ProjectImage, { getProjectImageProps } from '@/app/utils/projectImageHandler'
import { Project } from '@/types/project'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import en from '@/lib/i18n/en'
import lo from '@/lib/i18n/lo'

export default function ProjectsPage() {
  const { t, currentLanguage } = useTranslationContext()
  
  // Get the current translations object
  const translations = currentLanguage === 'lo' ? lo : en
  
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedBudgetType, setSelectedBudgetType] = useState('all')
  const [clickedProjects, setClickedProjects] = useState<Set<string>>(new Set())
  const { user, profile } = useAuth()
  const searchParams = useSearchParams()

  // Read URL parameters for search and filters
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const budget = searchParams.get('budget') || 'all'
    const status = searchParams.get('status') || 'all'

    setSearchTerm(search)
    setSelectedCategory(category)
    setSelectedStatus(status)
    // Note: budget parameter from header maps to budgetType in projects page
    setSelectedBudgetType(budget)
  }, [searchParams])

  const categories = [
    { value: 'all', label: t('projects.filters.allCategories') },
    { value: 'Web Development', label: t('projects.categories.webDevelopment') },
    { value: 'Mobile Development', label: t('projects.categories.mobileDevelopment') },
    { value: 'Design', label: t('projects.categories.design') },
    { value: 'Writing', label: t('projects.categories.writing') },
    { value: 'Research', label: t('projects.categories.research') },
    { value: 'Data Analysis', label: t('projects.categories.dataAnalysis') },
    { value: 'Marketing', label: t('projects.categories.marketing') },
    { value: 'Translation', label: t('projects.categories.translation') },
    { value: 'Other', label: t('projects.categories.other') }
  ]

  const statuses = [
    { value: 'open', label: t('projects.statuses.open'), color: 'bg-green-100 text-green-800 border border-green-200' },
    { value: 'in_progress', label: t('projects.statuses.inProgress'), color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
    { value: 'completed', label: t('projects.statuses.completed'), color: 'bg-blue-100 text-blue-800 border border-blue-200' },
    { value: 'cancelled', label: t('projects.statuses.cancelled'), color: 'bg-red-100 text-red-800 border border-red-200' }
  ]

  const budgetTypes = [
    { value: 'all', label: t('projects.filters.allTypes') },
    { value: 'fixed', label: t('projects.budgetTypes.fixedPrice') },
    { value: 'hourly', label: t('projects.budgetTypes.hourlyRate') }
  ]

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const projectsRef = collection(db, 'projects')
      const q = query(projectsRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)

      const projectsData: Project[] = []

      // Process each project and get actual proposals count
      for (const doc of querySnapshot.docs) {
        const data = doc.data()

        // Fetch actual proposals count for this project
        const proposalsQuery = query(
          collection(db, 'proposals'),
          where('projectId', '==', doc.id)
        )
        const proposalsSnap = await getDocs(proposalsQuery)
        const actualProposalsCount = proposalsSnap.size

        projectsData.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          budget: data.budget || 0,
          budgetType: data.budgetType || 'fixed',
          deadline: data.deadline ? new Date(data.deadline.toDate()) : undefined,
          skillsRequired: data.skillsRequired || [],
          status: data.status || 'open',
          category: data.category || 'Other',
          clientId: data.clientId || '',
          freelancerId: data.freelancerId || '',
          proposalsCount: actualProposalsCount, // Use actual count from proposals collection
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
          views: data.views || 0,
          timeline: data.timeline || '',
          acceptedFreelancerId: data.acceptedFreelancerId || '',
          acceptedProposalId: data.acceptedProposalId || '',
          attachments: data.attachments || [],
          clientCompleted: data.clientCompleted || {},
          freelancerCompleted: data.freelancerCompleted || {},
          imageUrl: data.imageUrl || '' // Assuming imageUrl is stored in the document
        })
      }

      setProjects(projectsData)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.skillsRequired.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus
    const matchesBudgetType = selectedBudgetType === 'all' || project.budgetType === selectedBudgetType

    return matchesSearch && matchesCategory && matchesStatus && matchesBudgetType
  })

  const formatBudget = (budget: number, budgetType: string) => {
    if (budgetType === 'hourly') {
      return formatLAK(budget, { compact: true }) + '/hr'
    }
    return formatLAK(budget, { compact: true })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-green-100 text-green-800 border border-green-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border border-gray-200'
  }

  const getStatusLabel = (status: string) => {
    const statusObj = statuses.find(s => s.value === status)
    return statusObj?.label || status
  }

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return 'Unknown date'
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Function to increment project views
  const incrementProjectViews = async (projectId: string) => {
    try {
      //console.log('🚀 Starting view increment for project:', projectId)

      const projectRef = doc(db, 'projects', projectId)

      // First, let's check if the project exists and get current views
      const projectSnap = await getDoc(projectRef)
      if (!projectSnap.exists()) {
        console.error('❌ Project does not exist:', projectId)
        return
      }

      const currentData = projectSnap.data()
      const currentViews = currentData.views || 0
      //console.log('📊 Current views before increment:', currentViews)

      // Simple manual update approach
      const newViews = currentViews + 1
      await updateDoc(projectRef, {
        views: newViews,
        updatedAt: new Date()
      })
      //console.log('✅ Manual update completed successfully - new views:', newViews)

      // Update local state to reflect the new view count
      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.id === projectId) {
            //console.log('🔄 Updated local view count for project', projectId, 'from', project.views, 'to', newViews)
            return { ...project, views: newViews }
          }
          return project
        })
      )

      //console.log('🎉 Project view count incremented successfully')
    } catch (error) {
      console.error('❌ Error incrementing project views:', error)
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      // Don't show error to user as this is not critical functionality
    }
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary">{t('projects.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light to-secondary-light py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
              {t('projects.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-3xl mx-auto">
              {t('projects.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-6 sm:py-8 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="search-section" className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
                    {t('projects.search.title')}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {t('projects.search.subtitle')}
                  </p>
                </div>
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
                    placeholder={t('projects.search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">{t('projects.filters.category')}</label>
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

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">{t('projects.filters.status')}</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  >
                    <option value="all">{t('projects.filters.allStatus')}</option>
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">{t('projects.filters.budgetType')}</label>
                  <select
                    value={selectedBudgetType}
                    onChange={(e) => setSelectedBudgetType(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  >
                    {budgetTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('all')
                      setSelectedStatus('all')
                      setSelectedBudgetType('all')
                      setSearchTerm('')
                    }}
                    className="w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    {t('projects.search.clearFilters')}
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              {(selectedCategory !== 'all' || selectedStatus !== 'all' || selectedBudgetType !== 'all' || searchTerm) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light text-primary text-sm rounded-full">
                        Search: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm('')}
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
                    {selectedStatus !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-success-light text-success text-sm rounded-full">
                        {statuses.find(s => s.value === selectedStatus)?.label}
                        <button
                          onClick={() => setSelectedStatus('all')}
                          className="ml-1 hover:text-success-hover"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedBudgetType !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning-light text-warning text-sm rounded-full">
                        {budgetTypes.find(t => t.value === selectedBudgetType)?.label}
                        <button
                          onClick={() => setSelectedBudgetType('all')}
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
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              {filteredProjects.length} {t('projects.results.title')}
            </h2>
            {user && (
              <Link href="/projects/create" className="btn btn-primary">
                {t('projects.postProject')}
              </Link>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{t('projects.results.noResults')}</h3>
              <p className="text-text-secondary">{t('projects.results.noResultsDescription')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className={`bg-white rounded-xl shadow-lg border border-border overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 ${clickedProjects.has(project.id) ? 'opacity-75 pointer-events-none' : ''}`}>
                  {/* Project Image */}
                  <div className="relative aspect-video overflow-hidden cursor-pointer group" onClick={async () => {
                    if (clickedProjects.has(project.id)) return
                    setClickedProjects(prev => new Set(prev).add(project.id))
                    await incrementProjectViews(project.id)
                    window.location.href = `/projects/${project.id}`
                  }}>
                    <ProjectImage
                      {...getProjectImageProps(project)}
                      size="full"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Status badge overlay */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    
                    {/* Favorite button overlay */}
                    <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                      <FavoriteButton 
                        projectId={project.id} 
                        size="sm" 
                        className="bg-white/95 backdrop-blur-sm shadow-lg"
                        isProjectOwner={user?.uid === project.clientId}
                      />
                    </div>
                    
                    {/* Hover indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-4 sm:p-6 flex-1 flex flex-col">
                    {/* Project Header */}
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                        {project.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xs text-text-secondary">
                          {project.views} {t('projects.projectCard.views')}
                        </span>
                        <span className="text-xs text-text-secondary">•</span>
                        <span className="text-xs text-text-secondary">
                          {formatDate(project.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Project Description */}
                    <p className="text-text-secondary text-sm mb-4 line-clamp-3 flex-1">
                      {project.description}
                    </p>

                    {/* Skills Required */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.skillsRequired.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {project.skillsRequired.length > 3 && (
                          <span className="px-2 py-1 bg-background-secondary text-text-secondary text-xs rounded-full">
                            +{project.skillsRequired.length - 3} {t('projects.projectCard.moreSkills')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">{t('projects.projectCard.budget')}</span>
                        <span className="font-medium text-text-primary">
                          {formatBudget(project.budget, project.budgetType)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">{t('projects.projectCard.category')}</span>
                        <span className="font-medium text-text-primary">{project.category}</span>
                      </div>
                      {project.timeline && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">{t('projects.projectCard.timeline')}</span>
                          <span className="font-medium text-text-primary">{project.timeline}</span>
                        </div>
                      )}
                    </div>

                    {/* Project Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm text-text-secondary">
                          {project.proposalsCount} {project.proposalsCount !== 1 ? t('projects.projectCard.proposalsPlural') : t('projects.projectCard.proposal')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Submit Proposal Button - Only show if user is not the project owner and project is open */}
                        {user && project.status === 'open' && project.clientId !== user.uid && (
                          <Link
                            href={`/projects/${project.id}/propose`}
                            className="btn btn-secondary text-sm px-3 py-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t('projects.projectCard.submitProposal')}
                          </Link>
                        )}

                        <Link
                          href={`/projects/${project.id}`}
                          className={`btn btn-primary text-sm px-4 py-2 ${clickedProjects.has(project.id) ? 'opacity-75' : ''}`}
                          onClick={async (e) => {
                            e.preventDefault()
                            if (clickedProjects.has(project.id)) return
                            setClickedProjects(prev => new Set(prev).add(project.id))
                            await incrementProjectViews(project.id)
                            window.location.href = `/projects/${project.id}`
                          }}
                        >
                          {clickedProjects.has(project.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {t('projects.projectCard.loading')}
                            </>
                          ) : (
                            t('projects.projectCard.viewDetails')
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
} 
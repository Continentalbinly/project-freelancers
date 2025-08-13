'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import { db } from '@/service/firebase'
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { Project } from '@/types/project'
import { Profile } from '@/types/profile'
import { formatLAK, formatBudgetRange } from '@/service/currencyUtils'
import { timeAgo } from '@/service/timeUtils'
import FavoriteButton from '@/app/components/FavoriteButton'
import ProjectImage, { getProjectImageProps } from '@/app/utils/projectImageHandler'
import ProposalImage, { getProposalImageProps } from '@/app/utils/proposalImageHandler'
import Avatar, { getAvatarProps } from '@/app/utils/avatarHandler'

export default function ProjectDetailPage() {
  const { t } = useTranslationContext()
  const [project, setProject] = useState<Project | null>(null)
  const [clientProfile, setClientProfile] = useState<Profile | null>(null)
  const [freelancerProfile, setFreelancerProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasIncrementedViews, setHasIncrementedViews] = useState(false)
  const { id } = useParams()
  const { user, profile } = useAuth()

  useEffect(() => {
    if (id) {
      fetchProject(id as string)
    }
  }, [id])

  // Separate useEffect for view increment to ensure it happens after project is loaded
  useEffect(() => {
    if (project && id && !hasIncrementedViews) {
      // Small delay to ensure project is fully loaded
      const timer = setTimeout(() => {
        console.log('Project loaded, current views:', project.views)
        setHasIncrementedViews(true)
        incrementProjectViews(id as string)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [project, id, hasIncrementedViews])

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true)
      const projectRef = doc(db, 'projects', projectId)
      const projectSnap = await getDoc(projectRef)

      if (projectSnap.exists()) {
        const data = projectSnap.data()

        // Fetch actual proposals count for this project
        const proposalsQuery = query(
          collection(db, 'proposals'),
          where('projectId', '==', projectId)
        )
        const proposalsSnap = await getDocs(proposalsQuery)
        const actualProposalsCount = proposalsSnap.size

        const projectData = {
          id: projectSnap.id,
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
          imageUrl: data.imageUrl || ''
        }
        setProject(projectData)

        // Increment view count
        // await incrementProjectViews(projectId) // This is now handled by the useEffect

        // Fetch client profile
        if (data.clientId) {
          try {
            const clientRef = doc(db, 'profiles', data.clientId)
            const clientSnap = await getDoc(clientRef)
            if (clientSnap.exists()) {
              setClientProfile(clientSnap.data() as Profile)
            }
          } catch (error) {
            console.error('Error fetching client profile:', error)
          }
        }

        // Fetch freelancer profile
        if (data.acceptedFreelancerId) {
          try {
            const freelancerRef = doc(db, 'profiles', data.acceptedFreelancerId)
            const freelancerSnap = await getDoc(freelancerRef)
            if (freelancerSnap.exists()) {
              setFreelancerProfile(freelancerSnap.data() as Profile)
            }
          } catch (error) {
            console.error('Error fetching freelancer profile:', error)
          }
        }
      } else {
        setError('Project not found')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  // Function to increment project views
  const incrementProjectViews = async (projectId: string) => {
    try {
      console.log('🚀 Starting view increment for project:', projectId)
      const projectRef = doc(db, 'projects', projectId)
      // First, let's check if the project exists and get current views
      const projectSnap = await getDoc(projectRef)
      if (!projectSnap.exists()) {
        console.error('❌ Project does not exist:', projectId)
        return
      }
      const currentData = projectSnap.data()
      const currentViews = currentData.views || 0
      console.log('📊 Current views before increment:', currentViews)
      // Simple manual update approach
      const newViews = currentViews + 1
      await updateDoc(projectRef, {
        views: newViews,
        updatedAt: new Date()
      })
      console.log('✅ Manual update completed successfully - new views:', newViews)
      // Do NOT update local state here to avoid triggering useEffect loop
      console.log('🎉 Project view count incremented successfully')
    } catch (error) {
      console.error('❌ Error incrementing project views:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
    }
  }

  const formatBudget = (budget: number, budgetType: string) => {
    if (budgetType === 'hourly') {
      return formatLAK(budget, { compact: true }) + '/hr'
    }
    return formatLAK(budget, { compact: true })
  }

  const getStatusColor = (status: string) => {
    const statusColors = {
      open: 'bg-success-light text-success',
      in_progress: 'bg-warning-light text-warning',
      completed: 'bg-primary-light text-primary',
      cancelled: 'bg-error-light text-error'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      open: 'Open',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  const formatDate = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) {
      return t('projectDetail.unknownDate')
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const convertTimestampToDate = (timestamp: any): Date => {
    if (!timestamp) return new Date()

    // If it's a Firestore timestamp, convert it
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate()
    }

    // If it's already a Date object, return it
    if (timestamp instanceof Date) {
      return timestamp
    }

    // If it's a string or number, create a new Date
    return new Date(timestamp)
  }

  const getCompletionStatus = () => {
    if (!project) return null

    const clientCompleted = project.clientCompleted && Object.keys(project.clientCompleted).length > 0
    const freelancerCompleted = project.freelancerCompleted && Object.keys(project.freelancerCompleted).length > 0

    if (clientCompleted && freelancerCompleted) {
      return {
        status: 'completed',
        label: t('projectDetail.projectCompleted'),
        color: 'bg-success-light text-success',
        description: t('projectDetail.projectCompletedDesc')
      }
    } else if (clientCompleted) {
      return {
        status: 'client_completed',
        label: t('projectDetail.clientCompleted'),
        color: 'bg-warning-light text-warning',
        description: t('projectDetail.clientCompletedDesc')
      }
    } else if (freelancerCompleted) {
      return {
        status: 'freelancer_completed',
        label: t('projectDetail.freelancerCompleted'),
        color: 'bg-info-light text-info',
        description: t('projectDetail.freelancerCompletedDesc')
      }
    }

    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">{t('projectDetail.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">{t('projectDetail.error')}</h2>
          <p className="text-text-secondary">{error}</p>
          <Link href="/projects" className="btn btn-primary mt-4">
            {t('projectDetail.backToProjects')}
          </Link>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">{t('projectDetail.projectNotFound')}</h2>
          <p className="text-text-secondary">{t('projectDetail.projectNotFoundDesc')}</p>
          <Link href="/projects" className="btn btn-primary mt-4">
            {t('projectDetail.backToProjects')}
          </Link>
        </div>
      </div>
    )
  }

  const completionStatus = getCompletionStatus()

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-text-secondary">
            <li>
              <Link href="/projects" className="hover:text-primary transition-colors">
                {t('projectDetail.projects')}
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-text-primary">{project.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
              {/* Project Image */}
              <ProjectImage
                src={project.imageUrl}
                alt={project.title}
                projectTitle={project.title}
                size="full"
              />

              <div className="p-6 sm:p-8">
                {/* Project Title and Status */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex-1">
                      {project.title}
                    </h1>
                    <FavoriteButton 
                      projectId={project.id} 
                      size="lg" 
                      className="flex-shrink-0"
                      isProjectOwner={user?.uid === project.clientId}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {project.views} {t('projectDetail.views')}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {project.proposalsCount} {project.proposalsCount !== 1 ? t('projectDetail.proposals') : t('projectDetail.proposal')}
                      </span>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatBudget(project.budget, project.budgetType)}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {project.budgetType === 'hourly' ? t('projectDetail.perHour') : t('projectDetail.fixedPrice')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">{t('projectDetail.description')}</h3>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>

                {/* Skills Required */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">{t('projectDetail.skillsRequired')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.skillsRequired.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-light text-primary text-sm rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Attachments */}
                {project.attachments && project.attachments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">{t('projectDetail.attachments')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {project.attachments.map((attachment, index) => (
                        <div key={index} className="flex flex-col">
                          <ProposalImage
                            src={attachment.url}
                            alt={attachment.name || `${t('projectDetail.attachment')} ${index + 1}`}
                            proposalTitle={attachment.name || `${t('projectDetail.attachment')} ${index + 1}`}
                            type="attachment"
                            size="md"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <p className="text-sm text-text-secondary mt-2 text-center">
                            {attachment.name || `${t('projectDetail.attachment')} ${index + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Project Participants Card */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">{t('projectDetail.projectParticipants')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Information */}
                <div className="flex items-center space-x-3 p-4 bg-background-secondary rounded-lg">
                  <Avatar
                    {...getAvatarProps(clientProfile, { uid: project?.clientId || '' })}
                    size="lg"
                  />
                  <div>
                    <p className="font-medium text-text-primary">
                      {clientProfile?.fullName || t('projectDetail.client')}
                    </p>
                    <p className="text-sm text-text-secondary">{t('projectDetail.projectCreator')}</p>
                  </div>
                </div>

                {/* Freelancer Information */}
                {freelancerProfile ? (
                  <div className="flex items-center space-x-3 p-4 bg-background-secondary rounded-lg">
                    <Avatar
                      {...getAvatarProps(freelancerProfile, { uid: project?.acceptedFreelancerId || '' })}
                      size="lg"
                    />
                    <div>
                      <p className="font-medium text-text-primary">
                        {freelancerProfile.fullName}
                      </p>
                      <p className="text-sm text-text-secondary">{t('projectDetail.assignedFreelancer')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-4 bg-background-secondary rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-text-secondary">{t('projectDetail.noFreelancerAssigned')}</p>
                      <p className="text-sm text-text-secondary">{t('projectDetail.openForProposals')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">{t('projectDetail.projectDetails')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('projectDetail.budget')}:</span>
                  <span className="font-semibold text-text-primary">
                    {formatBudget(project.budget, project.budgetType)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('projectDetail.category')}:</span>
                  <span className="font-semibold text-text-primary">{project.category}</span>
                </div>
                {project.timeline && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">{t('projectDetail.timeline')}:</span>
                    <span className="font-semibold text-text-primary">{project.timeline}</span>
                  </div>
                )}
                {project.deadline && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">{t('projectDetail.deadline')}:</span>
                    <span className="font-semibold text-text-primary">{formatDate(project.deadline)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('projectDetail.posted')}:</span>
                  <span className="font-semibold text-text-primary">{timeAgo(project.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('projectDetail.lastUpdated')}:</span>
                  <span className="font-semibold text-text-primary">{timeAgo(project.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Card */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">{t('projectDetail.actions')}</h3>
              <div className="space-y-3">
                {/* Submit Proposal - Only show if user is not the project owner */}
                {user && project.status === 'open' && project.clientId !== user.uid && (
                  <Link
                    href={`/projects/${project.id}/propose`}
                    className="btn btn-primary w-full"
                  >
                    {t('projectDetail.submitProposal')}
                  </Link>
                )}

                {/* Show message if user is the project owner */}
                {user && project.status === 'open' && project.clientId === user.uid && (
                  <div className="p-3 bg-background-secondary rounded-lg border border-border">
                    <p className="text-sm text-text-secondary text-center">
                      {t('projectDetail.ownProjectMessage') || "You cannot submit proposals to your own project"}
                    </p>
                  </div>
                )}

                {/* Edit Project - Only show to project owner */}
                {user && project.clientId === user.uid && (
                  <Link
                    href={`/projects/${project.id}/edit`}
                    className="btn btn-outline w-full"
                  >
                    {t('projectDetail.editProject')}
                  </Link>
                )}

                <Link
                  href="/projects"
                  className="btn btn-outline w-full"
                >
                  {t('projectDetail.backToProjects')}
                </Link>
              </div>
            </div>

            {/* Completion Status Card */}
            {completionStatus && (
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">{t('projectDetail.completionStatus')}</h3>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${completionStatus.color}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{completionStatus.label}</span>
                    </div>
                    <p className="text-sm">{completionStatus.description}</p>
                  </div>

                  {/* Client Completion Details */}
                  {project.clientCompleted && Object.keys(project.clientCompleted).length > 0 && (
                    <div className="p-3 bg-success-light rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-success">{t('projectDetail.clientCompleted')}</span>
                        {project.clientCompleted.completedAt && (
                          <span className="text-xs text-success">
                            {formatDate(convertTimestampToDate(project.clientCompleted.completedAt))}
                          </span>
                        )}
                      </div>
                      {project.clientCompleted.completionNotes && (
                        <p className="text-sm text-success">{project.clientCompleted.completionNotes}</p>
                      )}
                    </div>
                  )}

                  {/* Freelancer Completion Details */}
                  {project.freelancerCompleted && Object.keys(project.freelancerCompleted).length > 0 && (
                    <div className="p-3 bg-primary-light rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary">{t('projectDetail.freelancerCompleted')}</span>
                        {project.freelancerCompleted.completedAt && (
                          <span className="text-xs text-primary">
                            {formatDate(convertTimestampToDate(project.freelancerCompleted.completedAt))}
                          </span>
                        )}
                      </div>
                      {project.freelancerCompleted.completionNotes && (
                        <p className="text-sm text-primary">{project.freelancerCompleted.completionNotes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
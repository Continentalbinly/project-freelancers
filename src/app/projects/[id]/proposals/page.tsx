'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { collection, query, orderBy, getDocs, where, doc as firestoreDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/service/firebase'
import { formatEarnings } from '@/service/currencyUtils'
import { timeAgo } from '@/service/timeUtils'
import { ChevronLeftIcon, EyeIcon, CheckIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import Avatar, { getAvatarProps } from '@/app/utils/avatarHandler'

interface Proposal {
  id: string
  projectId: string
  freelancerId: string
  coverLetter: string
  proposedBudget: number
  proposedRate: number
  estimatedDuration: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  createdAt: any
  updatedAt: any
  freelancer?: {
    id: string
    fullName: string
    avatar?: string
    rating?: number
    skills?: string[]
    hourlyRate?: number
  }
}

interface Project {
  id: string
  title: string
  description: string
  budget: number
  budgetType: 'fixed' | 'hourly'
  status: string
  clientId: string
}

export default function ProjectProposalsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loadingProposals, setLoadingProposals] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Fetch project and proposals
  useEffect(() => {
    if (user && projectId) {
      fetchProjectAndProposals()
    }
  }, [user, projectId])

  const fetchProjectAndProposals = async () => {
    try {
      setLoadingProposals(true)
      
      if (!user || !projectId) return

      // Fetch project details
      const projectDoc = await getDoc(firestoreDoc(db, 'projects', projectId))
      if (!projectDoc.exists()) {
        router.push('/projects/manage')
        return
      }

      const projectData = projectDoc.data() as Project
      
      // Check if user is the project owner
      if (projectData.clientId !== user.uid) {
        router.push('/projects/manage')
        return
      }

      setProject({
        ...projectData,
        id: projectId
      })

      // Fetch proposals for this project
      const proposalsQuery = query(
        collection(db, 'proposals'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      )
      const proposalsSnap = await getDocs(proposalsQuery)
      
      const proposalsData = await Promise.all(proposalsSnap.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data()
        
        // Fetch freelancer details
        const freelancerDocRef = firestoreDoc(db, 'profiles', data.freelancerId)
        const freelancerDoc = await getDoc(freelancerDocRef)
        const freelancerData = freelancerDoc.exists() ? freelancerDoc.data() as any : null
        
        return {
          id: docSnapshot.id,
          ...data,
          freelancer: freelancerData ? {
            id: data.freelancerId,
            fullName: freelancerData.fullName,
            avatar: freelancerData.avatarUrl,
            rating: freelancerData.rating,
            skills: freelancerData.skills,
            hourlyRate: freelancerData.hourlyRate
          } : null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Proposal
      }))
      
      setProposals(proposalsData)
    } catch (error) {
      console.error('Error fetching project and proposals:', error)
    } finally {
      setLoadingProposals(false)
    }
  }

  const handleAcceptProposal = async (proposal: Proposal) => {
    try {
      // Update proposal status
      await updateDoc(firestoreDoc(db, 'proposals', proposal.id), {
        status: 'accepted',
        updatedAt: new Date()
      })

      // Update project status and assign freelancer
      await updateDoc(firestoreDoc(db, 'projects', projectId), {
        status: 'in_progress',
        acceptedFreelancerId: proposal.freelancerId,
        updatedAt: new Date()
      })

      // Reject all other proposals
      const otherProposals = proposals.filter(p => p.id !== proposal.id)
      await Promise.all(otherProposals.map(async (p) => {
        await updateDoc(firestoreDoc(db, 'proposals', p.id), {
          status: 'rejected',
          updatedAt: new Date()
        })
      }))

      // Refresh data
      fetchProjectAndProposals()
    } catch (error) {
      console.error('Error accepting proposal:', error)
    }
  }

  const handleRejectProposal = async (proposal: Proposal) => {
    try {
      await updateDoc(firestoreDoc(db, 'proposals', proposal.id), {
        status: 'rejected',
        updatedAt: new Date()
      })

      // Refresh data
      fetchProjectAndProposals()
    } catch (error) {
      console.error('Error rejecting proposal:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      accepted: 'bg-success/10 text-success',
      rejected: 'bg-error/10 text-error',
      pending: 'bg-warning/10 text-warning',
      withdrawn: 'bg-background-secondary text-text-secondary'
    }
    return colors[status as keyof typeof colors] || 'bg-background-secondary text-text-secondary'
  }

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      accepted: 'Accepted',
      rejected: 'Rejected',
      pending: 'Pending',
      withdrawn: 'Withdrawn'
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  const filteredProposals = proposals.filter(proposal => {
    return statusFilter === 'all' || proposal.status === statusFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading...</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Project Proposals</h1>
              <p className="text-text-secondary">
                {project ? `Review proposals for "${project.title}"` : 'Loading project...'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-text-primary">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Proposals</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div className="text-sm text-text-secondary">
              {filteredProposals.length} of {proposals.length} proposals
            </div>
          </div>
        </div>

        {/* Proposals List */}
        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-text-primary">
              Proposals ({filteredProposals.length})
            </h2>
          </div>

          <div className="p-6">
            {loadingProposals ? (
              <div className="space-y-6">
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
            ) : filteredProposals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">No proposals found</h3>
                <p className="text-text-secondary">
                  {proposals.length === 0 
                    ? "No freelancers have applied to this project yet."
                    : "No proposals match your current filter."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProposals.map((proposal) => (
                  <div key={proposal.id} className="border border-border rounded-lg p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar
                          src={proposal.freelancer?.avatar}
                          alt={proposal.freelancer?.fullName}
                          name={proposal.freelancer?.fullName}
                          size="lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-text-primary">
                              {proposal.freelancer?.fullName || 'Unknown Freelancer'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                              {getStatusLabel(proposal.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-text-secondary mb-2">
                            <span>Rating: {proposal.freelancer?.rating || 0}/5 ⭐</span>
                            <span>Hourly Rate: {proposal.freelancer?.hourlyRate ? formatEarnings(proposal.freelancer.hourlyRate) + '/hr' : 'Not set'}</span>
                            <span>{timeAgo(proposal.createdAt)}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {proposal.freelancer?.skills?.slice(0, 5).map((skill: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-primary mb-1">
                          {formatEarnings(proposal.proposedBudget)}
                        </div>
                        <div className="text-sm text-text-secondary">Proposed Budget</div>
                        <div className="text-sm text-text-secondary mt-1">
                          Duration: {proposal.estimatedDuration}
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="mb-4">
                      <h4 className="font-medium text-text-primary mb-2">Cover Letter</h4>
                      <p className="text-text-secondary text-sm line-clamp-3">
                        {proposal.coverLetter}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <button suppressHydrationWarning
                          onClick={() => setSelectedProposal(proposal)}
                          className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Full Proposal
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {proposal.status === 'pending' && (
                          <>
                            <button suppressHydrationWarning
                              onClick={() => handleAcceptProposal(proposal)}
                              className="flex items-center gap-2 text-sm text-success hover:text-success-dark font-medium"
                            >
                              <CheckIcon className="w-4 h-4" />
                              Accept
                            </button>
                            <button suppressHydrationWarning
                              onClick={() => handleRejectProposal(proposal)}
                              className="flex items-center gap-2 text-sm text-error hover:text-error-dark font-medium"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Proposal Detail Modal */}
        {selectedProposal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  Proposal from {selectedProposal.freelancer?.fullName}
                </h3>
                <button suppressHydrationWarning
                  onClick={() => setSelectedProposal(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={selectedProposal.freelancer?.avatar}
                    alt={selectedProposal.freelancer?.fullName}
                    name={selectedProposal.freelancer?.fullName}
                    size="lg"
                  />
                  <div>
                    <h4 className="font-semibold text-text-primary">{selectedProposal.freelancer?.fullName}</h4>
                    <p className="text-sm text-text-secondary">Rating: {selectedProposal.freelancer?.rating || 0}/5 ⭐</p>
                    <p className="text-sm text-text-secondary">
                      Hourly Rate: {selectedProposal.freelancer?.hourlyRate ? formatEarnings(selectedProposal.freelancer.hourlyRate) + '/hr' : 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-text-secondary">Proposed Budget:</span>
                    <p className="text-lg font-bold text-primary">{formatEarnings(selectedProposal.proposedBudget)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-secondary">Duration:</span>
                    <p className="text-lg font-semibold text-text-primary">{selectedProposal.estimatedDuration}</p>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-text-secondary">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProposal.freelancer?.skills?.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-text-secondary">Cover Letter:</span>
                  <p className="text-text-secondary text-sm mt-2 whitespace-pre-wrap">
                    {selectedProposal.coverLetter}
                  </p>
                </div>

                {selectedProposal.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <button suppressHydrationWarning
                      onClick={() => {
                        handleAcceptProposal(selectedProposal)
                        setSelectedProposal(null)
                      }}
                      className="btn btn-success flex-1"
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Accept Proposal
                    </button>
                    <button suppressHydrationWarning
                      onClick={() => {
                        handleRejectProposal(selectedProposal)
                        setSelectedProposal(null)
                      }}
                      className="btn btn-error flex-1"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Reject Proposal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
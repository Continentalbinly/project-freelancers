'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { collection, query, orderBy, getDocs, where, doc, getDoc } from 'firebase/firestore'
import { db } from '@/service/firebase'
import { formatEarnings } from '@/service/currencyUtils'
import { timeAgo } from '@/service/timeUtils'
import Avatar from '@/app/utils/avatarHandler'
import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import en from '@/lib/i18n/en'
import lo from '@/lib/i18n/lo'

interface Proposal {
    id: string
    projectId: string
    freelancerId: string
    coverLetter: string
    proposedBudget: number
    proposedRate: number
    estimatedDuration: string
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
    workSamples?: any[]
    workPlan?: string
    milestones?: any
    availability?: string
    createdAt: any
    updatedAt: any
    processedAt?: any
    processedBy?: string
    project?: {
        id: string
        title: string
        description: string
        budget: number
        clientId: string
        skillsRequired?: string[]
    }
    freelancer?: {
        id: string
        fullName: string
        avatar?: string
        rating?: number
        skills?: string[]
    }
    client?: {
        id: string
        fullName: string
        avatar?: string
    }
}

export default function ProposalsPage() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t, currentLanguage } = useTranslationContext()

    // Get the current translations object
    const translations = currentLanguage === 'lo' ? lo : en

    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loadingProposals, setLoadingProposals] = useState(true)
    const [activeTab, setActiveTab] = useState('submitted')
    const [statusFilter, setStatusFilter] = useState('all')

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        }
    }, [user, loading, router])

    // Set active tab based on URL params
    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab === 'received' || tab === 'submitted') {
            setActiveTab(tab)
        } else {
            // Default to submitted if no tab parameter
            setActiveTab('submitted')
            // Update URL to reflect the default tab
            const url = new URL(window.location.href)
            url.searchParams.set('tab', 'submitted')
            router.replace(url.pathname + url.search, { scroll: false })
        }
    }, [searchParams, router])

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        const url = new URL(window.location.href)
        url.searchParams.set('tab', tab)
        router.push(url.pathname + url.search, { scroll: false })
    }

    // Fetch proposals
    useEffect(() => {
        if (user) {
            setLoadingProposals(true);
            fetchProposals();
        }
    }, [user, activeTab, statusFilter]);

    const fetchProposals = async () => {
        try {
            setLoadingProposals(true)

            if (!user) return

            // Fetch proposals where user is freelancer (submitted)
            const submittedQuery = query(
                collection(db, 'proposals'),
                where('freelancerId', '==', user.uid),
                orderBy('createdAt', 'desc')
            )
            const submittedSnap = await getDocs(submittedQuery)

            // Fetch proposals where user is client (received)
            // Simplified query to avoid composite index requirement
            const projectsQuery = query(
                collection(db, 'projects'),
                where('clientId', '==', user.uid)
            )
            const projectsSnap = await getDocs(projectsQuery)
            const projectIds = projectsSnap.docs.map(doc => doc.id)

            let receivedProposals: any[] = []
            if (projectIds.length > 0) {
                // Fetch all proposals and filter client-side to avoid composite index
                const allProposalsQuery = query(
                    collection(db, 'proposals'),
                    orderBy('createdAt', 'desc')
                )
                const allProposalsSnap = await getDocs(allProposalsQuery)

                // Filter proposals for user's projects client-side
                receivedProposals = allProposalsSnap.docs
                    .filter(doc => projectIds.includes(doc.data().projectId))
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
            }

            const submittedProposals = submittedSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            // Combine and add project/freelancer details
            const allProposals = [...submittedProposals, ...receivedProposals]

            // Fetch additional details for each proposal
            const proposalsWithDetails = await Promise.all(
                allProposals.map(async (proposal) => {
                    try {
                        // Fetch project details
                        const projectDocRef = doc(db, 'projects', proposal.projectId)
                        const projectDoc = await getDoc(projectDocRef)
                        const projectData = projectDoc.exists() ? projectDoc.data() : null

                        // Fetch freelancer details
                        const freelancerDocRef = doc(db, 'profiles', proposal.freelancerId)
                        const freelancerDoc = await getDoc(freelancerDocRef)
                        const freelancerData = freelancerDoc.exists() ? freelancerDoc.data() : null

                        // Fetch client details if project exists
                        let clientData = null
                        if (projectData) {
                            const clientDocRef = doc(db, 'profiles', projectData.clientId)
                            const clientDoc = await getDoc(clientDocRef)
                            clientData = clientDoc.exists() ? clientDoc.data() : null
                        }

                        return {
                            ...proposal,
                            project: projectData ? {
                                id: proposal.projectId,
                                title: projectData.title,
                                description: projectData.description,
                                budget: projectData.budget,
                                clientId: projectData.clientId
                            } : null,
                            freelancer: freelancerData ? {
                                id: proposal.freelancerId,
                                fullName: freelancerData.fullName,
                                avatar: freelancerData.avatarUrl,
                                rating: freelancerData.rating,
                                skills: freelancerData.skills
                            } : null,
                            client: clientData && projectData ? {
                                id: projectData.clientId,
                                fullName: clientData.fullName,
                                avatar: clientData.avatarUrl
                            } : null
                        }
                    } catch (error) {
                        console.error('Error fetching proposal details:', error)
                        return proposal
                    }
                })
            )

            setProposals(proposalsWithDetails)
        } catch (error) {
            console.error('Error fetching proposals:', error)
        } finally {
            setLoadingProposals(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'text-success bg-success/10'
            case 'rejected':
                return 'text-error bg-error/10'
            case 'pending':
                return 'text-warning bg-warning/10'
            case 'withdrawn':
                return 'text-text-secondary bg-background-secondary'
            default:
                return 'text-text-secondary bg-background-secondary'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'accepted':
                return t('proposals.status.accepted')
            case 'rejected':
                return t('proposals.status.rejected')
            case 'pending':
                return t('proposals.status.pending')
            case 'withdrawn':
                return t('proposals.status.withdrawn')
            default:
                return status
        }
    }

    const filteredProposals = proposals.filter(proposal => {
        const isSubmitted = proposal.freelancerId === user?.uid
        const matchesTab = activeTab === 'submitted' ? isSubmitted : !isSubmitted
        const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
        return matchesTab && matchesStatus
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-primary mx-auto"></div>
                    <p className="mt-4 text-text-secondary">{t('proposals.loading')}</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect to login
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Header */}
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">{t('proposals.title')}</h1>
                            <p className="text-sm sm:text-base text-text-secondary">
                                {t('proposals.subtitle')}
                            </p>
                        </div>
                        <Link
                            href="/projects"
                            className="btn btn-primary btn-sm w-full sm:w-auto text-center"
                        >
                            {t('proposals.browseProjects')}
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-border mb-3 sm:mb-4 lg:mb-6">
                    <nav className="flex space-x-0 sm:space-x-8 px-2 sm:px-6 overflow-x-auto">
                        <button suppressHydrationWarning
                            onClick={() => handleTabChange('submitted')}
                            className={`py-3 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors flex-1 sm:flex-none text-center ${activeTab === 'submitted'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {t('proposals.tabs.submitted')}
                        </button>
                        <button suppressHydrationWarning
                            onClick={() => handleTabChange('received')}
                            className={`py-3 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors flex-1 sm:flex-none text-center ${activeTab === 'received'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {t('proposals.tabs.received')}
                        </button>
                    </nav>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-border p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <label className="text-sm font-medium text-text-primary">{t('proposals.filters.title')}</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-auto text-sm"
                        >
                            <option value="all">{t('proposals.filters.allStatus')}</option>
                            <option value="pending">{t('proposals.filters.pending')}</option>
                            <option value="accepted">{t('proposals.filters.accepted')}</option>
                            <option value="rejected">{t('proposals.filters.rejected')}</option>
                            <option value="withdrawn">{t('proposals.filters.withdrawn')}</option>
                        </select>
                    </div>
                </div>

                {/* Proposals List */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {loadingProposals ? (
                        <div className="space-y-3 sm:space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6 animate-pulse">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-4">
                                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full"></div>
                                            <div className="flex-1 w-full">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                        <div className="h-6 bg-gray-200 rounded w-20 sm:w-24"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProposals.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6-4h6m2 5H7a2 2 0 01-2-2a2 2 0 012-2h.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2">
                                {activeTab === 'submitted'
                                    ? t('proposals.emptyState.submitted.title')
                                    : t('proposals.emptyState.received.title')
                                }
                            </h3>
                            <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6 px-4">
                                {activeTab === 'submitted'
                                    ? t('proposals.emptyState.submitted.description')
                                    : t('proposals.emptyState.received.description')}
                            </p>
                            {activeTab === 'submitted' && (
                                <Link href="/projects" className="btn btn-primary text-sm sm:text-base">
                                    {t('proposals.emptyState.submitted.action')}
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-6">
                            {filteredProposals.map((proposal) => (
                                <div key={proposal.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 transition-all duration-200">
                                    {/* Header with Project and Proposal Info */}
                                    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between mb-4 sm:mb-6 gap-4 sm:gap-6">
                                        {/* Project Information */}
                                        <div className="flex-1 w-full">
                                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                <Avatar
                                                    src={activeTab === 'submitted' ? proposal.client?.avatar : proposal.freelancer?.avatar}
                                                    alt={activeTab === 'submitted' ? proposal.client?.fullName : proposal.freelancer?.fullName}
                                                    name={activeTab === 'submitted' ? proposal.client?.fullName : proposal.freelancer?.fullName}
                                                    size="xl"
                                                    className="flex-shrink-0"
                                                />
                                                <div className="w-full sm:flex-1 min-w-0 text-center sm:text-left">
                                                    <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1 sm:mb-2 line-clamp-2">
                                                        {proposal.project?.title || 'Project'}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-text-secondary mb-2 sm:mb-3 line-clamp-2">
                                                        {proposal.project?.description}
                                                    </p>
                                                    <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mb-2 sm:mb-3">
                                                        {proposal.project?.skillsRequired?.slice(0, 3).map((skill: string, index: number) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {proposal.project?.skillsRequired && proposal.project.skillsRequired.length > 3 && (
                                                            <span className="px-2 py-1 bg-background-secondary text-text-secondary text-xs rounded-full">
                                                                +{proposal.project.skillsRequired.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Proposal Status and Budget */}
                                        <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto">
                                            <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border ${getStatusColor(proposal.status)}`}>
                                                {getStatusText(proposal.status)}
                                            </span>
                                            <div className="text-center lg:text-right">
                                                <div className="text-lg sm:text-2xl font-bold text-primary">
                                                    {formatEarnings(proposal.proposedBudget)}
                                                </div>
                                                <div className="text-xs sm:text-sm text-text-secondary">{t('proposals.proposalCard.proposedBudget')}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proposal Details Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                                        {/* Freelancer/Client Info */}
                                        <div className="bg-background-secondary rounded-lg sm:rounded-xl p-3 sm:p-4">
                                            <h4 className="font-semibold text-text-primary mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                                <span className="w-1 h-2 sm:h-3 bg-primary rounded-full"></span>
                                                {activeTab === 'submitted' ? t('proposals.proposalCard.client') : t('proposals.proposalCard.freelancer')}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-text-secondary line-clamp-1">
                                                {activeTab === 'submitted'
                                                    ? proposal.client?.fullName || 'Unknown'
                                                    : proposal.freelancer?.fullName || 'Unknown'
                                                }
                                            </p>
                                            {proposal.freelancer?.rating && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-xs">⭐ {proposal.freelancer.rating}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Duration */}
                                        <div className="bg-background-secondary rounded-lg sm:rounded-xl p-3 sm:p-4">
                                            <h4 className="font-semibold text-text-primary mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                                <span className="w-1 h-2 sm:h-3 bg-secondary rounded-full"></span>
                                                {t('proposals.proposalCard.duration')}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-text-secondary line-clamp-1">
                                                {proposal.estimatedDuration}
                                            </p>
                                        </div>

                                        {/* Submitted Date */}
                                        <div className="bg-background-secondary rounded-lg sm:rounded-xl p-3 sm:p-4">
                                            <h4 className="font-semibold text-text-primary mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                                <span className="w-1 h-2 sm:h-3 bg-success rounded-full"></span>
                                                {t('proposals.proposalCard.submitted')}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-text-secondary line-clamp-1">
                                                {timeAgo(proposal.createdAt?.toDate() || new Date())}
                                            </p>
                                        </div>

                                        {/* Work Samples Count */}
                                        <div className="bg-background-secondary rounded-lg sm:rounded-xl p-3 sm:p-4">
                                            <h4 className="font-semibold text-text-primary mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                                <span className="w-1 h-2 sm:h-3 bg-warning rounded-full"></span>
                                                {t('proposals.proposalCard.workSamples')}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-text-secondary">
                                                {proposal.workSamples?.length || 0} samples
                                            </p>
                                        </div>
                                    </div>

                                    {/* Cover Letter Preview */}
                                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-background-secondary to-background rounded-lg sm:rounded-xl border border-gray-100">
                                        <h4 className="font-semibold text-text-primary mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                            <span className="w-1 h-3 sm:h-4 bg-primary rounded-full"></span>
                                            {t('proposals.proposalCard.coverLetter')}
                                        </h4>
                                        <p className="text-text-secondary text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed">
                                            {proposal.coverLetter}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 sm:pt-6 border-t border-gray-200 gap-3 sm:gap-4">
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                            <Link
                                                href={`/proposals/${proposal.id}`}
                                                className="text-xs sm:text-sm text-primary hover:text-primary-dark font-semibold flex items-center gap-1 sm:gap-2 hover:underline transition-all duration-200"
                                            >
                                                <span className="w-1 h-3 sm:h-4 bg-primary rounded-full"></span>
                                                {t('proposals.proposalCard.viewDetails')}
                                            </Link>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                            {proposal.status === 'pending' && activeTab === 'received' && (
                                                <>
                                                    <button suppressHydrationWarning className="cursor-pointer text-xs sm:text-sm text-success hover:text-success-dark font-semibold flex items-center gap-1 sm:gap-2 hover:underline transition-all duration-200">
                                                        <span className="w-1 h-3 sm:h-4 bg-success rounded-full"></span>
                                                        {t('proposals.proposalCard.accept')}
                                                    </button>
                                                    <button suppressHydrationWarning className="cursor-pointer text-xs sm:text-sm text-error hover:text-error-dark font-semibold flex items-center gap-1 sm:gap-2 hover:underline transition-all duration-200">
                                                        <span className="w-1 h-3 sm:h-4 bg-error rounded-full"></span>
                                                        {t('proposals.proposalCard.reject')}
                                                    </button>
                                                </>
                                            )}
                                            {proposal.status === 'accepted' && (
                                                <Link
                                                    href={`/messages?project=${proposal.projectId}`}
                                                    className="btn btn-primary text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto text-center"
                                                >
                                                    {t('proposals.proposalCard.startChat')}
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
        </div>
    )
} 
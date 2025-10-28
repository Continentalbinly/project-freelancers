'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/service/firebase'
import { formatEarnings } from '@/service/currencyUtils'
import { timeAgo } from '@/service/timeUtils'
import Avatar from '@/app/utils/avatarHandler'
import ProposalImage from '@/app/utils/proposalImageHandler'
import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import {
    ChevronLeftIcon,
    EyeIcon,
    ChatBubbleLeftRightIcon,
    CheckCircleIcon,
    XCircleIcon,
    CalendarIcon,
    ClockIcon,
    CurrencyDollarIcon,
    UserIcon,
    DocumentTextIcon,
    PhotoIcon,
    CheckBadgeIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'

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
    milestones?: any[]
    availability?: string
    communicationPreferences?: string
    createdAt: any
    updatedAt: any
    processedAt?: any
    processedBy?: string
    project?: {
        id: string
        title: string
        description: string
        budget: number
        budgetType: 'fixed' | 'hourly'
        category: string
        skillsRequired: string[]
        clientId: string
    } | null
    freelancer?: {
        id: string
        fullName: string
        avatar?: string
        rating?: number
        skills?: string[]
        bio?: string
        experience?: string
    } | null
    client?: {
        id: string
        fullName: string
        avatar?: string
    } | null
}

export default function ProposalDetailPage() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const { t } = useTranslationContext()

    const [proposal, setProposal] = useState<Proposal | null>(null)
    const [loadingProposal, setLoadingProposal] = useState(true)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        }
    }, [user, loading, router])

    // Fetch proposal details
    useEffect(() => {
        if (user && params.id) {
            fetchProposalDetails()
        }
    }, [user, params.id])

    const fetchProposalDetails = async () => {
        try {
            setLoadingProposal(true)

            if (!user || !params.id) return

            const proposalDocRef = doc(db, 'proposals', params.id as string)
            const proposalDoc = await getDoc(proposalDocRef)

            if (!proposalDoc.exists()) {
                router.push('/proposals')
                return
            }

            const proposalData = proposalDoc.data()

            // Fetch project details
            const projectDocRef = doc(db, 'projects', proposalData.projectId)
            const projectDoc = await getDoc(projectDocRef)
            const projectData = projectDoc.exists() ? projectDoc.data() : null

            // Fetch freelancer details
            const freelancerDocRef = doc(db, 'profiles', proposalData.freelancerId)
            const freelancerDoc = await getDoc(freelancerDocRef)
            const freelancerData = freelancerDoc.exists() ? freelancerDoc.data() : null

            // Fetch client details
            let clientData = null
            if (projectData) {
                const clientDocRef = doc(db, 'profiles', projectData.clientId)
                const clientDoc = await getDoc(clientDocRef)
                clientData = clientDoc.exists() ? clientDoc.data() : null
            }

            const fullProposal: Proposal = {
                id: proposalDoc.id,
                projectId: proposalData.projectId,
                freelancerId: proposalData.freelancerId,
                coverLetter: proposalData.coverLetter,
                proposedBudget: proposalData.proposedBudget,
                proposedRate: proposalData.proposedRate,
                estimatedDuration: proposalData.estimatedDuration,
                status: proposalData.status,
                workSamples: proposalData.workSamples,
                workPlan: proposalData.workPlan,
                milestones: proposalData.milestones,
                availability: proposalData.availability,
                communicationPreferences: proposalData.communicationPreferences,
                createdAt: proposalData.createdAt,
                updatedAt: proposalData.updatedAt,
                processedAt: proposalData.processedAt,
                processedBy: proposalData.processedBy,
                project: projectData ? {
                    id: proposalData.projectId,
                    title: projectData.title,
                    description: projectData.description,
                    budget: projectData.budget,
                    budgetType: projectData.budgetType,
                    category: projectData.category,
                    skillsRequired: projectData.skillsRequired,
                    clientId: projectData.clientId
                } : null,
                freelancer: freelancerData ? {
                    id: proposalData.freelancerId,
                    fullName: freelancerData.fullName,
                    avatar: freelancerData.avatarUrl,
                    rating: freelancerData.rating,
                    skills: freelancerData.skills,
                    bio: freelancerData.bio,
                    experience: freelancerData.experience
                } : null,
                client: clientData && projectData ? {
                    id: projectData.clientId,
                    fullName: clientData.fullName,
                    avatar: clientData.avatarUrl
                } : null
            }

            setProposal(fullProposal)
        } catch (error) {
            console.error('Error fetching proposal details:', error)
        } finally {
            setLoadingProposal(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'text-success bg-success/10 border-success/20'
            case 'rejected':
                return 'text-error bg-error/10 border-error/20'
            case 'pending':
                return 'text-warning bg-warning/10 border-warning/20'
            case 'withdrawn':
                return 'text-text-secondary bg-background-secondary border-border'
            default:
                return 'text-text-secondary bg-background-secondary border-border'
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted':
                return <CheckBadgeIcon className="w-5 h-5" />
            case 'rejected':
                return <XMarkIcon className="w-5 h-5" />
            case 'pending':
                return <ClockIcon className="w-5 h-5" />
            default:
                return <ClockIcon className="w-5 h-5" />
        }
    }

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
        return null
    }

    if (loadingProposal) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!proposal) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-text-primary mb-4">{t('proposals.notFound')}</h2>
                    <p className="text-text-secondary mb-6">{t('proposals.notFoundMessage')}</p>
                    <Link href="/proposals" className="btn btn-primary">
                        {t('proposals.backToProposals')}
                    </Link>
                </div>
            </div>
        )
    }

    const isClient = user.uid === proposal.project?.clientId
    const isFreelancer = user.uid === proposal.freelancerId

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
                            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('proposals.detail.title')}</h1>
                            <p className="text-text-secondary">{t('proposals.detail.subtitle')}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Info */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                                        {proposal.project?.title || 'Project'}
                                    </h2>
                                    <p className="text-text-secondary mb-4">
                                        {proposal.project?.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {proposal.project?.skillsRequired?.map((skill: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-primary-light text-primary text-sm rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary mb-1">
                                        {formatEarnings(proposal.proposedBudget)}
                                    </div>
                                    <div className="text-sm text-text-secondary">{t('proposals.detail.proposedBudget')}</div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(proposal.status)}`}>
                                {getStatusIcon(proposal.status)}
                                <span className="font-semibold">{getStatusText(proposal.status)}</span>
                            </div>
                        </div>

                        {/* Cover Letter */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                <DocumentTextIcon className="w-6 h-6 text-primary" />
                                {t('proposals.detail.coverLetter')}
                            </h3>
                            <div className="bg-background-secondary rounded-xl p-4">
                                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                                    {proposal.coverLetter}
                                </p>
                            </div>
                        </div>

                        {/* Work Plan */}
                        {proposal.workPlan && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <DocumentTextIcon className="w-6 h-6 text-secondary" />
                                    {t('proposals.detail.workPlan')}
                                </h3>
                                <div className="bg-background-secondary rounded-xl p-4">
                                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                                        {proposal.workPlan}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Work Samples */}
                        {proposal.workSamples && proposal.workSamples.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                                    <PhotoIcon className="w-6 h-6 text-secondary" />
                                    {t('proposals.detail.workSamples')}
                                    <span className="text-sm text-text-secondary font-normal">
                                        ({proposal.workSamples.length} samples)
                                    </span>
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {proposal.workSamples.map((sample, index) => (
                                        <div
                                            key={index}
                                            className="relative group cursor-pointer"
                                            onClick={() => setSelectedImage(sample.url)}
                                        >
                                            <div className="relative overflow-hidden rounded-xl shadow-md bg-gray-100">
                                                <div className="aspect-square">
                                                    <ProposalImage
                                                        src={sample.url}
                                                        alt={sample.name}
                                                        proposalTitle={sample.name}
                                                        type="work-sample"
                                                        size="lg"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                    <EyeIcon className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-text-secondary mt-2 truncate text-center">
                                                {sample.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Milestones */}
                        {proposal.milestones && proposal.milestones.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                                    <CheckCircleIcon className="w-6 h-6 text-success" />
                                    {t('proposals.detail.milestones')}
                                </h3>
                                <div className="space-y-4">
                                    {proposal.milestones.map((milestone: any, index: number) => (
                                        <div key={milestone.id || index} className="bg-background-secondary rounded-xl p-4 border-l-4 border-primary">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-semibold text-text-primary">{milestone.title}</h4>
                                                <span className="text-sm font-medium text-primary">
                                                    ₭{milestone.budget?.toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-text-secondary text-sm mb-2">{milestone.description}</p>
                                            <p className="text-xs text-text-secondary">Due: {milestone.dueDate}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* User Info */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-primary" />
                                {isClient ? t('proposals.detail.freelancer') : t('proposals.detail.client')}
                            </h3>
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar
                                    src={isClient ? proposal.freelancer?.avatar : proposal.client?.avatar}
                                    alt={isClient ? proposal.freelancer?.fullName : proposal.client?.fullName}
                                    name={isClient ? proposal.freelancer?.fullName : proposal.client?.fullName}
                                    size="lg"
                                />
                                <div>
                                    <h4 className="font-semibold text-text-primary">
                                        {isClient ? proposal.freelancer?.fullName : proposal.client?.fullName}
                                    </h4>
                                    {proposal.freelancer?.rating && (
                                        <div className="flex items-center gap-1 text-sm text-text-secondary">
                                            <span>⭐ {proposal.freelancer.rating}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {proposal.freelancer?.bio && (
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {proposal.freelancer.bio}
                                </p>
                            )}
                        </div>

                        {/* Proposal Details */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                <CurrencyDollarIcon className="w-5 h-5 text-primary" />
                                {t('proposals.detail.details')}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-text-secondary">{t('proposals.detail.budget')}</span>
                                    <span className="font-semibold text-primary">{formatEarnings(proposal.proposedBudget)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-text-secondary">{t('proposals.detail.duration')}</span>
                                    <span className="font-semibold">{proposal.estimatedDuration}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-text-secondary">{t('proposals.detail.submitted')}</span>
                                    <span className="font-semibold">{timeAgo(proposal.createdAt?.toDate() || new Date())}</span>
                                </div>
                            </div>
                        </div>

                        {/* Availability */}
                        {proposal.availability && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-secondary" />
                                    {t('proposals.detail.availability')}
                                </h3>
                                <div className="bg-background-secondary rounded-xl p-4">
                                    <p className="text-text-secondary text-sm leading-relaxed">
                                        {proposal.availability}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Communication Preferences */}
                        {proposal.communicationPreferences && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-secondary" />
                                    {t('proposals.detail.communication')}
                                </h3>
                                <div className="bg-background-secondary rounded-xl p-4">
                                    <p className="text-text-secondary text-sm leading-relaxed">
                                        {proposal.communicationPreferences}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-text-primary mb-4">{t('proposals.detail.actions')}</h3>
                            <div className="space-y-3">
                                {proposal.status === 'pending' && isClient && (
                                    <>
                                        <button suppressHydrationWarning className="cursor-pointer w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center">
                                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                                            {t('proposals.detail.accept')}
                                        </button>
                                        <button suppressHydrationWarning className="cursor-pointer w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center">
                                            <XCircleIcon className="w-4 h-4 mr-2" />
                                            {t('proposals.detail.reject')}
                                        </button>
                                    </>
                                )}
                                {proposal.status === 'accepted' && (
                                    <Link
                                        href={`/messages?project=${proposal.projectId}`}
                                        className="w-full btn btn-primary"
                                    >
                                        <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                                        {t('proposals.detail.startChat')}
                                    </Link>
                                )}
                                <Link
                                    href="/proposals"
                                    className="w-full btn btn-outline"
                                >
                                    {t('proposals.detail.backToList')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Modal */}
                {selectedImage && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="relative max-w-4xl max-h-full">
                            <button suppressHydrationWarning
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                            >
                                <XMarkIcon className="w-8 h-8" />
                            </button>
                            <img
                                src={selectedImage}
                                alt="Work Sample"
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 
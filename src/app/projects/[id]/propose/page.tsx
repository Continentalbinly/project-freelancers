'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { doc, getDoc, collection, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '@/service/firebase'
import { formatEarnings } from '@/service/currencyUtils'
import { ChevronLeftIcon, PlusIcon, XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import Avatar, { getAvatarProps } from '@/app/utils/avatarHandler'
import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'

interface Project {
  id: string
  title: string
  description: string
  budget: number
  budgetType: 'fixed' | 'hourly'
  category: string
  skills: string[]
  clientId: string
  proposalsCount?: number
  client?: {
    fullName: string
    avatar?: string
    avatarUrl?: string
    rating?: number
  }
}

interface WorkSample {
  id: string
  file?: File
  type: 'image' | 'file' | 'link'
  url?: string
  previewUrl?: string
  title: string
  description: string
}

interface Milestone {
  id: string
  title: string
  description: string
  budget: number
  dueDate: string
}

export default function ProposePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loadingProject, setLoadingProject] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Form data
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedBudget, setProposedBudget] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [workPlan, setWorkPlan] = useState('')
  const [communicationPreferences, setCommunicationPreferences] = useState('')
  const [availability, setAvailability] = useState('')

  // Work samples
  const [workSamples, setWorkSamples] = useState<WorkSample[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    budget: '',
    dueDate: ''
  })

  const { t } = useTranslationContext()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Fetch project details
  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoadingProject(true)
      const projectDoc = await getDoc(doc(db, 'projects', projectId))

      if (projectDoc.exists()) {
        const projectData = projectDoc.data()

        // Fetch client details
        const clientDoc = await getDoc(doc(db, 'profiles', projectData.clientId))
        const clientData = clientDoc.data()

        setProject({
          id: projectDoc.id,
          ...projectData,
          client: clientData ? {
            fullName: clientData.fullName,
            avatar: clientData.avatar,
            avatarUrl: clientData.avatarUrl,
            rating: clientData.rating
          } : undefined
        } as Project)

        // Set default values
        setProposedBudget(projectData.budget?.toString() || '')
        setProposedRate(projectData.budgetType === 'hourly' ? '15000' : '')
      } else {
        router.push('/projects')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      router.push('/projects')
    } finally {
      setLoadingProject(false)
    }
  }

  // Change workSamples to store File objects before upload
  const handleFileSelect = (file: File) => {
    let previewUrl: string | undefined = undefined
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file)
    }
    const newSample: WorkSample = {
      id: Date.now().toString(),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      title: file.name,
      description: '',
      previewUrl
    }
    setWorkSamples([...workSamples, newSample])
  }

  const removeWorkSample = (id: string) => {
    setWorkSamples(samples => {
      const sample = samples.find(s => s.id === id)
      if (sample?.previewUrl) {
        URL.revokeObjectURL(sample.previewUrl)
      }
      return samples.filter(s => s.id !== id)
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const addMilestone = () => {
    if (newMilestone.title && newMilestone.description && newMilestone.budget && newMilestone.dueDate) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        ...newMilestone,
        budget: Number(newMilestone.budget)
      }

      setMilestones([...milestones, milestone])
      setNewMilestone({ title: '', description: '', budget: '', dueDate: '' })
      setShowMilestoneForm(false)
    }
  }

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(milestone => milestone.id !== id))
  }

  // On submit, upload all files, then save proposal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !project) return
    setSubmitError(null)
    try {
      setSubmitting(true)
      // 1. Create a proposal document first to get the proposalId
      const proposalRef = doc(collection(db, 'proposals'))
      const proposalId = proposalRef.id
      // 2. Upload all files in workSamples to subfolder proposalsImage/{proposalId}
      const uploadedSamples: WorkSample[] = []
      for (const sample of workSamples) {
        if (sample.file) {
          const formData = new FormData()
          formData.append('file', sample.file)
          formData.append('folderType', 'proposalsImage')
          formData.append('subfolder', proposalId)
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          const result = await response.json()
          if (result.success) {
            // Omit the 'file' property before saving
            const { file, ...rest } = sample
            uploadedSamples.push({
              ...rest,
              url: result.data.url
            })
          }
        } else if (sample.url) {
          // Omit the 'file' property if present
          const { file, ...rest } = sample
          uploadedSamples.push(rest)
        }
      }
      // 3. Save all uploaded image URLs in the proposal document
      const proposalData = {
        id: proposalId,
        projectId: projectId,
        freelancerId: user.uid,
        coverLetter: coverLetter,
        proposedBudget: Number(proposedBudget),
        proposedRate: Number(proposedRate),
        estimatedDuration: estimatedDuration,
        workSamples: uploadedSamples,
        workPlan: workPlan,
        milestones: milestones,
        communicationPreferences: communicationPreferences,
        availability: availability,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await setDoc(proposalRef, proposalData)
      // Update project proposals count
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        proposalsCount: (project.proposalsCount || 0) + 1,
        updatedAt: new Date()
      })
      router.push('/proposals')
    } catch (error: any) {
      console.error('Error submitting proposal:', error)
      setSubmitError(error?.message || 'Failed to save proposal. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Track if we should block the page for unverified email
  const [shouldBlock, setShouldBlock] = useState(false)

  // Top-level effect: block and redirect if not verified
  useEffect(() => {
    if (user && !user.emailVerified) {
      setShouldBlock(true)
      const timeout = setTimeout(() => {
        router.push('/')
      }, 3000)
      return () => clearTimeout(timeout)
    } else {
      setShouldBlock(false)
    }
  }, [user, router])

  if (loading || loadingProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full w-12 h-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-secondary">{t('proposePage.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user || !project) {
    return null
  }

  if (shouldBlock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-secondary">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-border">
          <h2 className="text-xl font-bold text-text-primary mb-4">{t('proposePage.emailVerificationRequired')}</h2>
          <p className="text-text-secondary mb-6">{t('proposePage.emailVerificationMessage')}</p>
          <p className="text-xs text-text-secondary mt-4">{t('proposePage.emailVerificationRedirect')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-white shadow-sm border border-border hover:shadow-md transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5 text-text-primary" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('proposePage.submitProposal')}</h1>
            </div>
            <Link
              href="/proposals"
              className="btn btn-outline btn-sm"
            >
              {t('proposePage.viewMyProposals')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Details Sidebar (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-text-primary mb-4">{t('proposePage.projectDetails')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">{project.title}</h3>
                  <p className="text-sm text-text-secondary line-clamp-3">{project.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={project.client?.avatar || project.client?.avatarUrl}
                    alt={project.client?.fullName}
                    name={project.client?.fullName}
                    size="md"
                  />
                  <div>
                    <div className="font-medium text-text-primary">{project.client?.fullName}</div>
                    <div className="text-sm text-text-secondary">
                      {project.client?.rating ? `${t('proposePage.rating')}${project.client.rating}/5` : t('proposePage.newClient')}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">{t('proposePage.budget')}:</span>
                    <span className="text-sm font-medium text-text-primary">{formatEarnings(project.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">{t('proposePage.type')}:</span>
                    <span className="text-sm font-medium text-text-primary capitalize">{project.budgetType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">{t('proposePage.category')}:</span>
                    <span className="text-sm font-medium text-text-primary">{project.category}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-2">{t('proposePage.requiredSkills')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.skills?.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* User Info */}
              <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex items-center gap-4 mb-4">
                <Avatar {...getAvatarProps(profile, user)} size="md" />
                <div>
                  <div className="font-semibold text-text-primary">{t('proposePage.submittingAs')}:</div>
                  <div className="text-text-secondary">{profile?.fullName || user?.email}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6">{t('proposePage.proposalDetails')}</h2>
                {submitError && (
                  <div className="mb-4 p-3 bg-error/10 text-error rounded">
                    {submitError}
                  </div>
                )}
                {/* Cover Letter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">{t('proposePage.coverLetterLabel')}</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder={t('proposePage.coverLetterPlaceholder')}
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                {/* Budget and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">{t('proposePage.proposedBudgetLabel')}</label>
                    <input
                      type="number"
                      value={proposedBudget}
                      onChange={(e) => setProposedBudget(e.target.value)}
                      placeholder={t('proposePage.proposedBudgetPlaceholder')}
                      required
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  {project.budgetType === 'hourly' && (
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">{t('proposePage.hourlyRateLabel')}</label>
                      <input
                        type="number"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        placeholder={t('proposePage.hourlyRatePlaceholder')}
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">{t('proposePage.estimatedDurationLabel')}</label>
                    <select
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">{t('proposePage.selectDuration')}</option>
                      <option value="Less than 1 week">{t('proposePage.lessThanOneWeek')}</option>
                      <option value="1-2 weeks">{t('proposePage.oneToTwoWeeks')}</option>
                      <option value="2-4 weeks">{t('proposePage.twoToFourWeeks')}</option>
                      <option value="1-2 months">{t('proposePage.oneToTwoMonths')}</option>
                      <option value="2-3 months">{t('proposePage.twoToThreeMonths')}</option>
                      <option value="More than 3 months">{t('proposePage.moreThanThreeMonths')}</option>
                    </select>
                  </div>
                </div>
                {/* Work Plan */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">{t('proposePage.workPlanLabel')}</label>
                  <textarea
                    value={workPlan}
                    onChange={(e) => setWorkPlan(e.target.value)}
                    placeholder={t('proposePage.workPlanPlaceholder')}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                {/* Communication Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">{t('proposePage.communicationPreferencesLabel')}</label>
                    <input
                      type="text"
                      value={communicationPreferences}
                      onChange={(e) => setCommunicationPreferences(e.target.value)}
                      placeholder={t('proposePage.communicationPreferencesPlaceholder')}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">{t('proposePage.availabilityLabel')}</label>
                    <input
                      type="text"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      placeholder={t('proposePage.availabilityPlaceholder')}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                {/* Work Samples */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">{t('proposePage.workSamplesLabel')}</label>
                  <div className="mb-2">
                    <label htmlFor="work-sample-upload" className="block cursor-pointer border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors bg-background-secondary">
                      <PaperClipIcon className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                      <span className="text-sm text-text-secondary">{t('proposePage.workSamplesUploadHint')}</span>
                      <input
                        id="work-sample-upload"
                        type="file"
                        ref={fileInputRef}
                        onChange={async (e) => {
                          const files = e.target.files
                          if (files && files.length > 0) {
                            for (let i = 0; i < files.length; i++) {
                              handleFileSelect(files[i])
                            }
                          }
                        }}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                        multiple
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-2">
                    {workSamples.map((sample) => (
                      <div key={sample.id} className="flex items-center gap-2 bg-background-secondary rounded-lg px-3 py-2">
                        {sample.type === 'image' ? (
                          <img src={sample.previewUrl || sample.url} alt={sample.title} className="w-10 h-10 object-cover rounded border border-border" />
                        ) : (
                          <PaperClipIcon className="w-5 h-5 text-text-secondary" />
                        )}
                        <span className="text-xs font-medium text-text-primary truncate max-w-[100px]">{sample.title}</span>
                        <button type="button" onClick={() => removeWorkSample(sample.id)} className="text-error hover:text-error/80">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {uploadingFile && <div className="text-xs text-primary mt-2">{t('proposePage.uploading')}</div>}
                </div>
                {/* Milestones */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-text-primary">{t('proposePage.milestonesLabel')}</label>
                    <button
                      type="button"
                      onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                      className="btn btn-outline btn-xs"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" /> {t('proposePage.addMilestone')}
                    </button>
                  </div>
                  {milestones.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-2 bg-background-secondary rounded-lg px-3 py-2">
                          <div className="flex-1">
                            <div className="font-medium text-text-primary text-sm">{milestone.title}</div>
                            <div className="text-xs text-text-secondary">{milestone.description}</div>
                            <div className="text-xs text-text-secondary">{t('proposePage.budget')}: ₭{milestone.budget.toLocaleString()}</div>
                            <div className="text-xs text-text-secondary">{t('proposePage.dueDate')}: {milestone.dueDate}</div>
                          </div>
                          <button type="button" onClick={() => removeMilestone(milestone.id)} className="text-error hover:text-error/80">
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {showMilestoneForm && (
                    <div className="bg-background-secondary rounded-lg p-4 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        <input
                          type="text"
                          placeholder={t('proposePage.milestoneTitlePlaceholder')}
                          value={newMilestone.title}
                          onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                        <input
                          type="text"
                          placeholder={t('proposePage.milestoneDueDatePlaceholder')}
                          value={newMilestone.dueDate}
                          onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                      </div>
                      <textarea
                        placeholder={t('proposePage.milestoneDescriptionPlaceholder')}
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm mb-2"
                        rows={2}
                      />
                      <input
                        type="number"
                        placeholder={t('proposePage.milestoneBudgetPlaceholder')}
                        value={newMilestone.budget}
                        onChange={(e) => setNewMilestone(prev => ({ ...prev, budget: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm mb-2"
                      />
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowMilestoneForm(false)} className="btn btn-outline btn-xs">{t('proposePage.cancel')}</button>
                        <button type="button" onClick={addMilestone} className="btn btn-primary btn-xs">{t('proposePage.add')}</button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Summary Card */}
                <div className="bg-background-secondary rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-text-primary mb-2">{t('proposePage.proposalSummary')}</h3>
                  <div className="text-sm text-text-secondary">
                    <div><span className="font-medium text-text-primary">{t('proposePage.budget')}:</span> ₭{proposedBudget}</div>
                    {project.budgetType === 'hourly' && (
                      <div><span className="font-medium text-text-primary">{t('proposePage.hourlyRate')}:</span> ₭{proposedRate}</div>
                    )}
                    <div><span className="font-medium text-text-primary">{t('proposePage.estimatedDuration')}:</span> {estimatedDuration}</div>
                  </div>
                </div>
                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary px-8 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? t('proposePage.submitting') : t('proposePage.submitProposal')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 
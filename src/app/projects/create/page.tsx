'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { db } from '@/service/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function CreateProjectPage() {
  const { t } = useTranslationContext()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    budgetType: 'fixed',
    timeline: '',
    skillsRequired: [] as string[],
    deadline: '',
    imageUrl: '',
    projectType: 'client', // 'client' or 'freelancer'
    maxFreelancers: 5, // Number of freelancers that can apply
    visibility: 'public' // 'public' or 'private'
  })
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user, profile } = useAuth()

  const categories = [
    t('createProject.webDevelopment'),
    t('createProject.mobileDevelopment'),
    t('createProject.design'),
    t('createProject.writing'),
    t('createProject.research'),
    t('createProject.dataAnalysis'),
    t('createProject.marketing'),
    t('createProject.translation'),
    t('createProject.other')
  ]

  const timelines = [
    t('createProject.lessThan1Week'),
    t('createProject.oneToTwoWeeks'),
    t('createProject.twoToFourWeeks'),
    t('createProject.oneToTwoMonths'),
    t('createProject.twoToThreeMonths'),
    t('createProject.moreThan3Months')
  ]

  const steps = [
    { id: 1, title: t('createProject.projectTypeVisibility'), description: '' },
    { id: 2, title: t('createProject.basicInformation'), description: '' },
    { id: 3, title: t('createProject.projectDetails'), description: '' },
    { id: 4, title: t('createProject.requirements'), description: '' },
    { id: 5, title: t('createProject.projectMedia'), description: '' },
    { id: 6, title: t('createProject.reviewSubmit'), description: '' }
  ]

  // Upload project image function
  const uploadProjectImage = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folderType', 'projectImage')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        return {
          success: true,
          url: result.data.url,
          storage: result.data.storage
        }
      } else {
        return { success: false, error: result.error || 'Failed to upload image' }
      }
    } catch (error) {
      return { success: false, error: 'Failed to upload image' }
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skillsRequired.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
    }))
  }

  // Handle file selection (do not upload here)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('File size too large. Maximum size is 5MB.')
        return
      }

      setSelectedFile(file)
      setError('')

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  // Remove selected file (do not upload or delete from cloud here)
  const removeSelectedFile = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  // Handle file button click
  const handleFileButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Only save the project to the database on the last step, and upload the image at this time
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a project.')
      return
    }
    setLoading(true)
    setError('')

    try {
      let imageUrl = formData.imageUrl
      if (selectedFile) {
        setUploading(true)
        const uploadResult = await uploadProjectImage(selectedFile)
        setUploading(false)
        if (uploadResult.success) {
          imageUrl = uploadResult.url
        } else {
          setError(uploadResult.error || 'Failed to upload project image')
          setLoading(false)
          return
        }
      }

      // Save the project to Firestore
      await addDoc(collection(db, 'projects'), {
        ...formData,
        imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        clientId: user.uid,
        userId: user.uid,
        userType: formData.projectType === 'client' ? 'client' : 'freelancer',
        status: 'open',
        proposalsCount: 0,
        views: 0,
        completedAt: null,
        freelancerId: null,
        acceptedFreelancerId: null,
        acceptedProposalId: null,
        clientCompleted: {},
        freelancerCompleted: {}
      })
      router.push('/projects')
    } catch (error) {
      setError('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.projectType && formData.maxFreelancers > 0
      case 2:
        return formData.title.trim() && formData.description.trim()
      case 3:
        return formData.category && formData.budget && formData.timeline
      case 4:
        return true // Skills and deadline are optional
      case 5:
        return true // Image is optional
      case 6:
        return true // Review step
      default:
        return false
    }
  }

  // Block if not verified or only freelancer
  const shouldBlock = !user?.emailVerified || (Array.isArray(profile?.userType) ? (profile.userType.length === 1 && profile.userType[0] === 'freelancer') : profile?.userType === 'freelancer')
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
          <h2 className="text-xl font-bold text-text-primary mb-4">{!user?.emailVerified ? t('createProject.emailVerificationRequired') : t('createProject.permissionDenied')}</h2>
          <p className="text-text-secondary mb-6">{!user?.emailVerified ? t('createProject.emailVerificationMessage') : t('createProject.permissionDeniedMessage')}</p>
          <p className="text-xs text-text-secondary mt-4">{t('createProject.redirecting')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-text-secondary">
            <li>
              <Link href="/projects" className="hover:text-primary transition-colors">
                {t('createProject.projects')}
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-text-primary">{t('createProject.createProject')}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-border">
          {/* Step Progress */}
          <div className="border-b border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">{t('createProject.createNewProject')}</h1>
              <span className="text-sm text-text-secondary">{t('createProject.step')} {currentStep} {t('createProject.of')} {steps.length}</span>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-wrap items-start gap-2 sm:gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${step.id <= currentStep
                    ? 'bg-primary text-white'
                    : 'bg-background-secondary text-text-secondary'
                    }`}>
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  <div className="mt-2 text-center min-w-0 flex-1">
                    <div className={`text-xs sm:text-sm font-medium truncate ${step.id <= currentStep ? 'text-text-primary' : 'text-text-secondary'
                      }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-text-secondary truncate hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-4 sm:w-8 h-0.5 mx-2 sm:mx-4 flex-shrink-0 mt-3 ${step.id < currentStep ? 'bg-primary' : 'bg-background-secondary'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Step 1: Project Type */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">{t('createProject.projectTypeVisibility')}</h2>
                  <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">{t('createProject.projectTypeDesc')}</p>
                </div>

                {/* Project Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">
                    {t('createProject.whoAreYouPosting')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.projectType === 'client'
                        ? 'border-primary bg-primary-light/10'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, projectType: 'client' }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          C
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">{t('createProject.client')}</h3>
                          <p className="text-sm text-text-secondary">{t('createProject.clientDesc')}</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.projectType === 'freelancer'
                        ? 'border-primary bg-primary-light/10'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, projectType: 'freelancer' }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
                          F
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">{t('createProject.freelancer')}</h3>
                          <p className="text-sm text-text-secondary">{t('createProject.freelancerDesc')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Max Freelancers */}
                <div>
                  <label htmlFor="maxFreelancers" className="block text-sm font-semibold text-text-primary mb-2">
                    {t('createProject.maxFreelancers')}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      id="maxFreelancers"
                      name="maxFreelancers"
                      required
                      min="1"
                      max="50"
                      value={formData.maxFreelancers}
                      onChange={handleChange}
                      className="w-24 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                    <span className="text-sm text-text-secondary">{t('createProject.freelancers')}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {t('createProject.maxFreelancersDesc')}
                  </p>
                </div>

                {/* Project Visibility */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">
                    {t('createProject.projectVisibility')}
                  </label>
                  <div className="space-y-3">
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.visibility === 'public'
                        ? 'border-primary bg-primary-light/10'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">{t('createProject.public')}</h3>
                          <p className="text-sm text-text-secondary">{t('createProject.publicDesc')}</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.visibility === 'private'
                        ? 'border-primary bg-primary-light/10'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">{t('createProject.private')}</h3>
                          <p className="text-sm text-text-secondary">{t('createProject.privateDesc')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Basic Info */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">{t('createProject.basicInformation')}</h2>
                  <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">{t('createProject.basicInfoDesc')}</p>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-text-primary mb-2">
                    {t('createProject.projectTitle')}
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    placeholder={t('createProject.titlePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-text-primary mb-2">
                    {t('createProject.projectDescription')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    placeholder={t('createProject.descriptionPlaceholder')}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">{t('createProject.projectDetails')}</h2>
                  <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">{t('createProject.detailsDesc')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-text-primary mb-2">
                      {t('createProject.category')}
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">{t('createProject.selectCategory')}</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="timeline" className="block text-sm font-semibold text-text-primary mb-2">
                      {t('createProject.timeline')}
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      required
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">{t('createProject.selectTimeline')}</option>
                      {timelines.map(timeline => (
                        <option key={timeline} value={timeline}>{timeline}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="sm:col-span-2">
                    <label htmlFor="budget" className="block text-sm font-semibold text-text-primary mb-2">
                      {t('createProject.budget')}
                    </label>
                    <input
                      type="number"
                      id="budget"
                      name="budget"
                      required
                      min="1"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                      placeholder={t('createProject.budgetPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="budgetType" className="block text-sm font-semibold text-text-primary mb-2">
                      {t('createProject.budgetType')}
                    </label>
                    <select
                      id="budgetType"
                      name="budgetType"
                      required
                      value={formData.budgetType}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="fixed">{t('createProject.fixedPrice')}</option>
                      <option value="hourly">{t('createProject.hourlyRate')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Requirements */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">{t('createProject.requirements')}</h2>
                  <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">{t('createProject.requirementsDesc')}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    {t('createProject.skillsRequired')}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                      placeholder={t('createProject.skillPlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm sm:text-base"
                    >
                      {t('createProject.add')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skillsRequired.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 bg-primary-light text-primary rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2 font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-primary hover:text-primary-hover text-lg"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-semibold text-text-primary mb-2">
                    {t('createProject.deadline')}
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Media */}
            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">{t('createProject.projectMedia')}</h2>
                  <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">{t('createProject.mediaDesc')}</p>
                </div>

                <div>
                  <label htmlFor="projectImage" className="block text-sm font-semibold text-text-primary mb-2">
                    {t('createProject.projectImage')}
                  </label>

                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative w-full max-w-md">
                        <img
                          src={previewUrl}
                          alt="Project Preview"
                          className="w-full h-32 sm:h-48 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={removeSelectedFile}
                          className="absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-text-secondary">
                        {t('createProject.selected')}: {selectedFile?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-8 text-center">
                      <PhotoIcon className="w-8 h-8 sm:w-12 sm:h-12 text-text-secondary mx-auto mb-2 sm:mb-4" />
                      <p className="text-sm sm:text-base text-text-secondary mb-2 sm:mb-4">{t('createProject.noImageSelected')}</p>
                      <input
                        type="file"
                        id="projectImage"
                        name="projectImage"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <button
                        type="button"
                        onClick={handleFileButtonClick}
                        className="btn btn-outline px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                      >
                        {t('createProject.chooseImage')}
                      </button>
                    </div>
                  )}

                  {!previewUrl && (
                    <input
                      type="file"
                      id="projectImage"
                      name="projectImage"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      ref={fileInputRef}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">{t('createProject.reviewSubmit')}</h2>
                  <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">{t('createProject.reviewDesc')}</p>
                </div>

                <div className="bg-background-secondary rounded-lg p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h3 className="font-semibold text-text-primary mb-2 text-sm sm:text-base">{t('createProject.projectDetails')}</h3>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div>
                          <span className="text-text-secondary">Title:</span>
                          <span className="ml-2 text-text-primary">{formData.title}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Category:</span>
                          <span className="ml-2 text-text-primary">{formData.category}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Timeline:</span>
                          <span className="ml-2 text-text-primary">{formData.timeline}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Budget:</span>
                          <span className="ml-2 text-text-primary">₭{Number(formData.budget).toLocaleString()} ({formData.budgetType})</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Project Type:</span>
                          <span className="ml-2 text-text-primary capitalize">{formData.projectType}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Max Freelancers:</span>
                          <span className="ml-2 text-text-primary">{formData.maxFreelancers}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Visibility:</span>
                          <span className="ml-2 text-text-primary capitalize">{formData.visibility}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-text-primary mb-2 text-sm sm:text-base">{t('createProject.requirements')}</h3>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div>
                          <span className="text-text-secondary">Skills:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formData.skillsRequired.length > 0 ? (
                              formData.skillsRequired.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-primary-light text-primary rounded text-xs">
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-text-secondary">{t('createProject.noneSpecified')}</span>
                            )}
                          </div>
                        </div>
                        {formData.deadline && (
                          <div>
                            <span className="text-text-secondary">Deadline:</span>
                            <span className="ml-2 text-text-primary">{formData.deadline}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-text-primary mb-2 text-sm sm:text-base">{t('createProject.description')}</h3>
                    <p className="text-xs sm:text-sm text-text-primary bg-white p-3 rounded border">
                      {formData.description}
                    </p>
                  </div>

                  {previewUrl && (
                    <div>
                      <h3 className="font-semibold text-text-primary mb-2 text-sm sm:text-base">{t('createProject.projectImage')}</h3>
                      <img
                        src={previewUrl}
                        alt="Project Preview"
                        className="w-24 h-18 sm:w-32 sm:h-24 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 sm:pt-8 border-t border-border">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn btn-outline px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                {t('createProject.previous')}
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="btn btn-primary px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {t('createProject.next')}
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              ) : (
                <form onSubmit={handleSubmit}>
                  <button
                    type="submit"
                    disabled={loading || !isStepValid(currentStep)}
                    className="btn btn-primary px-6 sm:px-8 py-2 sm:py-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {loading ? t('createProject.creatingProject') : t('createProject.createProject')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
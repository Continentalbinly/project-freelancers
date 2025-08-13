'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { signupUser } from '@/service/auth-client'
import { SignupCredentials } from '@/types/auth'
import { useTranslationContext } from '@/app/components/LanguageProvider'

export default function SignupPage() {
  const { t } = useTranslationContext()
  const [formData, setFormData] = useState<SignupCredentials>({
    email: '',
    password: '',
    fullName: '',
    userType: 'freelancer',
    userRoles: ['freelancer'],
    avatarUrl: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    phone: '',
    location: '',
    country: '',
    city: '',
    university: '',
    fieldOfStudy: '',
    graduationYear: '',
    skills: [],
    bio: '',
    hourlyRate: 0,
    institution: '',
    department: '',
    position: '',
    yearsOfExperience: 0,
    userCategory: 'student', // New field: student or worker
    clientCategory: 'teacher', // New field: teacher, worker, or freelancer
    acceptTerms: false,
    acceptPrivacyPolicy: false,
    acceptMarketingEmails: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [skillInput, setSkillInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [lastUploadedAvatarUrl, setLastUploadedAvatarUrl] = useState<string | null>(null)

  // Upload profile image function
  const uploadProfileImage = async (file: File) => {
    try {
      // If there is a previously uploaded avatar, delete it
      if (lastUploadedAvatarUrl) {
        await fetch('/api/delete-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: lastUploadedAvatarUrl })
        })
        setLastUploadedAvatarUrl(null)
      }
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folderType', 'profileImage') // Specify folder type for profile images

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (result.success) {
        setLastUploadedAvatarUrl(result.data.url)
        return {
          success: true,
          url: result.data.url,
          storage: result.data.storage
        }
      } else {
        return { success: false, error: result.error || 'Failed to upload image' }
      }
    } catch (error) {
      return { success: false, error: t('auth.signup.errors.uploadFailed') }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Upload profile image if selected
      let avatarUrl = formData.avatarUrl
      if (selectedFile) {
        setUploading(true)
        const uploadResult = await uploadProfileImage(selectedFile)
        if (uploadResult.success) {
          avatarUrl = uploadResult.url
        } else {
          setError(uploadResult.error || t('auth.signup.errors.uploadFailed'))
          setLoading(false)
          setUploading(false)
          return
        }
        setUploading(false)
      }

      const result = await signupUser(
        formData.email,
        formData.password,
        formData.fullName,
        formData.userRoles[0] || 'freelancer', // Use first role as default userType
        avatarUrl,
        {
          userType: formData.userRoles, // Send userRoles as userType array
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phone: formData.phone,
          location: formData.location,
          country: formData.country,
          city: formData.city,
          university: formData.university,
          fieldOfStudy: formData.fieldOfStudy,
          graduationYear: formData.graduationYear,
          skills: formData.skills,
          bio: formData.bio,
          hourlyRate: formData.hourlyRate,
          institution: formData.institution,
          department: formData.department,
          position: formData.position,
          yearsOfExperience: formData.yearsOfExperience,
          acceptTerms: formData.acceptTerms,
          acceptPrivacyPolicy: formData.acceptPrivacyPolicy,
          acceptMarketingEmails: formData.acceptMarketingEmails
          // clientCategory and userCategory will be saved to Firestore after signup
        }
      )

      if (result.success) {
        // Save userCategory and clientCategory to Firestore profile after signup
        try {
          const userId = result.user?.id || result.user?.uid;
          if (userId && (formData.userCategory || formData.clientCategory)) {
            await fetch(`/api/profile/${userId}/update-category`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userCategory: formData.userCategory,
                clientCategory: formData.clientCategory
              })
            });
          }
        } catch (e) {
          // Optionally handle error
        }
        if (result.requiresVerification) {
          // Redirect to email verification page
          window.location.href = '/auth/verify-email'
        } else {
          // Redirect to home page after successful signup
          window.location.href = '/'
        }
      } else {
        setError(result.error || t('auth.signup.errors.signupFailed'))
      }
    } catch (err) {
      setError(t('auth.signup.errors.unexpectedError'))
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.checked
    }))
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }))
  }

  // Handle file selection
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

      // If there is a previously uploaded avatar, delete it
      if (lastUploadedAvatarUrl) {
        fetch('/api/delete-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: lastUploadedAvatarUrl })
        })
        setLastUploadedAvatarUrl(null)
      }

      setSelectedFile(file)
      setError('')

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    if (lastUploadedAvatarUrl) {
      fetch('/api/delete-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: lastUploadedAvatarUrl })
      })
      setLastUploadedAvatarUrl(null)
    }
  }

  // Handle file button click
  const handleFileButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.password && formData.userRoles.length > 0
      case 2:
        const basicInfoValid = formData.dateOfBirth && formData.gender && formData.phone
        if (!basicInfoValid) return false

        // If user is freelancer, they must select a category
        if (formData.userRoles.includes('freelancer')) {
          return formData.userCategory && formData.userCategory.length > 0
        }

        return true
      case 3:
        return formData.acceptTerms && formData.acceptPrivacyPolicy
      default:
        return false
    }
  }

  return (
    <div className="bg-white py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 shadow-lg rounded-lg border border-border w-full max-w-4xl mx-auto">
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-2">{t('auth.signup.title')}</h2>
        <p className="text-text-secondary text-sm sm:text-base lg:text-lg">
          {t('auth.signup.subtitle')}
        </p>

        {/* Progress Steps */}
        <div className="flex justify-center mt-4 sm:mt-6 lg:mt-8 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm lg:text-base font-medium transition-all duration-300 ${currentStep >= step
                  ? 'bg-primary text-white shadow-lg scale-110'
                  : 'bg-background-secondary text-text-secondary'
                  }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-4 sm:w-8 lg:w-16 h-1 mx-1 sm:mx-2 lg:mx-4 rounded-full transition-all duration-300 ${currentStep > step ? 'bg-primary' : 'bg-background-secondary'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">{t('auth.signup.step1.title')}</h3>
              <p className="text-text-secondary">{t('auth.signup.step1.subtitle')}</p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                    {t('auth.signup.step1.fullName')}
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder={t('auth.signup.step1.fullNamePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                    {t('auth.signup.step1.email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder={t('auth.signup.step1.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                    {t('auth.signup.step1.password')}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder={t('auth.signup.step1.passwordPlaceholder')}
                  />
                  <p className="text-xs text-text-muted mt-2">
                    {t('auth.signup.step1.passwordHint')}
                  </p>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3 sm:mb-4">
                  {t('auth.signup.step1.roleTitle')}
                </label>
                <div className="space-y-3 sm:space-y-4">
                  <label className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${formData.userRoles.includes('freelancer')
                    ? 'border-primary bg-primary-light/20'
                    : 'border-border hover:border-primary/50'
                    }`}>
                    <input
                      type="checkbox"
                      checked={formData.userRoles.includes('freelancer')}
                      onChange={(e) => {
                        const newRoles = e.target.checked
                          ? [...formData.userRoles.filter(role => role !== 'freelancer'), 'freelancer']
                          : formData.userRoles.filter(role => role !== 'freelancer')
                        setFormData(prev => ({
                          ...prev,
                          userRoles: newRoles as ('freelancer' | 'client' | 'admin')[],
                          userType: (newRoles.length > 0 ? newRoles[0] : 'freelancer') as 'freelancer' | 'client' | 'admin'
                        }))
                      }}
                      className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border rounded"
                    />
                    <div className="ml-3 sm:ml-4 flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <span className="text-base sm:text-lg font-semibold text-text-primary">{t('auth.signup.step1.freelancer.title')}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{t('auth.signup.step1.freelancer.description')}</p>
                    </div>
                  </label>

                  <label className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${formData.userRoles.includes('client')
                    ? 'border-secondary bg-secondary-light/20'
                    : 'border-border hover:border-secondary/50'
                    }`}>
                    <input
                      type="checkbox"
                      checked={formData.userRoles.includes('client')}
                      onChange={(e) => {
                        const newRoles = e.target.checked
                          ? [...formData.userRoles.filter(role => role !== 'client'), 'client']
                          : formData.userRoles.filter(role => role !== 'client')
                        setFormData(prev => ({
                          ...prev,
                          userRoles: newRoles as ('freelancer' | 'client' | 'admin')[],
                          userType: (newRoles.length > 0 ? newRoles[0] : 'freelancer') as 'freelancer' | 'client' | 'admin'
                        }))
                      }}
                      className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-secondary focus:ring-secondary border-border rounded"
                    />
                    <div className="ml-3 sm:ml-4 flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                        <span className="text-base sm:text-lg font-semibold text-text-primary">{t('auth.signup.step1.client.title')}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{t('auth.signup.step1.client.description')}</p>
                    </div>
                  </label>
                </div>

                {formData.userRoles.length === 0 && (
                  <p className="text-sm text-error mt-3">{t('auth.signup.step1.roleError')}</p>
                )}
              </div>

              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3 sm:mb-4">
                  {t('auth.signup.step1.profilePicture')}
                </label>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 ${selectedFile
                    ? 'border-primary bg-primary-light/10'
                    : 'border-border hover:border-primary/50 hover:bg-primary-light/5'
                    }`}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      tabIndex={-1}
                    />

                    {!previewUrl ? (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={handleFileButtonClick}
                            className="btn btn-primary text-sm sm:text-base"
                          >
                            {t('auth.signup.step1.chooseImage')}
                          </button>
                          <p className="text-xs sm:text-sm text-text-muted mt-2">
                            {t('auth.signup.step1.imageHint')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden mx-auto border-2 sm:border-4 border-white shadow-lg flex-shrink-0 aspect-square">
                          <img
                            src={previewUrl}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-text-primary truncate">{selectedFile?.name}</p>
                          <p className="text-xs text-text-muted">
                            {selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0'} MB
                          </p>
                          <div className="flex justify-center space-x-2">
                            <button
                              type="button"
                              onClick={handleFileButtonClick}
                              className="text-sm text-primary hover:text-primary-hover font-medium"
                            >
                              {t('auth.signup.step1.change')}
                            </button>
                            <span className="text-text-muted">•</span>
                            <button
                              type="button"
                              onClick={removeSelectedFile}
                              className="text-sm text-error hover:text-error/80 font-medium"
                            >
                              {t('auth.signup.step1.remove')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="flex items-center justify-center space-x-3 p-3 sm:p-4 bg-primary-light/20 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary"></div>
                      <span className="text-sm font-medium text-primary">{t('auth.signup.step1.uploading')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            {formData.userRoles.length > 0 && (
              <div className="bg-gradient-to-r from-primary-light/20 to-secondary-light/20 rounded-xl p-4 sm:p-6 border border-primary/20">
                <h3 className="font-semibold text-primary mb-3 sm:mb-4 text-base sm:text-lg">
                  {formData.userRoles.length === 1
                    ? (formData.userRoles[0] === 'freelancer' ? t('auth.signup.step1.benefits.freelancer.title') : t('auth.signup.step1.benefits.client.title'))
                    : t('auth.signup.step1.benefits.dual.title')
                  }
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {formData.userRoles.includes('freelancer') && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-text-primary">{t('auth.signup.step1.benefits.freelancer.subtitle')}</h4>
                      <ul className="text-sm text-text-secondary space-y-1">
                        <li>• {t('auth.signup.step1.benefits.freelancer.items.0')}</li>
                        <li>• {t('auth.signup.step1.benefits.freelancer.items.1')}</li>
                        <li>• {t('auth.signup.step1.benefits.freelancer.items.2')}</li>
                        <li>• {t('auth.signup.step1.benefits.freelancer.items.3')}</li>
                      </ul>
                    </div>
                  )}
                  {formData.userRoles.includes('client') && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-text-primary">{t('auth.signup.step1.benefits.client.subtitle')}</h4>
                      <ul className="text-sm text-text-secondary space-y-1">
                        <li>• {t('auth.signup.step1.benefits.client.items.0')}</li>
                        <li>• {t('auth.signup.step1.benefits.client.items.1')}</li>
                        <li>• {t('auth.signup.step1.benefits.client.items.2')}</li>
                        <li>• {t('auth.signup.step1.benefits.client.items.3')}</li>
                      </ul>
                    </div>
                  )}
                  {formData.userRoles.length > 1 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-text-primary">{t('auth.signup.step1.benefits.dual.subtitle')}</h4>
                      <ul className="text-sm text-text-secondary space-y-1">
                        <li>• {t('auth.signup.step1.benefits.dual.items.0')}</li>
                        <li>• {t('auth.signup.step1.benefits.dual.items.1')}</li>
                        <li>• {t('auth.signup.step1.benefits.dual.items.2')}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Personal Information */}
        {currentStep === 2 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">{t('auth.signup.step2.title')}</h3>
              <p className="text-text-secondary">{t('auth.signup.step2.subtitle')}</p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                    {t('auth.signup.step2.dateOfBirth')}
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                    {t('auth.signup.step2.gender')}
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <option value="prefer_not_to_say">{t('auth.signup.step2.genderOptions.preferNotToSay')}</option>
                    <option value="male">{t('auth.signup.step2.genderOptions.male')}</option>
                    <option value="female">{t('auth.signup.step2.genderOptions.female')}</option>
                    <option value="other">{t('auth.signup.step2.genderOptions.other')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                  {t('auth.signup.step2.phone')}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder={t('auth.signup.step2.phonePlaceholder')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                    {t('auth.signup.step2.country')}
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder={t('auth.signup.step2.countryPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                    {t('auth.signup.step2.city')}
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder={t('auth.signup.step2.cityPlaceholder')}
                  />
                </div>
              </div>

              {/* User Category Selection for Freelancers */}
              {formData.userRoles.includes('freelancer') && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-primary-light/10 rounded-xl p-4 sm:p-6 border border-primary/20">
                    <h4 className="font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {t('auth.signup.step2.userCategory.title')}
                    </h4>

                    <div className="space-y-3 sm:space-y-4">
                      <label className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${formData.userCategory === 'student'
                        ? 'border-primary bg-primary-light/20'
                        : 'border-border hover:border-primary/50'
                        }`}>
                        <input
                          type="radio"
                          name="userCategory"
                          value="student"
                          checked={formData.userCategory === 'student'}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border"
                        />
                        <div className="ml-3 sm:ml-4 flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <span className="text-base sm:text-lg font-semibold text-text-primary">{t('auth.signup.step2.userCategory.student.title')}</span>
                          </div>
                          <p className="text-sm text-text-secondary">{t('auth.signup.step2.userCategory.student.description')}</p>
                        </div>
                      </label>

                      <label className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${formData.userCategory === 'worker'
                        ? 'border-primary bg-primary-light/20'
                        : 'border-border hover:border-primary/50'
                        }`}>
                        <input
                          type="radio"
                          name="userCategory"
                          value="worker"
                          checked={formData.userCategory === 'worker'}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border"
                        />
                        <div className="ml-3 sm:ml-4 flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                              </svg>
                            </div>
                            <span className="text-base sm:text-lg font-semibold text-text-primary">{t('auth.signup.step2.userCategory.worker.title')}</span>
                          </div>
                          <p className="text-sm text-text-secondary">{t('auth.signup.step2.userCategory.worker.description')}</p>
                        </div>
                      </label>
                      <label className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${formData.userCategory === 'freelancer'
                        ? 'border-primary bg-primary-light/20'
                        : 'border-border hover:border-primary/50'
                        }`}>
                        <input
                          type="radio"
                          name="userCategory"
                          value="freelancer"
                          checked={formData.userCategory === 'freelancer'}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border"
                        />
                        <div className="ml-3 sm:ml-4 flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2M5 10a4 4 0 018 0v2a4 4 0 01-8 0v-2z" />
                              </svg>
                            </div>
                            <span className="text-base sm:text-lg font-semibold text-text-primary">{t('auth.signup.step2.userCategory.freelancer.title')}</span>
                          </div>
                          <p className="text-sm text-text-secondary">{t('auth.signup.step2.userCategory.freelancer.description')}</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* User Category Selection for Clients */}
              {formData.userRoles.includes('client') && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-secondary-light/10 rounded-xl p-4 sm:p-6 border border-secondary/20">
                    <h4 className="font-semibold text-secondary mb-3 sm:mb-4 flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t('auth.signup.step2.clientCategory.title')}
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                      <label className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${formData.clientCategory === 'teacher'
                        ? 'border-secondary bg-secondary-light/20'
                        : 'border-border hover:border-secondary/50'
                        }`}>
                        <input
                          type="radio"
                          name="clientCategory"
                          value="teacher"
                          checked={formData.clientCategory === 'teacher'}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-secondary focus:ring-secondary border-border"
                        />
                        <div className="ml-3 sm:ml-4 flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </div>
                            <span className="text-base sm:text-lg font-semibold text-text-primary">{t('auth.signup.step2.clientCategory.teacher.title')}</span>
                          </div>
                          <p className="text-sm text-text-secondary">{t('auth.signup.step2.clientCategory.teacher.description')}</p>
                        </div>
                      </label>
                      <label className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${formData.clientCategory === 'worker'
                        ? 'border-secondary bg-secondary-light/20'
                        : 'border-border hover:border-secondary/50'
                        }`}>
                        <input
                          type="radio"
                          name="clientCategory"
                          value="worker"
                          checked={formData.clientCategory === 'worker'}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-secondary focus:ring-secondary border-border"
                        />
                        <div className="ml-3 sm:ml-4 flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                              </svg>
                            </div>
                            <span className="text-base sm:text-lg font-semibold text-text-primary">{t('auth.signup.step2.clientCategory.worker.title')}</span>
                          </div>
                          <p className="text-sm text-text-secondary">{t('auth.signup.step2.clientCategory.worker.description')}</p>
                        </div>
                      </label>
                      <label className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${formData.clientCategory === 'freelancer'
                        ? 'border-secondary bg-secondary-light/20'
                        : 'border-border hover:border-secondary/50'
                        }`}>
                        <input
                          type="radio"
                          name="clientCategory"
                          value="freelancer"
                          checked={formData.clientCategory === 'freelancer'}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-secondary focus:ring-secondary border-border"
                        />
                        <div className="ml-3 sm:ml-4 flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2M5 10a4 4 0 018 0v2a4 4 0 01-8 0v-2z" />
                              </svg>
                            </div>
                            <span className="text-base sm:text-lg font-semibold text-text-primary">{t('auth.signup.step2.clientCategory.freelancer.title')}</span>
                          </div>
                          <p className="text-sm text-text-secondary">{t('auth.signup.step2.clientCategory.freelancer.description')}</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher-specific fields for client */}
              {formData.userRoles.includes('client') && formData.clientCategory === 'teacher' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-secondary-light/10 rounded-xl p-4 sm:p-6 border border-secondary/20">
                    <h4 className="font-semibold text-secondary mb-3 sm:mb-4 flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t('auth.signup.step2.clientInfo.title')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="institution" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.clientInfo.institution')}
                        </label>
                        <input
                          id="institution"
                          name="institution"
                          type="text"
                          value={formData.institution}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.clientInfo.institutionPlaceholder')}
                        />
                      </div>
                      <div>
                        <label htmlFor="department" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.clientInfo.department')}
                        </label>
                        <input
                          id="department"
                          name="department"
                          type="text"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.clientInfo.departmentPlaceholder')}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                      <div>
                        <label htmlFor="position" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.clientInfo.position')}
                        </label>
                        <input
                          id="position"
                          name="position"
                          type="text"
                          value={formData.position}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.clientInfo.positionPlaceholder')}
                        />
                      </div>
                      <div>
                        <label htmlFor="yearsOfExperience" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.clientInfo.yearsOfExperience')}
                        </label>
                        <input
                          id="yearsOfExperience"
                          name="yearsOfExperience"
                          type="number"
                          min="0"
                          value={formData.yearsOfExperience}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.clientInfo.yearsOfExperiencePlaceholder')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Worker-specific fields for client */}
              {formData.userRoles.includes('client') && formData.clientCategory === 'worker' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-secondary-light/10 rounded-xl p-4 sm:p-6 border border-secondary/20">
                    <h4 className="font-semibold text-secondary mb-3 sm:mb-4 flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                      {t('auth.signup.step2.workerInfo.title')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="institution" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.workerInfo.company')}
                        </label>
                        <input
                          id="institution"
                          name="institution"
                          type="text"
                          value={formData.institution}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.workerInfo.companyPlaceholder')}
                        />
                      </div>
                      <div>
                        <label htmlFor="department" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.workerInfo.department')}
                        </label>
                        <input
                          id="department"
                          name="department"
                          type="text"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.workerInfo.departmentPlaceholder')}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                      <div>
                        <label htmlFor="position" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.workerInfo.position')}
                        </label>
                        <input
                          id="position"
                          name="position"
                          type="text"
                          value={formData.position}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.workerInfo.positionPlaceholder')}
                        />
                      </div>
                      <div>
                        <label htmlFor="yearsOfExperience" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.workerInfo.yearsOfExperience')}
                        </label>
                        <input
                          id="yearsOfExperience"
                          name="yearsOfExperience"
                          type="number"
                          min="0"
                          value={formData.yearsOfExperience}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.workerInfo.yearsOfExperiencePlaceholder')}
                        />
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <label htmlFor="bio" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.workerInfo.bio')}
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.signup.step2.workerInfo.bioPlaceholder')}
                      />
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <label htmlFor="hourlyRate" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.workerInfo.hourlyRate')}
                      </label>
                      <input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.signup.step2.workerInfo.hourlyRatePlaceholder')}
                      />
                      <p className="text-xs text-text-muted mt-2">
                        {t('auth.signup.step2.workerInfo.hourlyRateHint')}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <label className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.workerInfo.skills')}
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.workerInfo.addSkill')}
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-white rounded-lg hover:bg-secondary-hover transition-colors font-medium"
                        >
                          {t('auth.signup.step2.workerInfo.addSkillButton')}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills?.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-secondary-light text-secondary rounded-full text-sm flex items-center gap-1 sm:gap-2 font-medium"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-secondary hover:text-secondary-hover text-lg"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Freelancer-specific fields for client */}
              {formData.userRoles.includes('client') && formData.clientCategory === 'freelancer' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-secondary-light/10 rounded-xl p-4 sm:p-6 border border-secondary/20">
                    <h4 className="font-semibold text-secondary mb-3 sm:mb-4 flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2M5 10a4 4 0 018 0v2a4 4 0 01-8 0v-2z" />
                      </svg>
                      {t('auth.signup.step2.pureFreelancerInfo.title')}
                    </h4>
                    <div className="mt-4 sm:mt-6">
                      <label htmlFor="bio" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.pureFreelancerInfo.bio')}
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.signup.step2.pureFreelancerInfo.bioPlaceholder')}
                      />
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <label htmlFor="hourlyRate" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.pureFreelancerInfo.hourlyRate')}
                      </label>
                      <input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.signup.step2.pureFreelancerInfo.hourlyRatePlaceholder')}
                      />
                      <p className="text-xs text-text-muted mt-2">
                        {t('auth.signup.step2.pureFreelancerInfo.hourlyRateHint')}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <label className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.pureFreelancerInfo.skills')}
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.pureFreelancerInfo.addSkill')}
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-white rounded-lg hover:bg-secondary-hover transition-colors font-medium"
                        >
                          {t('auth.signup.step2.pureFreelancerInfo.addSkillButton')}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills?.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-secondary-light text-secondary rounded-full text-sm flex items-center gap-1 sm:gap-2 font-medium"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-secondary hover:text-secondary-hover text-lg"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pure Freelancer-specific fields */}
              {formData.userRoles.includes('freelancer') && formData.userCategory === 'freelancer' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-primary-light/10 rounded-xl p-4 sm:p-6 border border-primary/20">
                    <h4 className="font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2M5 10a4 4 0 018 0v2a4 4 0 01-8 0v-2z" />
                      </svg>
                      {t('auth.signup.step2.pureFreelancerInfo.title')}
                    </h4>
                    <div className="mt-4 sm:mt-6">
                      <label htmlFor="bio" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.pureFreelancerInfo.bio')}
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.signup.step2.pureFreelancerInfo.bioPlaceholder')}
                      />
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <label htmlFor="hourlyRate" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.pureFreelancerInfo.hourlyRate')}
                      </label>
                      <input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.signup.step2.pureFreelancerInfo.hourlyRatePlaceholder')}
                      />
                      <p className="text-xs text-text-muted mt-2">
                        {t('auth.signup.step2.pureFreelancerInfo.hourlyRateHint')}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <label className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.pureFreelancerInfo.skills')}
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.pureFreelancerInfo.addSkill')}
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                        >
                          {t('auth.signup.step2.pureFreelancerInfo.addSkillButton')}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills?.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-primary-light text-primary rounded-full text-sm flex items-center gap-1 sm:gap-2 font-medium"
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
                  </div>
                </div>
              )}

              {/* Student-specific fields */}
              {formData.userRoles.includes('freelancer') && formData.userCategory === 'student' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-primary-light/10 rounded-xl p-4 sm:p-6 border border-primary/20">
                    <h4 className="font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {t('auth.signup.step2.studentInfo.title')}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="university" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.studentInfo.university')}
                        </label>
                        <input
                          id="university"
                          name="university"
                          type="text"
                          value={formData.university}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.studentInfo.universityPlaceholder')}
                        />
                      </div>

                      <div>
                        <label htmlFor="fieldOfStudy" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.studentInfo.fieldOfStudy')}
                        </label>
                        <input
                          id="fieldOfStudy"
                          name="fieldOfStudy"
                          type="text"
                          value={formData.fieldOfStudy}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.studentInfo.fieldOfStudyPlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6">
                      <label htmlFor="graduationYear" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.studentInfo.graduationYear')}
                      </label>
                      <input
                        id="graduationYear"
                        name="graduationYear"
                        type="number"
                        min="2024"
                        max="2030"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.signup.step2.studentInfo.graduationYearPlaceholder')}
                      />
                    </div>

                    <div className="mt-4 sm:mt-6">
                      <label htmlFor="bio" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.studentInfo.bio')}
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.signup.step2.studentInfo.bioPlaceholder')}
                      />
                    </div>

                    <div className="mt-4 sm:mt-6">
                      <label htmlFor="hourlyRate" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.studentInfo.hourlyRate')}
                      </label>
                      <input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.signup.step2.studentInfo.hourlyRatePlaceholder')}
                      />
                      <p className="text-xs text-text-muted mt-2">
                        {t('auth.signup.step2.studentInfo.hourlyRateHint')}
                      </p>
                    </div>

                    <div className="mt-4 sm:mt-6">
                      <label className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.studentInfo.skills')}
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.studentInfo.addSkill')}
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                        >
                          {t('auth.signup.step2.studentInfo.addSkillButton')}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills?.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-primary-light text-primary rounded-full text-sm flex items-center gap-1 sm:gap-2 font-medium"
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
                  </div>
                </div>
              )}

              {/* Worker-specific fields */}
              {formData.userRoles.includes('freelancer') && formData.userCategory === 'worker' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-primary-light/10 rounded-xl p-4 sm:p-6 border border-primary/20">
                    <h4 className="font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                      {t('auth.signup.step2.workerInfo.title')}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="institution" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.workerInfo.company')}
                        </label>
                        <input
                          id="institution"
                          name="institution"
                          type="text"
                          value={formData.institution}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.workerInfo.companyPlaceholder')}
                        />
                      </div>

                      <div>
                        <label htmlFor="department" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.workerInfo.department')}
                        </label>
                        <input
                          id="department"
                          name="department"
                          type="text"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.workerInfo.departmentPlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                      <div>
                        <label htmlFor="position" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.workerInfo.position')}
                        </label>
                        <input
                          id="position"
                          name="position"
                          type="text"
                          value={formData.position}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.workerInfo.positionPlaceholder')}
                        />
                      </div>

                      <div>
                        <label htmlFor="yearsOfExperience" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                          {t('auth.signup.step2.workerInfo.yearsOfExperience')}
                        </label>
                        <input
                          id="yearsOfExperience"
                          name="yearsOfExperience"
                          type="number"
                          min="0"
                          value={formData.yearsOfExperience}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.workerInfo.yearsOfExperiencePlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6">
                      <label htmlFor="bio" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.workerInfo.bio')}
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.signup.step2.workerInfo.bioPlaceholder')}
                      />
                    </div>

                    <div className="mt-4 sm:mt-6">
                      <label htmlFor="hourlyRate" className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.workerInfo.hourlyRate')}
                      </label>
                      <input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.signup.step2.workerInfo.hourlyRatePlaceholder')}
                      />
                      <p className="text-xs text-text-muted mt-2">
                        {t('auth.signup.step2.workerInfo.hourlyRateHint')}
                      </p>
                    </div>

                    <div className="mt-4 sm:mt-6">
                      <label className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
                        {t('auth.signup.step2.workerInfo.skills')}
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder={t('auth.signup.step2.workerInfo.addSkill')}
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                        >
                          {t('auth.signup.step2.workerInfo.addSkillButton')}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills?.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-primary-light text-primary rounded-full text-sm flex items-center gap-1 sm:gap-2 font-medium"
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
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Terms and Conditions */}
        {currentStep === 3 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">{t('auth.signup.step3.title')}</h3>
              <p className="text-text-secondary">{t('auth.signup.step3.subtitle')}</p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 bg-background-secondary rounded-lg">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleCheckboxChange}
                  className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="acceptTerms" className="text-sm text-text-secondary">
                  {t('auth.signup.step3.termsOfService.label').split('Terms of Service').map((part, index, array) => (
                    <span key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <Link href="/terms" className="text-primary hover:text-primary-hover font-medium">
                          {t('auth.signup.step3.termsOfService.link')}
                        </Link>
                      )}
                    </span>
                  ))}
                </label>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 bg-background-secondary rounded-lg">
                <input
                  id="acceptPrivacyPolicy"
                  name="acceptPrivacyPolicy"
                  type="checkbox"
                  required
                  checked={formData.acceptPrivacyPolicy}
                  onChange={handleCheckboxChange}
                  className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="acceptPrivacyPolicy" className="text-sm text-text-secondary">
                  {t('auth.signup.step3.privacyPolicy.label').split('Privacy Policy').map((part, index, array) => (
                    <span key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <Link href="/privacy" className="text-primary hover:text-primary-hover font-medium">
                          {t('auth.signup.step3.privacyPolicy.link')}
                        </Link>
                      )}
                    </span>
                  ))}
                </label>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 bg-background-secondary rounded-lg">
                <input
                  id="acceptMarketingEmails"
                  name="acceptMarketingEmails"
                  type="checkbox"
                  checked={formData.acceptMarketingEmails}
                  onChange={handleCheckboxChange}
                  className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="acceptMarketingEmails" className="text-sm text-text-secondary">
                  {t('auth.signup.step3.marketingEmails.label')}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 sm:pt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-outline px-6 sm:px-8 py-2 sm:py-3 order-2 sm:order-1"
            >
              {t('auth.signup.navigation.previous')}
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid()}
              className="btn btn-primary px-6 sm:px-8 py-2 sm:py-3 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('auth.signup.navigation.next')}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || uploading || !isStepValid()}
              className="btn btn-primary px-6 sm:px-8 py-2 sm:py-3 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? t('auth.signup.step1.uploading') : loading ? t('auth.signup.navigation.creatingAccount') : t('auth.signup.navigation.createAccount')}
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-text-secondary">
          {t('auth.signup.alreadyHaveAccount')}{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary-hover font-medium">
            {t('auth.signup.signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
} 
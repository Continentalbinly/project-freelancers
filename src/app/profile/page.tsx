'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Avatar, { getAvatarProps } from '@/app/utils/avatarHandler'
import { formatEarnings } from '@/service/currencyUtils'
import { timeAgo } from '@/service/timeUtils'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/service/firebase'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { ChevronLeftIcon, PencilIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import en from '@/lib/i18n/en'
import lo from '@/lib/i18n/lo'
import ProjectImage, { getProjectImageProps } from '@/app/utils/projectImageHandler'

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, currentLanguage } = useTranslationContext()

  // Get the current translations object
  const translations = currentLanguage === 'lo' ? lo : en

  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editField, setEditField] = useState('')
  const [editValue, setEditValue] = useState('')
  const [userProjects, setUserProjects] = useState<any[]>([])
  const [userProposals, setUserProposals] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Tab persistence - read tab from URL and set active tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'overview' || tab === 'portfolio' || tab === 'skills') {
      setActiveTab(tab)
    } else {
      // Default to overview if no tab parameter
      setActiveTab('overview')
      // Update URL to reflect the default tab
      const url = new URL(window.location.href)
      url.searchParams.set('tab', 'overview')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams, router])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    router.push(url.pathname + url.search, { scroll: false })
  }

  // Fetch user data
  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoadingData(true)

      if (!user) return

      // Fetch user's projects
      const projectsRef = collection(db, 'projects')
      const projectsQuery = query(projectsRef, orderBy('updatedAt', 'desc'), limit(10))
      const projectsSnap = await getDocs(projectsQuery)

      const userProjects = projectsSnap.docs.filter(doc => {
        const data = doc.data()
        return data.clientId === user.uid || data.acceptedFreelancerId === user.uid
      }).map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }))

      setUserProjects(userProjects)

      // Fetch user's proposals
      const proposalsRef = collection(db, 'proposals')
      const proposalsQuery = query(proposalsRef, orderBy('createdAt', 'desc'), limit(10))
      const proposalsSnap = await getDocs(proposalsQuery)

      const userProposals = proposalsSnap.docs.filter(doc => {
        const data = doc.data()
        return data.freelancerId === user.uid
      }).map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }))

      setUserProposals(userProposals)

    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const startEditing = (field: string, value: string) => {
    setEditField(field)
    setEditValue(value)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditField('')
    setEditValue('')
  }

  const saveProfile = async () => {
    if (!user || !profile) return

    try {
      setSaving(true)

      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        [editField]: editValue,
        updatedAt: new Date()
      })

      // Refresh profile data
      await refreshProfile()

      setIsEditing(false)
      setEditField('')
      setEditValue('')
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const addSkill = (skill: string) => {
    if (!user || !profile) return

    const currentSkills = profile.skills || []
    if (!currentSkills.includes(skill)) {
      const userRef = doc(db, 'users', user.uid)
      updateDoc(userRef, {
        skills: [...currentSkills, skill],
        updatedAt: new Date()
      }).then(() => refreshProfile())
    }
  }

  const removeSkill = (skillToRemove: string) => {
    if (!user || !profile) return

    const currentSkills = profile.skills || []
    const updatedSkills = currentSkills.filter(skill => skill !== skillToRemove)

    const userRef = doc(db, 'users', user.uid)
    updateDoc(userRef, {
      skills: updatedSkills,
      updatedAt: new Date()
    }).then(() => refreshProfile())
  }

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-success/10 text-success',
      in_progress: 'bg-warning/10 text-warning',
      completed: 'bg-primary/10 text-primary',
      cancelled: 'bg-error/10 text-error',
      pending: 'bg-secondary/10 text-secondary'
    }
    return colors[status as keyof typeof colors] || 'bg-background-secondary text-text-secondary'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      pending: 'Pending'
    }
    return labels[status as keyof typeof labels] || status
  }

  // Upload profile image function
  const uploadProfileImage = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folderType', 'profileImage')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        // Always use the Cloudinary URL from result.data.url
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

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert('File size too large. Maximum size is 5MB.')
        return
      }

      setSelectedFile(file)

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
  }

  // Handle file button click
  const handleFileButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle profile image upload
  const handleProfileImageUpload = async () => {
    if (!selectedFile || !user) return

    try {
      setUploading(true)
      // Get the previous avatar URL before uploading
      const userRef = doc(db, 'profiles', user.uid);
      let prevAvatarUrl = '';
      try {
        const userDoc = await getDoc(userRef);
        prevAvatarUrl = userDoc.exists() ? userDoc.data().avatarUrl : '';
      } catch (err) {
        prevAvatarUrl = '';
      }

      const uploadResult = await uploadProfileImage(selectedFile)

      if (uploadResult.success) {
        //console.log('Upload result:', uploadResult);
        //console.log('Attempting to update Firestore for user:', user.uid, 'with URL:', uploadResult.url);
        try {
          await updateDoc(userRef, {
            avatarUrl: uploadResult.url,
            updatedAt: new Date()
          });
          //console.log('Firestore avatarUrl updated:', uploadResult.url);
        } catch (err) {
          console.error('Error updating Firestore avatarUrl:', err);
          alert('Image uploaded, but failed to update profile. Please try again.');
          return;
        }
        // Delete the previous avatar if it exists and is different from the new one
        if (prevAvatarUrl && prevAvatarUrl !== uploadResult.url) {
          try {
            await fetch('/api/delete-avatar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: prevAvatarUrl })
            });
            //console.log('Previous avatar deleted:', prevAvatarUrl);
          } catch (err) {
            console.warn('Failed to delete previous avatar:', prevAvatarUrl, err);
          }
        }
        await refreshProfile();
        removeSelectedFile();
        alert(t('profile.profileImage.updateSuccess'));
      } else {
        alert(uploadResult.error || t('profile.profileImage.uploadFailed'));
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert(t('profile.profileImage.uploadFailed'));
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">{t('profile.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const tabs = [
    { id: 'overview', label: t('profile.overview'), icon: '📊' },
    { id: 'portfolio', label: t('profile.portfolio'), icon: '🎨' },
    { id: 'skills', label: t('profile.skills'), icon: '⚡' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-white shadow-sm border border-border hover:shadow-md transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5 text-text-primary" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('profile.title')}</h1>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="mb-4">
                <Avatar {...getAvatarProps(profile, user)} size="xl" />
              </div>

              {/* Profile Image Upload */}
              <div className="w-full max-w-48 space-y-3">
                {previewUrl ? (
                  <div className="space-y-2">
                    <div className="relative w-24 h-24 mx-auto">
                      <img
                        src={previewUrl}
                        alt="Profile Preview"
                        className="w-full h-full object-cover rounded-full border-2 border-primary"
                      />
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={handleProfileImageUpload}
                      disabled={uploading}
                      className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {uploading ? t('profile.profileImage.uploading') : t('profile.profileImage.updateProfileImage')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleFileButtonClick}
                      className="w-full px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <PhotoIcon className="w-4 h-4" />
                      {t('profile.profileImage.changePhoto')}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                    {profile?.fullName || user.email?.split('@')[0]}
                  </h2>
                  <p className="text-text-secondary mb-2">
                    {(() => {
                      const userType = profile?.userType;
                      if (Array.isArray(userType)) {
                        if (userType.length === 0) return t('profile.userTypes.member');
                        if (userType.length === 1) {
                          return userType[0] === 'freelancer' ? t('profile.userTypes.freelancer') : t('profile.userTypes.client');
                        }
                        return userType.map(type => type === 'freelancer' ? t('profile.userTypes.freelancer') : t('profile.userTypes.client')).join(' & ');
                      } else if (typeof userType === 'string') {
                        return userType === 'freelancer' ? t('profile.userTypes.freelancer') : t('profile.userTypes.client');
                      }
                      return t('profile.userTypes.member');
                    })()}
                  </p>
                  <p className="text-sm text-text-secondary">{profile?.email || user.email}</p>
                </div>

                <button
                  onClick={() => startEditing('fullName', profile?.fullName || '')}
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{profile?.activeProjects || 0}</div>
                  <div className="text-xs text-text-secondary">{t('profile.stats.active')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-success">{profile?.projectsCompleted || 0}</div>
                  <div className="text-xs text-text-secondary">{t('profile.stats.completed')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-secondary">{formatEarnings(profile?.totalEarned || 0)}</div>
                  <div className="text-xs text-text-secondary">{t('profile.stats.earned')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-warning">{profile?.rating || 0}/5</div>
                  <div className="text-xs text-text-secondary">{t('profile.stats.rating')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-border mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">{t('profile.personalInfo.title')}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                        <span className="text-sm text-text-secondary">{t('profile.personalInfo.fullName')}</span>
                        <span className="text-sm font-medium text-text-primary">
                          {profile?.fullName || t('profile.personalInfo.notSet')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                        <span className="text-sm text-text-secondary">{t('profile.personalInfo.email')}</span>
                        <span className="text-sm font-medium text-text-primary">{profile?.email || user.email}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                        <span className="text-sm text-text-secondary">{t('profile.personalInfo.location')}</span>
                        <span className="text-sm font-medium text-text-primary">
                          {profile?.city && profile?.country ? `${profile.city}, ${profile.country}` : t('profile.personalInfo.notSet')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                        <span className="text-sm text-text-secondary">{t('profile.personalInfo.hourlyRate')}</span>
                        <span className="text-sm font-medium text-text-primary">
                          {profile?.hourlyRate ? `${formatEarnings(Number(profile.hourlyRate))}/hr` : t('profile.personalInfo.notSet')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                        <span className="text-sm text-text-secondary">{t('profile.personalInfo.memberSince')}</span>
                        <span className="text-sm font-medium text-text-primary">
                          {(() => {
                            if (!profile?.createdAt) return 'N/A';

                            try {
                              // Handle different date formats
                              let date: Date;
                              const createdAt = profile.createdAt as any;

                              if (createdAt instanceof Date) {
                                date = createdAt;
                              } else if (typeof createdAt === 'string') {
                                date = new Date(createdAt);
                              } else if (createdAt?.toDate && typeof createdAt.toDate === 'function') {
                                // Firebase Timestamp
                                date = createdAt.toDate();
                              } else if (createdAt?.seconds && typeof createdAt.seconds === 'number') {
                                // Firebase Timestamp object
                                date = new Date(createdAt.seconds * 1000);
                              } else {
                                return 'N/A';
                              }

                              // Check if date is valid
                              if (isNaN(date.getTime())) {
                                return 'N/A';
                              }

                              return date.toLocaleDateString();
                            } catch (error) {
                              return 'N/A';
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">{t('profile.recentActivity.title')}</h3>

                    {loadingData ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-3 bg-background-secondary rounded-lg animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userProjects.slice(0, 3).map((project) => (
                          <div key={project.id} className="p-3 bg-background-secondary rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-text-primary">{project.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {getStatusLabel(project.status)}
                              </span>
                            </div>
                            <p className="text-xs text-text-secondary">{timeAgo(project.createdAt)}</p>
                          </div>
                        ))}

                        {userProjects.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-text-secondary">{t('profile.recentActivity.noProjects')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">{t('profile.portfolioSection.title')}</h3>
                  <button className="btn btn-primary text-sm">
                    {t('profile.portfolioSection.addProject')}
                  </button>
                </div>

                {loadingData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-background-secondary rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProjects.filter(p => p.status === 'completed').map((project) => (
                      <div key={project.id} className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {/* Project Image */}
                        <div className="relative h-48 overflow-hidden">
                          <ProjectImage
                            {...getProjectImageProps(project)}
                            size="full"
                            className="w-full h-full object-cover"
                          />
                          {/* Status badge overlay */}
                          <div className="absolute top-3 right-3">
                            <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full backdrop-blur-sm">
                              {t('profile.portfolioSection.completed')}
                            </span>
                          </div>
                        </div>

                        {/* Project Content */}
                        <div className="p-4">
                          <div className="mb-3">
                            <h4 className="font-semibold text-text-primary mb-2 line-clamp-2">{project.title}</h4>
                            <p className="text-sm text-text-secondary mb-3 line-clamp-2">{project.description}</p>
                          </div>

                          {/* Skills Required */}
                          {project.skillsRequired && project.skillsRequired.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {project.skillsRequired.slice(0, 2).map((skill: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {project.skillsRequired.length > 2 && (
                                  <span className="px-2 py-1 bg-background-secondary text-text-secondary text-xs rounded-full">
                                    +{project.skillsRequired.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Project Details */}
                          <div className="flex items-center justify-between text-xs text-text-secondary">
                            <span>{formatEarnings(project.budget)}</span>
                            <span>{timeAgo(project.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {userProjects.filter(p => p.status === 'completed').length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">{t('profile.portfolioSection.noProjects')}</h3>
                        <p className="text-text-secondary">{t('profile.portfolioSection.noProjectsDesc')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">{t('profile.skillsSection.title')}</h3>
                  <button
                    onClick={() => startEditing('skills', '')}
                    className="btn btn-primary text-sm"
                  >
                    {t('profile.skillsSection.addSkill')}
                  </button>
                </div>

                <div className="space-y-4">
                  {profile?.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-primary-light text-primary rounded-full">
                          <span className="text-sm font-medium">{skill}</span>
                          <button
                            onClick={() => removeSkill(skill)}
                            className="text-primary hover:text-primary-hover"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">{t('profile.skillsSection.noSkills')}</h3>
                      <p className="text-text-secondary">{t('profile.skillsSection.noSkillsDesc')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">{t('profile.editModal.title')} {editField}</h3>

              {editField === 'skills' ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={t('profile.skillsSection.enterSkillName')}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (editValue.trim()) {
                          addSkill(editValue.trim())
                          cancelEditing()
                        }
                      }}
                      className="btn btn-primary flex-1"
                    >
                      {t('profile.skillsSection.addSkillButton')}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="btn btn-outline flex-1"
                    >
                      {t('profile.editModal.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={`${t('profile.editModal.enterField')} ${editField}`}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="btn btn-primary flex-1"
                    >
                      {saving ? t('profile.editModal.saving') : t('profile.editModal.save')}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="btn btn-outline flex-1"
                    >
                      {t('profile.editModal.cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { doc as firestoreDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/service/firebase'
import { ChevronLeftIcon, PencilIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { deleteProjectImage } from '@/app/utils/projectImageHandler'
import { useTranslationContext } from '@/app/components/LanguageProvider'

interface Project {
  id: string
  title: string
  description: string
  budget: number
  budgetType: 'fixed' | 'hourly'
  deadline?: Date
  skillsRequired: string[]
  status: string
  category: string
  clientId: string
  timeline?: string
  attachments?: any[]
  imageUrl?: string
}

export default function EditProjectPage() {
  const { t } = useTranslationContext()
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loadingProject, setLoadingProject] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: 0,
    budgetType: 'fixed' as 'fixed' | 'hourly',
    deadline: '',
    skillsRequired: [] as string[],
    category: '',
    timeline: '',
    imageUrl: ''
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Fetch project data
  useEffect(() => {
    if (user && projectId) {
      fetchProject()
    }
  }, [user, projectId])

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
      return result
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
        setError(t('editProject.invalidFileTypeError'))
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError(t('editProject.fileSizeTooLargeError'))
        return
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
  }

  // Handle file button click
  const handleFileButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const fetchProject = async () => {
    try {
      setLoadingProject(true)

      if (!user || !projectId) return

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

      // Check if project can be edited (not completed or cancelled)
      //console.log('Project status:', projectData.status)
      if (projectData.status === 'completed' || projectData.status === 'cancelled') {
        //console.log('Project cannot be edited, redirecting to view page')
        router.push(`/projects/${projectId}`)
        return
      }

      setProject({
        ...projectData,
        id: projectId
      })

      // Set form data
      setFormData({
        title: projectData.title || '',
        description: projectData.description || '',
        budget: projectData.budget || 0,
        budgetType: projectData.budgetType || 'fixed',
        deadline: projectData.deadline ? new Date(projectData.deadline).toISOString().split('T')[0] : '',
        skillsRequired: projectData.skillsRequired || [],
        category: projectData.category || '',
        timeline: projectData.timeline || '',
        imageUrl: projectData.imageUrl || ''
      })

      // Set preview URL if project has an image
      if (projectData.imageUrl) {
        setPreviewUrl(projectData.imageUrl)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoadingProject(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !project || saving) return

    try {
      setSaving(true)
      setError('')

      // Upload project image if selected
      let imageUrl = formData.imageUrl
      let oldImageUrl = project.imageUrl
      if (selectedFile) {
        setUploading(true)
        const uploadResult = await uploadProjectImage(selectedFile)
        if (uploadResult.success) {
          imageUrl = uploadResult.url
          // Delete old image if exists and is different
          if (oldImageUrl && oldImageUrl !== imageUrl) {
            await deleteProjectImage(oldImageUrl)
          }
        } else {
          setError(uploadResult.error || t('editProject.failedToUploadProjectImageError'))
          setSaving(false)
          setUploading(false)
          return
        }
        setUploading(false)
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        budget: Number(formData.budget),
        budgetType: formData.budgetType,
        deadline: formData.deadline ? new Date(formData.deadline) : null,
        skillsRequired: formData.skillsRequired,
        category: formData.category,
        timeline: formData.timeline,
        imageUrl: imageUrl,
        updatedAt: new Date()
      }

      await updateDoc(firestoreDoc(db, 'projects', projectId), updateData)

      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error('Error updating project:', error)
      setError(t('editProject.failedToUpdateProjectError'))
    } finally {
      setSaving(false)
    }
  }

  const handleSkillsChange = (skills: string) => {
    const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
    setFormData(prev => ({ ...prev, skillsRequired: skillsArray }))
  }

  if (loading || loadingProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">{t('editProject.loadingProject')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">{t('editProject.projectNotFound')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-white shadow-sm border border-border hover:shadow-md transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5 text-text-primary" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('editProject.title')}</h1>
              <p className="text-text-secondary">
                {t('editProject.updateProjectDetails')}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-text-primary">{t('editProject.projectDetails')}</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
                {t('editProject.projectTitleRequired')}
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('editProject.enterProjectTitle')}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                {t('editProject.projectDescriptionRequired')}
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('editProject.describeProjectRequirements')}
              />
            </div>

            {/* Budget and Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-text-primary mb-2">
                  {t('editProject.budgetRequired')}
                </label>
                <input
                  type="number"
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('editProject.enterBudgetAmount')}
                />
              </div>
              <div>
                <label htmlFor="budgetType" className="block text-sm font-medium text-text-primary mb-2">
                  {t('editProject.budgetTypeRequired')}
                </label>
                <select
                  id="budgetType"
                  value={formData.budgetType}
                  onChange={(e) => setFormData(prev => ({ ...prev, budgetType: e.target.value as 'fixed' | 'hourly' }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="fixed">{t('editProject.fixedPrice')}</option>
                  <option value="hourly">{t('editProject.hourlyRate')}</option>
                </select>
              </div>
            </div>

            {/* Category and Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-primary mb-2">
                  {t('editProject.categoryRequired')}
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{t('editProject.selectCategory')}</option>
                  <option value="Web Development">{t('editProject.webDevelopment')}</option>
                  <option value="Mobile Development">{t('editProject.mobileDevelopment')}</option>
                  <option value="Design">{t('editProject.design')}</option>
                  <option value="Writing">{t('editProject.writing')}</option>
                  <option value="Marketing">{t('editProject.marketing')}</option>
                  <option value="Translation">{t('editProject.translation')}</option>
                  <option value="Data Entry">{t('editProject.dataEntry')}</option>
                  <option value="Other">{t('editProject.other')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-text-primary mb-2">
                  {t('editProject.deadline')}
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Skills Required */}
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-text-primary mb-2">
                {t('editProject.skillsRequired')}
              </label>
              <input
                type="text"
                id="skills"
                value={formData.skillsRequired.join(', ')}
                onChange={(e) => handleSkillsChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('editProject.eGReactNodeJsUiUxDesign')}
              />
              <p className="text-xs text-text-secondary mt-1">
                {t('editProject.separateSkillsWithCommas')}
              </p>
            </div>

            {/* Timeline */}
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-text-primary mb-2">
                {t('editProject.projectTimeline')}
              </label>
              <select
                id="timeline"
                value={formData.timeline}
                onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">{t('createProject.selectTimeline')}</option>
                <option value={t('createProject.lessThan1Week')}>{t('createProject.lessThan1Week')}</option>
                <option value={t('createProject.oneToTwoWeeks')}>{t('createProject.oneToTwoWeeks')}</option>
                <option value={t('createProject.twoToFourWeeks')}>{t('createProject.twoToFourWeeks')}</option>
                <option value={t('createProject.oneToTwoMonths')}>{t('createProject.oneToTwoMonths')}</option>
                <option value={t('createProject.twoToThreeMonths')}>{t('createProject.twoToThreeMonths')}</option>
                <option value={t('createProject.moreThan3Months')}>{t('createProject.moreThan3Months')}</option>
              </select>
            </div>

            {/* Project Image */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('editProject.projectImageOptional')}
              </label>

              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative w-full max-w-md">
                    <img
                      src={previewUrl}
                      alt={t('editProject.projectPreview')}
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
                    {selectedFile ? `${t('editProject.selected')}: ${selectedFile.name}` : `${t('editProject.currentProjectImage')}`}
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-8 text-center">
                  <PhotoIcon className="w-8 h-8 sm:w-12 sm:h-12 text-text-secondary mx-auto mb-2 sm:mb-4" />
                  <p className="text-sm sm:text-base text-text-secondary mb-2 sm:mb-4">{t('editProject.noImageSelected')}</p>
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
                    {t('editProject.chooseImage')}
                  </button>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline"
              >
                {t('editProject.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('editProject.saving')}
                  </>
                ) : (
                  <>
                    <PencilIcon className="w-4 h-4 mr-2" />
                    {t('editProject.updateProject')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*"
      />
    </div>
  )
} 
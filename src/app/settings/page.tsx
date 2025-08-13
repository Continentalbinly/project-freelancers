'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/service/firebase'
import { ChevronLeftIcon, LockClosedIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import en from '@/lib/i18n/en'
import lo from '@/lib/i18n/lo'
import { sendEmailVerification } from 'firebase/auth'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, verifyBeforeUpdateEmail } from 'firebase/auth'
import Modal from '@/app/components/Modal' // If you don't have a Modal, use a simple dialog or inline form

export default function SettingsPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, currentLanguage } = useTranslationContext()

  // Get the current translations object
  const translations = currentLanguage === 'lo' ? lo : en

  const [activeTab, setActiveTab] = useState('notifications')
  const [saving, setSaving] = useState(false)
  const [editField, setEditField] = useState('')
  const [editValue, setEditValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [clientTotalSpent, setClientTotalSpent] = useState(0)

  // State for modals
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showChangeEmail, setShowChangeEmail] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Tab persistence - read tab from URL and set active tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'notifications' || tab === 'privacy' || tab === 'account') {
      setActiveTab(tab)
    } else {
      // Default to notifications if no tab parameter
      setActiveTab('notifications')
      // Update URL to reflect the default tab
      const url = new URL(window.location.href)
      url.searchParams.set('tab', 'notifications')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams, router])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    router.push(url.pathname + url.search, { scroll: false })
  }

  useEffect(() => {
    const fetchClientTotalSpent = async () => {
      if (!user || !profile || !Array.isArray(profile.userType) || !profile.userType.includes('client')) return;
      const q = query(
        collection(db, 'projects'),
        where('clientId', '==', user.uid),
        where('status', '==', 'completed')
      );
      const querySnapshot = await getDocs(q);
      let total = 0;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (typeof data.budget === 'number') {
          total += data.budget;
        }
      });
      setClientTotalSpent(total);
    };
    fetchClientTotalSpent();
  }, [user, profile]);

  const startEditing = (field: string, value: any) => {
    setEditField(field)
    setEditValue(value?.toString() || '')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditField('')
    setEditValue('')
  }

  const saveSetting = async () => {
    if (!user || !profile) return

    try {
      setSaving(true)

      const profileRef = doc(db, 'profiles', user.uid)
      const updateData: any = {
        [editField]: editValue,
        updatedAt: new Date()
      }

      // Handle boolean values
      if (editValue === 'true' || editValue === 'false') {
        updateData[editField] = editValue === 'true'
      }

      await updateDoc(profileRef, updateData)
      await refreshProfile()

      setIsEditing(false)
      setEditField('')
      setEditValue('')
    } catch (error) {
      console.error('Error updating settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleBooleanSetting = async (field: string, currentValue: boolean) => {
    if (!user || !profile) return

    try {
      setSaving(true)
      const profileRef = doc(db, 'profiles', user.uid)
      await updateDoc(profileRef, {
        [field]: !currentValue,
        updatedAt: new Date()
      })
      await refreshProfile()
    } catch (error) {
      console.error('Error updating setting:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">{t('settings.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const tabs = [
    { id: 'notifications', label: t('settings.notifications'), icon: '🔔' },
    { id: 'privacy', label: t('settings.privacy'), icon: '🔒' },
    { id: 'account', label: t('settings.account'), icon: '⚙️' }
  ]

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
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('settings.title')}</h1>
          </div>
        </div>

        {/* Settings Container */}
        <div className="bg-white rounded-xl shadow-sm border border-border">
          {/* Tabs */}
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
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-6">{t('settings.notificationPreferences.title')}</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{t('settings.notificationPreferences.emailNotifications.title')}</h4>
                      <p className="text-sm text-text-secondary">{t('settings.notificationPreferences.emailNotifications.description')}</p>
                    </div>
                    <button
                      onClick={() => toggleBooleanSetting('emailNotifications', profile?.emailNotifications ?? true)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.emailNotifications ?? true ? 'bg-primary' : 'bg-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${profile?.emailNotifications ?? true ? 'right-1' : 'left-1'
                        }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{t('settings.notificationPreferences.projectUpdates.title')}</h4>
                      <p className="text-sm text-text-secondary">{t('settings.notificationPreferences.projectUpdates.description')}</p>
                    </div>
                    <button
                      onClick={() => toggleBooleanSetting('projectUpdates', profile?.projectUpdates ?? true)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.projectUpdates ?? true ? 'bg-primary' : 'bg-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${profile?.projectUpdates ?? true ? 'right-1' : 'left-1'
                        }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{t('settings.notificationPreferences.proposalNotifications.title')}</h4>
                      <p className="text-sm text-text-secondary">{t('settings.notificationPreferences.proposalNotifications.description')}</p>
                    </div>
                    <button
                      onClick={() => toggleBooleanSetting('proposalNotifications', profile?.proposalNotifications ?? true)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.proposalNotifications ?? true ? 'bg-primary' : 'bg-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${profile?.proposalNotifications ?? true ? 'right-1' : 'left-1'
                        }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{t('settings.notificationPreferences.browserNotifications.title')}</h4>
                      <p className="text-sm text-text-secondary">{t('settings.notificationPreferences.browserNotifications.description')}</p>
                    </div>
                    <button
                      onClick={() => toggleBooleanSetting('browserNotifications', profile?.browserNotifications ?? true)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.browserNotifications ?? true ? 'bg-primary' : 'bg-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${profile?.browserNotifications ?? true ? 'right-1' : 'left-1'
                        }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{t('settings.notificationPreferences.marketingEmails.title')}</h4>
                      <p className="text-sm text-text-secondary">{t('settings.notificationPreferences.marketingEmails.description')}</p>
                    </div>
                    <button
                      onClick={() => toggleBooleanSetting('marketingEmails', profile?.marketingEmails ?? false)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.marketingEmails ?? false ? 'bg-primary' : 'bg-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${profile?.marketingEmails ?? false ? 'right-1' : 'left-1'
                        }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{t('settings.notificationPreferences.weeklyDigest.title')}</h4>
                      <p className="text-sm text-text-secondary">{t('settings.notificationPreferences.weeklyDigest.description')}</p>
                    </div>
                    <button
                      onClick={() => toggleBooleanSetting('weeklyDigest', profile?.weeklyDigest ?? false)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.weeklyDigest ?? false ? 'bg-primary' : 'bg-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${profile?.weeklyDigest ?? false ? 'right-1' : 'left-1'
                        }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-6">{t('settings.privacySecurity.title')}</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{t('settings.privacySecurity.profileVisibility.title')}</h4>
                      <p className="text-sm text-text-secondary">{t('settings.privacySecurity.profileVisibility.description')}</p>
                    </div>
                    <button
                      onClick={() => toggleBooleanSetting('profileVisibility', profile?.profileVisibility ?? true)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.profileVisibility ?? true ? 'bg-primary' : 'bg-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${profile?.profileVisibility ?? true ? 'right-1' : 'left-1'
                        }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{t('settings.privacySecurity.searchableProfile.title')}</h4>
                      <p className="text-sm text-text-secondary">{t('settings.privacySecurity.searchableProfile.description')}</p>
                    </div>
                    <button
                      onClick={() => toggleBooleanSetting('searchableProfile', profile?.searchableProfile ?? true)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.searchableProfile ?? true ? 'bg-primary' : 'bg-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${profile?.searchableProfile ?? true ? 'right-1' : 'left-1'
                        }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{t('settings.privacySecurity.showEmail.title')}</h4>
                      <p className="text-sm text-text-secondary">{t('settings.privacySecurity.showEmail.description')}</p>
                    </div>
                    <button
                      onClick={() => toggleBooleanSetting('showEmail', profile?.showEmail ?? false)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.showEmail ?? false ? 'bg-primary' : 'bg-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${profile?.showEmail ?? false ? 'right-1' : 'left-1'
                        }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{t('settings.privacySecurity.showPhone.title')}</h4>
                      <p className="text-sm text-text-secondary">{t('settings.privacySecurity.showPhone.description')}</p>
                    </div>
                    <button
                      onClick={() => toggleBooleanSetting('showPhone', profile?.showPhone ?? false)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.showPhone ?? false ? 'bg-primary' : 'bg-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${profile?.showPhone ?? false ? 'right-1' : 'left-1'
                        }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{t('settings.privacySecurity.allowMessages.title')}</h4>
                      <p className="text-sm text-text-secondary">{t('settings.privacySecurity.allowMessages.description')}</p>
                    </div>
                    <button
                      onClick={() => toggleBooleanSetting('allowMessages', profile?.allowMessages ?? true)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.allowMessages ?? true ? 'bg-primary' : 'bg-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${profile?.allowMessages ?? true ? 'right-1' : 'left-1'
                        }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-6">{t('settings.accountSettings.title')}</h3>

                {/* Email Verification Section */}
                <div className="p-4 bg-background-secondary rounded-lg mb-4">
                  <h4 className="font-medium text-text-primary mb-2">Email</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-text-primary font-mono">{user?.email}</span>
                    {user?.emailVerified ? (
                      <span className="text-success text-xs font-semibold bg-success/10 px-2 py-1 rounded">Verified</span>
                    ) : (
                      <span className="text-error text-xs font-semibold bg-error/10 px-2 py-1 rounded">Not verified</span>
                    )}
                  </div>
                  {!user?.emailVerified && (
                    <EmailVerificationButton />
                  )}
                </div>

                {/* Security Section */}
                <div className="p-4 bg-background-secondary rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <LockClosedIcon className="w-5 h-5 text-primary" />
                    <h4 className="font-medium text-text-primary">{t('settings.accountSettings.accountSecurity.title')}</h4>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button className="btn btn-outline flex items-center gap-2 justify-start" onClick={() => setShowChangeEmail(true)}>
                      <EnvelopeIcon className="w-5 h-5 text-primary" />
                      <span>{t('settings.accountSettings.accountSecurity.changeEmail')}</span>
                    </button>
                    <button className="btn btn-outline flex items-center gap-2 justify-start" onClick={() => setShowChangePassword(true)}>
                      <KeyIcon className="w-5 h-5 text-primary" />
                      <span>{t('settings.accountSettings.accountSecurity.changePassword')}</span>
                    </button>
                  </div>
                  {showChangeEmail && (
                    <ChangeEmailModal onClose={() => setShowChangeEmail(false)} user={user} />
                  )}
                  {showChangePassword && (
                    <ChangePasswordModal onClose={() => setShowChangePassword(false)} user={user} />
                  )}
                </div>

                <div className="p-4 bg-background-secondary rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">{t('settings.accountSettings.accountStatus.title')}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${profile?.isActive ? 'bg-success' : 'bg-error'}`}></span>
                    <span className="text-sm text-text-secondary">
                      {profile?.isActive ? t('settings.accountSettings.accountStatus.active') : t('settings.accountSettings.accountStatus.inactive')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-background-secondary rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">{t('settings.accountSettings.accountStatistics.title')}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Show client stats if user is a client */}
                    {Array.isArray(profile?.userType) && profile.userType.includes('client') && (
                      <>
                        <div>
                          <span className="text-text-secondary">{t('settings.accountSettings.accountStatistics.projectsPosted')}</span>
                          <span className="ml-2 font-medium text-text-primary">{profile?.projectsPosted || 0}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">{t('settings.accountSettings.accountStatistics.totalSpent')}</span>
                          <span className="ml-2 font-medium text-text-primary">₭{clientTotalSpent.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">{t('settings.accountSettings.accountStatistics.freelancersHired')}</span>
                          <span className="ml-2 font-medium text-text-primary">{profile?.freelancersHired || 0}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">{t('settings.accountSettings.accountStatistics.completedProjects')}</span>
                          <span className="ml-2 font-medium text-text-primary">{profile?.completedProjects || 0}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">{t('settings.accountSettings.accountStatistics.openProjects')}</span>
                          <span className="ml-2 font-medium text-text-primary">{profile?.openProjects || 0}</span>
                        </div>
                      </>
                    )}
                    {/* Show freelancer stats if user is a freelancer */}
                    {Array.isArray(profile?.userType) && profile.userType.includes('freelancer') && (
                      <>
                        <div>
                          <span className="text-text-secondary">{t('settings.accountSettings.accountStatistics.projectsCompleted') || 'Projects Completed'}</span>
                          <span className="ml-2 font-medium text-text-primary">{profile?.projectsCompleted || 0}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">{t('settings.accountSettings.accountStatistics.totalEarned') || 'Total Earned'}</span>
                          <span className="ml-2 font-medium text-text-primary">₭{profile?.totalEarned?.toLocaleString() || 0}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">{t('settings.accountSettings.accountStatistics.activeProjects') || 'Active Projects'}</span>
                          <span className="ml-2 font-medium text-text-primary">{profile?.activeProjects || 0}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">{t('settings.accountSettings.accountStatistics.favoriteCount') || 'Favorites'}</span>
                          <span className="ml-2 font-medium text-text-primary">{profile?.favoriteCount || 0}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-background-secondary rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">
                    {(() => {
                      const userType = profile?.userType;
                      const isClient = Array.isArray(userType) ? userType.includes('client') : userType === 'client';
                      return isClient ? t('settings.accountSettings.ratingBreakdown.clientTitle') : t('settings.accountSettings.ratingBreakdown.freelancerTitle');
                    })()}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('settings.accountSettings.ratingBreakdown.communication')}</span>
                      <span className="font-medium text-text-primary">{profile?.communicationRating || 0}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('settings.accountSettings.ratingBreakdown.quality')}</span>
                      <span className="font-medium text-text-primary">{profile?.qualityRating || 0}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('settings.accountSettings.ratingBreakdown.value')}</span>
                      <span className="font-medium text-text-primary">{profile?.valueRating || 0}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('settings.accountSettings.ratingBreakdown.timeliness')}</span>
                      <span className="font-medium text-text-primary">{profile?.timelinessRating || 0}/5</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <h4 className="font-medium text-error mb-2">{t('settings.accountSettings.dangerZone.title')}</h4>
                  <p className="text-sm text-error mb-4">{t('settings.accountSettings.dangerZone.description')}</p>
                  <button className="btn btn-error text-sm">
                    {t('settings.accountSettings.dangerZone.deleteAccount')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">{t('settings.editModal.title')} {editField}</h3>

              <div className="space-y-4">
                {editField === 'bio' ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={t('settings.editModal.enterBio')}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <input
                    type={editField === 'hourlyRate' ? 'number' : 'text'}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={`${t('settings.editModal.enterField')} ${editField}`}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                )}

                <div className="flex gap-2">
                  <button
                    onClick={saveSetting}
                    disabled={saving}
                    className="btn btn-primary flex-1"
                  >
                    {saving ? t('settings.editModal.saving') : t('settings.editModal.save')}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="btn btn-outline flex-1"
                  >
                    {t('settings.editModal.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EmailVerificationButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleSendVerification = async () => {
    if (!user) return
    setLoading(true)
    setMessage('')
    setError('')
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: false
      })
      setMessage('Verification email sent! Please check your inbox (and spam folder).')
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-3 py-2 rounded-md text-xs mb-2">{error}</div>
      )}
      {message && (
        <div className="bg-success/10 border border-success/20 text-success px-3 py-2 rounded-md text-xs mb-2">{message}</div>
      )}
      <button
        onClick={handleSendVerification}
        disabled={loading}
        className="btn btn-outline text-xs py-1 px-3"
      >
        {loading ? 'Sending...' : 'Send verification email'}
      </button>
    </div>
  )
}

function ChangePasswordModal({ onClose, user }: { onClose: () => void; user: any }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { t } = useTranslationContext()
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [submitted, onClose])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
      setSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSubmitted(true)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as any).message || 'Failed to update password.')
      } else {
        setError('Failed to update password.')
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <Modal onClose={onClose} title={t('modal.changePassword.title')} icon={<KeyIcon className="w-6 h-6" />}>
      {submitted ? (
        <div className="bg-success/10 border border-success/20 text-success px-3 py-2 rounded-md text-sm mb-2 text-center">
          {success}
          <div className="mt-2 text-xs text-text-secondary">{t('modal.changePassword.thisWindowWillCloseAutomatically')}</div>
        </div>
      ) : (
        <form onSubmit={handleChangePassword} className="space-y-4">
          {error && <div className="bg-error/10 border border-error/20 text-error px-3 py-2 rounded-md text-xs mb-2">{error}</div>}
          {success && <div className="bg-success/10 border border-success/20 text-success px-3 py-2 rounded-md text-xs mb-2">{success}</div>}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">{t('modal.changePassword.currentPassword')}</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">{t('modal.changePassword.newPassword')}</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">{t('modal.changePassword.confirmNewPassword')}</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{t('modal.changePassword.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? t('modal.changePassword.updating') : t('modal.changePassword.updatePassword')}</button>
          </div>
        </form>
      )}
    </Modal>
  )
}

function ChangeEmailModal({ onClose, user }: { onClose: () => void; user: any }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { t } = useTranslationContext()

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [submitted, onClose])

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await verifyBeforeUpdateEmail(user, newEmail)
      setSuccess('A confirmation link has been sent to your new email address. Please check your inbox and click the link to complete the change.')
      setCurrentPassword('')
      setNewEmail('')
      setSubmitted(true)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as any).message || 'Failed to send confirmation email.')
      } else {
        setError('Failed to send confirmation email.')
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <Modal onClose={onClose} title={t('modal.changeEmail.title')} icon={<EnvelopeIcon className="w-6 h-6" />}>
      {submitted ? (
        <div className="bg-success/10 border border-success/20 text-success px-3 py-2 rounded-md text-sm mb-2 text-center">
          {success}
          <div className="mt-2 text-xs text-text-secondary">{t('modal.changeEmail.thisWindowWillCloseAutomatically')}</div>
        </div>
      ) : (
        <form onSubmit={handleChangeEmail} className="space-y-4">
          {error && <div className="bg-error/10 border border-error/20 text-error px-3 py-2 rounded-md text-xs mb-2">{error}</div>}
          {success && <div className="bg-success/10 border border-success/20 text-success px-3 py-2 rounded-md text-xs mb-2">{success}</div>}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">{t('modal.changeEmail.currentPassword')}</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">{t('modal.changeEmail.newEmail')}</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{t('modal.changeEmail.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? t('modal.changeEmail.sending') : t('modal.changeEmail.sendConfirmationLink')}</button>
          </div>
        </form>
      )}
    </Modal>
  )
} 
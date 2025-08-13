'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { logoutUser } from '@/service/auth-client'
import { auth } from '@/service/firebase'
import Avatar, { getAvatarProps } from '@/app/utils/avatarHandler'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { usePathname } from 'next/navigation'
import { useTranslationContext } from './LanguageProvider'

export default function Header() {
  const { t } = useTranslationContext()
  const { user, profile } = useAuth()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showHeaderSearch, setShowHeaderSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname();

  // Debug log for auth state
  useEffect(() => {
    console.log('Header - Current auth state:', {
      user: user ? 'Logged in' : 'Not logged in',
      profile: profile ? 'Profile loaded' : 'No profile',
      userEmail: user?.email
    })
  }, [user, profile])

  // Combined header search and route change functionality
  useEffect(() => {
    let isInitialCheck = true
    let currentPath = window.location.pathname

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const searchSection = document.getElementById('search-section')
      const isProjectsPage = window.location.pathname === '/projects'
      const isProjectDetailPage = window.location.pathname.startsWith('/projects/') && window.location.pathname !== '/projects'

      if (searchSection) {
        const searchSectionTop = searchSection.offsetTop
        const searchSectionHeight = searchSection.offsetHeight

        // Show header search when scrolling down past the search section
        if (currentScrollY > searchSectionTop + searchSectionHeight) {
          setShowHeaderSearch(true)
        } else {
          setShowHeaderSearch(false)
        }
      } else if (isProjectsPage) {
        // On projects page without search section, show header search on scroll
        if (currentScrollY > 100) {
          setShowHeaderSearch(true)
        } else {
          setShowHeaderSearch(false)
        }
      } else if (isProjectDetailPage) {
        // Always hide header search on project detail pages
        setShowHeaderSearch(false)
      } else {
        // Hide header search on other pages
        setShowHeaderSearch(false)
      }
    }

    const handleRouteChange = () => {
      const newPath = window.location.pathname
      const isProjectDetailPage = newPath.startsWith('/projects/') && newPath !== '/projects'

      // Always hide header search on project detail pages
      if (isProjectDetailPage) {
        setShowHeaderSearch(false)
      }

      currentPath = newPath
    }

    // Add scroll event listener with throttling
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll)
    window.addEventListener('popstate', handleRouteChange)

    // Check for route changes periodically
    const routeCheckInterval = setInterval(() => {
      const newPath = window.location.pathname
      if (newPath !== currentPath) {
        handleRouteChange()
      }
    }, 100)

    // Initial check with requestAnimationFrame to avoid render-time updates
    if (isInitialCheck) {
      requestAnimationFrame(() => {
        handleScroll()
        handleRouteChange()
        isInitialCheck = false
      })
    }

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      window.removeEventListener('popstate', handleRouteChange)
      clearInterval(routeCheckInterval)
    }
  }, []) // Empty dependency array to run only once

  // Handle click outside for drawer and profile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close drawer if clicking outside
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsDrawerOpen(false)
      }

      // Close drawer if clicking outside profile menu
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsDrawerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      console.log('User attempting to logout...')
      const result = await logoutUser()

      if (result.success) {
        console.log('Logout successful, redirecting...')
        setIsDrawerOpen(false)

        // Clear sessionStorage but keep viewedProjects for view counting
        const viewedProjects = sessionStorage.getItem('viewedProjects')
        sessionStorage.clear()
        if (viewedProjects) {
          sessionStorage.setItem('viewedProjects', viewedProjects)
        }

        // Force a page reload to ensure clean state
        window.location.href = '/'
      } else {
        console.error('Logout failed:', result.error)
        // Still close the drawer even if logout failed
        setIsDrawerOpen(false)

        // Try to force logout by clearing auth state
        if (auth) {
          try {
            await auth.signOut()
            window.location.href = '/'
          } catch (signOutError) {
            console.error('Force signOut failed:', signOutError)
          }
        }
      }
    } catch (error) {
      console.error('Logout failed:', error)
      setIsDrawerOpen(false)

      // Try to force logout
      if (auth) {
        try {
          await auth.signOut()
          window.location.href = '/'
        } catch (signOutError) {
          console.error('Force signOut failed:', signOutError)
        }
      }
    }
  }

  const categories = [
    { value: 'all', label: t('header.allCategories') },
    { value: 'Web Development', label: t('header.webDevelopment') },
    { value: 'Mobile Development', label: t('header.mobileDevelopment') },
    { value: 'Design', label: t('header.design') },
    { value: 'Writing', label: t('header.writing') },
    { value: 'Research', label: t('header.research') },
    { value: 'Data Analysis', label: t('header.dataAnalysis') },
    { value: 'Marketing', label: t('header.marketing') },
    { value: 'Translation', label: t('header.translation') },
    { value: 'Other', label: t('header.other') }
  ]

  const budgetRanges = [
    { value: 'all', label: t('header.allTypes') },
    { value: 'fixed', label: t('header.fixedPrice') },
    { value: 'hourly', label: t('header.hourlyRate') }
  ]

  const statusOptions = [
    { value: 'all', label: t('header.allStatus') },
    { value: 'open', label: t('header.open') },
    { value: 'in_progress', label: t('header.inProgress') },
    { value: 'completed', label: t('header.completed') },
    { value: 'cancelled', label: t('header.cancelled') }
  ]

  return (
    <>
      {/* Header Search Bar - Appears when scrolling */}
      <div className={`fixed top-16 left-0 right-0 z-40 bg-white border-b border-border shadow-lg transition-all duration-300 ${showHeaderSearch ? 'translate-y-0' : '-translate-y-full'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-text-primary whitespace-nowrap">
                  {t('header.searchProjects')}
                </h2>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm ${showFilters
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text-primary border-border hover:border-primary'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  <span className="font-medium">{t('header.filters')}</span>
                  <span className={`w-2 h-2 rounded-full transition-colors ${showFilters ? 'bg-white' : 'bg-primary'
                    }`}></span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('header.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              <Link
                href={`/projects?search=${searchQuery}&category=${selectedCategory}&budget=${selectedBudget}&status=${selectedStatus}`}
                className="btn btn-primary px-4 py-2 text-sm whitespace-nowrap"
              >
                {t('header.search')}
              </Link>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-border pt-3 mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">{t('category')}</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Filter */}
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">{t('budgetRange')}</label>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs"
                  >
                    {budgetRanges.map((budget) => (
                      <option key={budget.value} value={budget.value}>
                        {budget.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">{t('status')}</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('all')
                      setSelectedBudget('all')
                      setSelectedStatus('all')
                      setSearchQuery('')
                    }}
                    className="w-full px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    {t('clearFilters')}
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              {(selectedCategory !== 'all' || selectedBudget !== 'all' || selectedStatus !== 'all' || searchQuery) && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-light text-primary text-xs rounded-full">
                        {t('search')}: "{searchQuery}"
                        <button
                          onClick={() => setSearchQuery('')}
                          className="ml-1 hover:text-primary-hover"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-light text-secondary text-xs rounded-full">
                        {categories.find(c => c.value === selectedCategory)?.label}
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className="ml-1 hover:text-secondary-hover"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedBudget !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-light text-success text-xs rounded-full">
                        {budgetRanges.find(b => b.value === selectedBudget)?.label}
                        <button
                          onClick={() => setSelectedBudget('all')}
                          className="ml-1 hover:text-success-hover"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedStatus !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning-light text-warning text-xs rounded-full">
                        {statusOptions.find(s => s.value === selectedStatus)?.label}
                        <button
                          onClick={() => setSelectedStatus('all')}
                          className="ml-1 hover:text-warning-hover"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <span className="text-xl font-bold text-primary">StudentFreelance</span>
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-8">
              {user ? (
                // Authenticated user navigation
                <>
                  <Link
                    href="/"
                    className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-primary border-b-2 border-primary' : 'text-text-primary hover:text-primary'
                      }`}
                  >
                    {t('header.home')}
                  </Link>
                  <Link
                    href="/projects"
                    className={`text-sm font-medium transition-colors ${pathname === '/projects' ? 'text-primary border-b-2 border-primary' : 'text-text-primary hover:text-primary'
                      }`}
                  >
                    {t('header.projects')}
                  </Link>
                  <Link
                    href="/proposals"
                    className={`text-sm font-medium transition-colors ${pathname === '/proposals' ? 'text-primary border-b-2 border-primary' : 'text-text-primary hover:text-primary'
                      }`}
                  >
                    {t('header.proposals')}
                  </Link>
                  <Link
                    href="/about"
                    className={`text-sm font-medium transition-colors ${pathname === '/about' ? 'text-primary border-b-2 border-primary' : 'text-text-primary hover:text-primary'
                      }`}
                  >
                    {t('header.about')}
                  </Link>
                </>
              ) : (
                // Non-authenticated user navigation
                <>
                  <Link
                    href="/"
                    className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-primary border-b-2 border-primary' : 'text-text-primary hover:text-primary'
                      }`}
                  >
                    {t('header.home')}
                  </Link>
                  <Link
                    href="/projects"
                    className={`text-sm font-medium transition-colors ${pathname === '/projects' ? 'text-primary border-b-2 border-primary' : 'text-text-primary hover:text-primary'
                      }`}
                  >
                    {t('header.projects')}
                  </Link>
                  <Link
                    href="/freelancers"
                    className={`text-sm font-medium transition-colors ${pathname === '/freelancers' ? 'text-primary border-b-2 border-primary' : 'text-text-primary hover:text-primary'
                      }`}
                  >
                    {t('header.freelancers')}
                  </Link>
                  <Link
                    href="/clients"
                    className={`text-sm font-medium transition-colors ${pathname === '/clients' ? 'text-primary border-b-2 border-primary' : 'text-text-primary hover:text-primary'
                      }`}
                  >
                    {t('header.clients')}
                  </Link>
                  <Link
                    href="/about"
                    className={`text-sm font-medium transition-colors ${pathname === '/about' ? 'text-primary border-b-2 border-primary' : 'text-text-primary hover:text-primary'
                      }`}
                  >
                    {t('header.about')}
                  </Link>
                </>
              )}
            </nav>

            {/* Right side - User menu or hamburger */}
            <div className="flex items-center space-x-4">
              {/* Desktop user menu - Hidden on mobile */}
              {user && (
                <div className="hidden md:flex items-center space-x-4">
                  <div className="relative ref={profileMenuRef}">
                    <button
                      onClick={() => setIsDrawerOpen(true)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-background-secondary transition-colors"
                      aria-label="Open user menu"
                    >
                      <Avatar {...getAvatarProps(profile, user)} size="md" />
                      <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile menu button - Always visible on mobile, hidden on desktop for authenticated users */}
              <div className="md:hidden">
                {user ? (
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2 rounded-lg hover:bg-background-secondary transition-colors flex items-center"
                    aria-label="Open menu"
                  >
                    <Avatar {...getAvatarProps(profile, user)} size="md" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                    aria-label="Open menu"
                  >
                    <svg className="w-7 h-7 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Desktop sign in/up buttons - Hidden on mobile */}
              {!user && (
                <div className="hidden md:flex items-center space-x-3">
                  <Link href="/auth/login" className="text-sm font-medium text-text-primary hover:text-primary transition-colors">
                    {t('header.signIn')}
                  </Link>
                  <Link href="/auth/signup" className="btn btn-primary text-sm">
                    {t('header.signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer (side panel) */}
        <Transition.Root show={isDrawerOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={setIsDrawerOpen}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
              leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-transparent backdrop-blur-md transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="fixed inset-y-0 right-0 flex">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-300"
                    enterFrom="translate-x-full" enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-200"
                    leaveFrom="translate-x-0" leaveTo="translate-x-full"
                  >
                    <Dialog.Panel className="w-screen max-w-xs bg-white shadow-xl border-l border-border flex flex-col h-full">
                      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">SF</span>
                          </div>
                          <span className="text-xl font-bold text-primary">StudentFreelance</span>
                        </div>
                        <button
                          onClick={() => setIsDrawerOpen(false)}
                          className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                          aria-label="Close menu"
                        >
                          <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                        {user ? (
                          <>
                            <div className="flex items-center space-x-3 mb-6">
                              <Avatar {...getAvatarProps(profile, user)} size="md" />
                              <div>
                                <div className="font-semibold text-text-primary">{profile?.fullName || user.email}</div>
                                <div className="text-xs text-text-secondary">{profile?.userType?.map((type: string) => type === 'freelancer' ? t('header.freelancer') : t('header.client')).join(' & ') || t('header.member')}</div>
                              </div>
                            </div>

                            {/* Desktop: Simplified menu */}
                            <div className="hidden md:block">
                              <Link href="/dashboard" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                                {t('header.dashboard')}
                              </Link>
                              <Link href="/profile" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                                {t('header.profile')}
                              </Link>
                              <Link href="/settings" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                                {t('header.settings')}
                              </Link>
                              <hr className="my-2 border-border" />
                              <button
                                onClick={handleLogout}
                                className="block w-full text-left px-2 py-2 rounded hover:bg-background-secondary text-error font-medium"
                              >
                                {t('header.signOut')}
                              </button>
                            </div>

                            {/* Mobile: Full navigation menu */}
                            <div className="md:hidden">
                              <Link href="/" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                                {t('header.home')}
                              </Link>
                              <Link href="/projects" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                                {t('header.projects')}
                              </Link>
                              <Link href="/proposals" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                                {t('header.proposals')}
                              </Link>
                              <Link href="/about" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                                {t('header.about')}
                              </Link>
                              <hr className="my-2 border-border" />
                              <Link href="/dashboard" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                                {t('header.dashboard')}
                              </Link>
                              <Link href="/profile" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                                {t('header.profile')}
                              </Link>
                              <Link href="/settings" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                                {t('header.settings')}
                              </Link>
                              <Link href="/projects" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                                {t('header.projects')}
                              </Link>
                              <hr className="my-2 border-border" />
                              <button
                                onClick={handleLogout}
                                className="block w-full text-left px-2 py-2 rounded hover:bg-background-secondary text-error font-medium"
                              >
                                {t('header.signOut')}
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <Link href="/" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                              {t('header.home')}
                            </Link>
                            <Link href="/projects" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                              {t('header.projects')}
                            </Link>
                            <Link href="/freelancers" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                              {t('header.freelancers')}
                            </Link>
                            <Link href="/clients" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                              {t('header.clients')}
                            </Link>
                            <Link href="/about" className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                              {t('header.about')}
                            </Link>
                            <hr className="my-2 border-border" />
                            <Link href="/auth/login" className="block px-2 py-2 rounded hover:bg-background-secondary text-primary font-medium" onClick={() => setIsDrawerOpen(false)}>
                              {t('header.signIn')}
                            </Link>
                            <Link href="/auth/signup" className="block px-2 py-2 rounded hover:bg-primary text-white font-medium bg-primary mt-2 text-center" onClick={() => setIsDrawerOpen(false)}>
                              {t('header.signUp')}
                            </Link>
                          </>
                        )}
                      </nav>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </header>
    </>
  )
}

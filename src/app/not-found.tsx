'use client'

import { useRouter } from 'next/navigation'

export default function NotFound(): React.ReactElement {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6 sm:space-y-8">
        {/* 404 Icon */}
        <div>
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary-light/80 rounded-full flex items-center justify-center mx-auto shadow-md">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.263M15 6.3a8.959 8.959 0 00-3.24 2.982M12 6.3a8.959 8.959 0 00-3.24 2.982M12 6.3a8.959 8.959 0 00-3.24 2.982M12 6.3a8.959 8.959 0 00-3.24 2.982" />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-4xl sm:text-6xl font-bold text-primary">404</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">Page Not Found</h2>
          <p className="text-text-secondary text-sm sm:text-base">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Helpful Links */}
        <div className="space-y-4 sm:space-y-5">
          <div className="bg-background-secondary rounded-xl shadow-md border border-border/80 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4">Where would you like to go?</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors shadow-sm text-sm sm:text-base cursor-pointer"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </button>
              
              <button 
                onClick={() => router.push('/projects')}
                className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-secondary text-white rounded-md hover:bg-secondary-hover transition-colors shadow-sm text-sm sm:text-base cursor-pointer"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Projects
              </button>
              
              <button 
                onClick={() => router.push('/auth/login')}
                className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-md hover:bg-background-tertiary hover:border-border-hover transition-colors text-sm sm:text-base hover-surface cursor-pointer"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </button>
              
              <button 
                onClick={() => router.push('/auth/signup')}
                className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-md hover:bg-background-tertiary hover:border-border-hover transition-colors text-sm sm:text-base hover-surface cursor-pointer"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="bg-background-secondary rounded-xl p-4 sm:p-6 border border-border/80 shadow-sm">
          <div className="flex flex-col gap-3 sm:gap-4 items-center text-center">
            <div className="px-3 py-1 rounded-full bg-primary-light/70 text-primary text-xs font-semibold">
              Need Help?
            </div>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md">
              If you believe this is an error, please contact our support team or jump to the help center.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <button 
                onClick={() => router.push('/contact')}
                className="px-3 py-2 text-xs sm:text-sm text-primary hover:text-primary-hover font-medium rounded-md hover-surface cursor-pointer"
              >
                Contact Support
              </button>
              <button 
                onClick={() => router.push('/help')}
                className="px-3 py-2 text-xs sm:text-sm text-primary hover:text-primary-hover font-medium rounded-md hover-surface cursor-pointer"
              >
                Help Center
              </button>
              <button suppressHydrationWarning 
                onClick={() => window.history.back()}
                className="px-3 py-2 text-xs sm:text-sm text-primary hover:text-primary-hover font-medium rounded-md hover-surface"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm text-text-muted">
            Try using the search bar to find what you&apos;re looking for
          </p>
        </div>
      </div>
    </div>
  )
} 
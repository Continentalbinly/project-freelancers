'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { auth } from '@/service/firebase'
import { sendEmailVerification, onAuthStateChanged } from 'firebase/auth'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email || '')
      }
    })

    return () => unsubscribe()
  }, [])

  const handleResendVerification = async () => {
    if (!auth.currentUser) {
      setError('No user found. Please sign in again.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: false
      })
      setMessage('Verification email sent successfully!')
    } catch (error: any) {
      setError(error.message || 'Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 shadow-lg rounded-lg border border-border w-full max-w-md mx-auto">
      <div className="text-center mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 flex-shrink-0">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">Check your email</h2>
        <p className="text-text-secondary mt-2 text-sm sm:text-base">
          We've sent a verification link to
        </p>
        <p className="text-primary font-medium text-sm sm:text-base truncate">{email}</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm">
            {message}
          </div>
        )}

        <div className="bg-primary-light p-3 sm:p-4 rounded-md">
          <h3 className="font-medium text-primary mb-2 text-sm sm:text-base">What's next?</h3>
          <ul className="text-xs sm:text-sm text-text-secondary space-y-1">
            <li>• Check your email inbox (and spam folder)</li>
            <li>• Click the verification link in the email</li>
            <li>• Return here to sign in to your account</li>
          </ul>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={handleResendVerification}
            disabled={loading}
            className="w-full btn btn-outline py-2 sm:py-3 text-sm sm:text-base"
          >
            {loading ? 'Sending...' : 'Resend verification email'}
          </button>

          <div className="text-center">
            <p className="text-text-secondary text-sm sm:text-base">
              Already verified?{' '}
              <Link href="/auth/login" className="text-primary hover:text-primary-hover font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
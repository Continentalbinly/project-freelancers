'use client'

import { useState } from 'react'
import Link from 'next/link'
import { auth } from '@/service/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')
    if (!auth) {
      setError('Password reset is currently unavailable. Please contact support or try again later.')
      setLoading(false)
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess('If an account with that email exists, a password reset link has been sent.')
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || 'Failed to send reset email. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 shadow-lg rounded-lg border border-border w-full max-w-md mx-auto">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">Forgot Password</h2>
        <p className="text-text-secondary mt-2 text-sm sm:text-base">
          Enter your email address and we'll send you a password reset link.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {success && (
          <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm sm:text-base">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm sm:text-base">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 sm:px-3 py-2 sm:py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-2 sm:py-3 text-sm sm:text-base font-medium"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-text-secondary text-sm sm:text-base">
          Remembered your password?{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary-hover font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
} 
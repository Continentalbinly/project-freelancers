'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/service/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

export default function ForgotPasswordPage() {
  const router = useRouter()
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
      setError(err.message || 'Failed to send reset email. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 shadow-lg rounded-2xl border border-border bg-background w-full max-w-md mx-auto">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold  ">Forgot Password</h2>
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
          <label htmlFor="email" className="block text-sm font-medium   mb-2">
            Email Address
          </label>
          <input suppressHydrationWarning
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 sm:px-3 py-2 sm:py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>
        <button suppressHydrationWarning
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
          <button onClick={() => router.push("/auth/login")} className="text-primary hover:text-primary-hover font-medium cursor-pointer">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
} 
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/service/firebase'

export default function UpdateProposalsCountPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleUpdate = async () => {
    try {
      setLoading(true)
      setError('')
      setResult(null)

      const token = await user?.getIdToken()
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await fetch('/api/admin/update-proposals-count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to update proposals count')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <h1 className="text-2xl font-bold text-text-primary mb-6">
            Update Proposals Count
          </h1>
          
          <p className="text-text-secondary mb-6">
            This will update the proposalsCount field for all projects by counting the actual proposals in the database.
          </p>

          <button suppressHydrationWarning
            onClick={handleUpdate}
            disabled={loading}
            className="btn btn-primary w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Proposals Count'}
          </button>

          {error && (
            <div className="mt-6 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg">
              <h3 className="font-semibold mb-2">Update Complete!</h3>
              <p>{result.message}</p>
              <p className="mt-2">Updated {result.updatedCount} projects</p>
              
              {result.results && result.results.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Updated Projects:</h4>
                  <div className="space-y-1 text-sm">
                    {result.results.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>Project {item.projectId}:</span>
                        <span>{item.oldCount} → {item.newCount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
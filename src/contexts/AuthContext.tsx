'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/service/firebase'
import { Profile } from '@/types/profile'
import { clearAllCache, abortAllPendingRequests } from '@/service/dataFetch'

interface AuthContextType {
  user: FirebaseUser | null
  profile: Profile | null
  loading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchAbortController = useRef<AbortController | null>(null)
  const fetchTimeoutId = useRef<NodeJS.Timeout | null>(null)
  const lastFetchTime = useRef<number>(0)

  const fetchProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      // Prevent duplicate fetches within 500ms
      const now = Date.now()
      if (now - lastFetchTime.current < 500) {
        return
      }
      lastFetchTime.current = now

      // Cancel previous request if still pending
      if (fetchAbortController.current) {
        fetchAbortController.current.abort()
      }

      fetchAbortController.current = new AbortController()

      const token = await firebaseUser.getIdToken()
      if (!token) return

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'get-profile',
          userId: firebaseUser.uid
        }),
        signal: fetchAbortController.current.signal
      })

      const data = await response.json()
      if (data.success) {
        // ✅ Only store in memory - NO localStorage for security
        setProfile(data.data)
      } else {
        //console.error('Failed to fetch profile:', data.error)
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err?.name !== 'AbortError') {
        //console.error('Error fetching profile:', err)
      }
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // ✅ Fetch profile directly - NO localStorage caching for security
        await fetchProfile(firebaseUser)
      } else {
        // Clear all caches on logout
        clearAllCache()
        abortAllPendingRequests()
        
        // Clear any profile data from localStorage (security cleanup)
        try {
          const keys = Object.keys(localStorage)
          keys.forEach(key => {
            if (key.startsWith('profile_')) {
              localStorage.removeItem(key)
            }
          })
        } catch (e) {
          // Ignore localStorage errors
        }
        
        setProfile(null)
        if (fetchTimeoutId.current) {
          clearTimeout(fetchTimeoutId.current)
        }
        if (fetchAbortController.current) {
          fetchAbortController.current.abort()
        }
      }
      
      setLoading(false)
    })

    return () => {
      unsubscribe()
      if (fetchAbortController.current) {
        fetchAbortController.current.abort()
      }
      if (fetchTimeoutId.current) {
        clearTimeout(fetchTimeoutId.current)
      }
    }
  }, [fetchProfile])

  const value = {
    user,
    profile,
    loading,
    error,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 

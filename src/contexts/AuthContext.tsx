'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc, getDocFromCache, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/service/firebase'
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
    if (!db) return
    
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

      const profileRef = doc(db, 'profiles', firebaseUser.uid)
      
      // ✅ Cache-first strategy: Try cache first, then server
      let profileSnap
      try {
        // Try to get from cache first (instant)
        profileSnap = await getDocFromCache(profileRef)
      } catch (cacheError) {
        // Cache miss, fetch from server
        profileSnap = await getDoc(profileRef)
      }

      if (profileSnap.exists()) {
        const profileData = profileSnap.data() as Profile
        setProfile({ ...profileData, id: profileSnap.id } as Profile)
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err?.name !== 'AbortError') {
        // Fallback to API route if Firestore fails
        try {
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
            signal: fetchAbortController.current?.signal
          })

          const data = await response.json()
          if (data.success) {
            setProfile(data.data)
          }
        } catch (apiErr) {
          // Silent fail
        }
      }
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null

    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // ✅ Fetch profile with cache-first strategy
        await fetchProfile(firebaseUser)
        
        // ✅ Set up real-time listener for profile updates (keeps data fresh)
        if (db) {
          const profileRef = doc(db, 'profiles', firebaseUser.uid)
          profileUnsubscribe = onSnapshot(
            profileRef,
            (snapshot) => {
              if (snapshot.exists()) {
                const profileData = snapshot.data() as Profile
                setProfile({ ...profileData, id: snapshot.id } as Profile)
              }
            },
            (error) => {
              // Silent fail for real-time updates
            }
          )
        }
      } else {
        // Unsubscribe from profile listener
        if (profileUnsubscribe) {
          profileUnsubscribe()
          profileUnsubscribe = null
        }
        
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
      if (profileUnsubscribe) {
        profileUnsubscribe()
      }
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

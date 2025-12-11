'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/service/firebase'
import { Profile } from '@/types/profile'

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

  const fetchProfile = async (firebaseUser: FirebaseUser) => {
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
        })
      })

      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
      } else {
        //console.error('Failed to fetch profile:', data.error)
      }
    } catch (err) {
      //console.error('Error fetching profile:', err)
    }
  }

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user)
    }
  }, [user])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      //console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out')
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Fetch user profile
        await fetchProfile(firebaseUser)
      } else {
        // Clear profile when user logs out
        //console.log('Clearing profile data')
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

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
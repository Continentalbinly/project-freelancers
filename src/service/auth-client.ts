'use client'

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase'
import {
  sendEmailVerification
} from 'firebase/auth'
import { AuthResponse } from '../types/auth'

// Client-side login function
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  if (!isFirebaseConfigured || !auth) {
    return { success: false, error: 'Authentication not configured' }
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user



    // Get user profile from server
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await user.getIdToken()}`
      },
      body: JSON.stringify({
        action: 'get-profile',
        userId: user.uid
      })
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to get user profile')
    }

    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email!,
        ...data.data
      }
    }
  } catch (error: any) {
    let errorMessage = 'Login failed'

    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address'
          break
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address'
          break
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later'
          break
        default:
          errorMessage = error.message || 'Login failed'
      }
    }

    return { success: false, error: errorMessage }
  }
}

// Client-side signup function
export async function signupUser(
  email: string,
  password: string,
  fullName: string,
  userType: string,
  avatarUrl?: string,
  additionalData?: {
    userType?: ('freelancer' | 'client' | 'admin')[] // New array structure
    userRoles?: ('freelancer' | 'client' | 'admin')[] // Legacy support
    dateOfBirth?: string
    gender?: string
    phone?: string
    location?: string
    country?: string
    city?: string
    university?: string
    fieldOfStudy?: string
    graduationYear?: string
    skills?: string[]
    bio?: string
    hourlyRate?: number
    institution?: string
    department?: string
    position?: string
    yearsOfExperience?: number
    acceptTerms: boolean
    acceptPrivacyPolicy: boolean
    acceptMarketingEmails?: boolean
  }
): Promise<AuthResponse> {
  if (!isFirebaseConfigured || !auth) {
    return { success: false, error: 'Authentication not configured' }
  }

  try {
    // Create user with Firebase on client side
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Send email verification immediately
    await sendEmailVerification(user, {
      url: `${window.location.origin}/verify-email?userId=${user.uid}`,
      handleCodeInApp: false
    })

    // Create profile on server side
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await user.getIdToken()}`
      },
      body: JSON.stringify({
        action: 'create-profile',
        userId: user.uid,
        email: user.email,
        fullName,
        userType,
        avatarUrl,
        ...additionalData
      })
    })

    const data = await response.json()

    if (!data.success) {
      // If profile creation fails, delete the Firebase user
      await user.delete()
      throw new Error(data.error || 'Failed to create user profile')
    }

    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email!,
        ...data.data
      },
      requiresVerification: true
    }
  } catch (error: any) {
    let errorMessage = 'Signup failed'

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address'
          break
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters'
          break
        default:
          errorMessage = error.message || 'Signup failed'
      }
    }

    return { success: false, error: errorMessage }
  }
}

// Client-side logout function
export async function logoutUser(): Promise<AuthResponse> {
  if (!isFirebaseConfigured || !auth) {
    console.error('Firebase not configured for logout')
    return { success: false, error: 'Authentication not configured' }
  }

  try {
    console.log('Starting logout process...')
    await signOut(auth)
    console.log('Logout successful')
    return { success: true }
  } catch (error: any) {
    console.error('Logout error:', error)
    return { success: false, error: error.message || 'Logout failed' }
  }
} 
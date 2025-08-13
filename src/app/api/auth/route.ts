import { NextRequest, NextResponse } from 'next/server'
import { auth, db } from '@/service/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const adminAuth = getAuth()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    // Verify Firebase ID token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(token)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid authorization token' },
        { status: 401 }
      )
    }

    switch (action) {
      case 'create-profile':
        return await createProfile(decodedToken.uid, data)
      
      case 'get-profile':
        return await getProfile(decodedToken.uid)
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createProfile(userId: string, data: any) {
  try {
    const {
      email,
      fullName,
      userType,
      userRoles,
      avatarUrl,
      dateOfBirth,
      gender,
      phone,
      location,
      country,
      city,
      website,
      university,
      fieldOfStudy,
      graduationYear,
      skills,
      bio,
      hourlyRate,
      institution,
      department,
      position,
      yearsOfExperience,
      projectPreferences,
      budgetRange,
      acceptTerms,
      acceptPrivacyPolicy,
      acceptMarketingEmails
    } = data

    const profileData = {
      id: userId,
      email,
      fullName,
      userType: Array.isArray(userType) ? userType : [userType], // Ensure userType is always an array
      userRoles: userRoles || (Array.isArray(userType) ? userType : [userType]), // Support both structures
      avatarUrl,
      dateOfBirth,
      gender,
      phone,
      location,
      country,
      city,
      website: '',
      university,
      fieldOfStudy,
      graduationYear,
      skills: skills || [],
      bio,
      hourlyRate: hourlyRate || '',
      institution,
      department,
      position,
      yearsOfExperience: yearsOfExperience || 0,
      projectPreferences: '',
      budgetRange: '',
      acceptTerms,
      acceptPrivacyPolicy,
      acceptMarketingEmails,
      emailVerified: false,
      isActive: true,
      rating: 0,
      totalRatings: 0,
      totalEarned: 0,
      projectsCompleted: 0,
      activeProjects: 0,
      totalProjects: 0,
      favoriteCount: 0,
      projectsPosted: 0,
      totalSpent: 0,
      freelancersHired: 0,
      completedProjects: 0,
      openProjects: 0,
      // Notification settings
      emailNotifications: true,
      projectUpdates: true,
      proposalNotifications: true,
      marketingEmails: acceptMarketingEmails || false,
      weeklyDigest: false,
      browserNotifications: true,
      // Privacy settings
      profileVisibility: true, // Changed from 'public' to true
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      searchableProfile: true,
      showFavorites: true,
      // Rating breakdown
      communicationRating: 0,
      qualityRating: 0,
      valueRating: 0,
      timelinessRating: 0,
      // Portfolio fields
      portfolio: {},
      sections: [],
      // Email verification
      emailVerificationToken: '',
      emailVerificationExpires: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Save to Firestore
    await setDoc(doc(db, 'profiles', userId), profileData)

    return NextResponse.json({
      success: true,
      data: profileData,
      message: 'Profile created successfully'
    })
  } catch (error) {
    console.error('Create profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}

async function getProfile(userId: string) {
  try {
    const profileDoc = await getDoc(doc(db, 'profiles', userId))
    
    if (!profileDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profileDoc.data()
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get profile' },
      { status: 500 }
    )
  }
} 
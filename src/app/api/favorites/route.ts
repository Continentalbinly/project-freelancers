import { NextRequest, NextResponse } from 'next/server'
import { auth, requireDb } from '@/service/firebase'
import { doc, setDoc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
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
      case 'add-favorite':
        return await addFavorite(decodedToken.uid, data.projectId)
      
      case 'remove-favorite':
        return await removeFavorite(decodedToken.uid, data.projectId)
      
      case 'check-favorite':
        return await checkFavorite(decodedToken.uid, data.projectId)
      
      case 'get-user-favorites':
        return await getUserFavorites(decodedToken.uid)
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    //console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function addFavorite(userId: string, projectId: string) {
  try {
    const db = requireDb();
    // Check if project exists
    const projectRef = doc(db, 'projects', projectId)
    const projectSnap = await getDoc(projectRef)
    
    if (!projectSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const favoriteId = `${userId}_${projectId}`
    const favoriteRef = doc(db, 'projectFavorites', favoriteId)
    const favoriteSnap = await getDoc(favoriteRef)
    
    if (favoriteSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Project already favorited' },
        { status: 400 }
      )
    }

    // Add to favorites
    await setDoc(favoriteRef, {
      userId,
      projectId,
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Project added to favorites'
    })
  } catch (error) {
    //console.error('Add favorite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

async function removeFavorite(userId: string, projectId: string) {
  try {
    const db = requireDb();
    const favoriteId = `${userId}_${projectId}`
    const favoriteRef = doc(db, 'projectFavorites', favoriteId)
    
    await deleteDoc(favoriteRef)

    return NextResponse.json({
      success: true,
      message: 'Project removed from favorites'
    })
  } catch (error) {
    //console.error('Remove favorite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}

async function checkFavorite(userId: string, projectId: string) {
  try {
    const db = requireDb();
    const favoriteId = `${userId}_${projectId}`
    const favoriteRef = doc(db, 'projectFavorites', favoriteId)
    const favoriteSnap = await getDoc(favoriteRef)
    
    return NextResponse.json({
      success: true,
      isFavorited: favoriteSnap.exists()
    })
  } catch (error) {
    //console.error('Check favorite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check favorite status' },
      { status: 500 }
    )
  }
}

async function getUserFavorites(userId: string) {
  try {
    const db = requireDb();
    const favoritesQuery = query(
      collection(db, 'projectFavorites'),
      where('userId', '==', userId)
    )
    const favoritesSnap = await getDocs(favoritesQuery)
    
    const favorites = []
    for (const doc of favoritesSnap.docs) {
      const data = doc.data()
      favorites.push({
        id: doc.id,
        projectId: data.projectId,
        createdAt: data.createdAt
      })
    }

    return NextResponse.json({
      success: true,
      data: favorites
    })
  } catch (error) {
    //console.error('Get user favorites error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get user favorites' },
      { status: 500 }
    )
  }
} 
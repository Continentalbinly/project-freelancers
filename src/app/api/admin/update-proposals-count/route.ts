import { NextRequest, NextResponse } from 'next/server'
import { auth, requireDb } from '@/service/firebase'
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'
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

    //console.log('Starting proposals count update...')
    
    const db = requireDb();
    // Get all projects
    const projectsSnapshot = await getDocs(collection(db, 'projects'))
    //console.log(`Found ${projectsSnapshot.size} projects`)
    
    let updatedCount = 0
    const results = []
    
    for (const projectDoc of projectsSnapshot.docs) {
      const projectId = projectDoc.id
      const projectData = projectDoc.data()
      
      // Count proposals for this project
      const proposalsQuery = query(
        collection(db, 'proposals'),
        where('projectId', '==', projectId)
      )
      const proposalsSnapshot = await getDocs(proposalsQuery)
      const actualProposalsCount = proposalsSnapshot.size
      
      // Update project if count is different
      if (projectData.proposalsCount !== actualProposalsCount) {
        await updateDoc(doc(db, 'projects', projectId), {
          proposalsCount: actualProposalsCount,
          updatedAt: new Date()
        })
        //console.log(`Updated project ${projectId}: ${projectData.proposalsCount} → ${actualProposalsCount}`)
        results.push({
          projectId,
          oldCount: projectData.proposalsCount,
          newCount: actualProposalsCount
        })
        updatedCount++
      }
    }
    
    //console.log(`Update complete! Updated ${updatedCount} projects.`)
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} projects`,
      updatedCount,
      results
    })
  } catch (error) {
    //console.error('Error updating proposals count:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update proposals count' },
      { status: 500 }
    )
  }
} 
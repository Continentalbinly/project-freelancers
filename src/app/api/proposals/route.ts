import { NextRequest, NextResponse } from 'next/server'
import { auth, db } from '@/service/firebase'
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore'
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
      case 'create-proposal':
        return await createProposal(decodedToken.uid, data)
      
      case 'get-proposals':
        return await getProposals(data.projectId)
      
      case 'update-proposal-status':
        return await updateProposalStatus(decodedToken.uid, data)
      
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

async function createProposal(freelancerId: string, data: any) {
  try {
    const {
      projectId,
      coverLetter,
      proposedRate,
      proposedBudget,
      estimatedDuration
    } = data

    // Check if project exists
    const projectRef = doc(db, 'projects', projectId)
    const projectSnap = await getDoc(projectRef)
    
    if (!projectSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user already submitted a proposal for this project
    const existingProposalsQuery = query(
      collection(db, 'proposals'),
      where('projectId', '==', projectId),
      where('freelancerId', '==', freelancerId)
    )
    const existingProposals = await getDocs(existingProposalsQuery)
    
    if (!existingProposals.empty) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted a proposal for this project' },
        { status: 400 }
      )
    }

    // Create proposal
    const proposalData = {
      projectId,
      freelancerId,
      coverLetter,
      proposedRate,
      proposedBudget,
      estimatedDuration,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Add proposal to Firestore
    const proposalRef = doc(collection(db, 'proposals'))
    await setDoc(proposalRef, {
      ...proposalData,
      id: proposalRef.id
    })

    // Update project's proposalsCount
    await updateDoc(projectRef, {
      proposalsCount: increment(1),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      data: { ...proposalData, id: proposalRef.id },
      message: 'Proposal submitted successfully'
    })
  } catch (error) {
    //console.error('Create proposal error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create proposal' },
      { status: 500 }
    )
  }
}

async function getProposals(projectId: string) {
  try {
    const proposalsQuery = query(
      collection(db, 'proposals'),
      where('projectId', '==', projectId)
    )
    const proposalsSnap = await getDocs(proposalsQuery)
    
    const proposals = []
    for (const doc of proposalsSnap.docs) {
      const data = doc.data()
      proposals.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      })
    }

    return NextResponse.json({
      success: true,
      data: proposals
    })
  } catch (error) {
    //console.error('Get proposals error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get proposals' },
      { status: 500 }
    )
  }
}

async function updateProposalStatus(userId: string, data: any) {
  try {
    const { proposalId, status, processedBy } = data

    const proposalRef = doc(db, 'proposals', proposalId)
    const proposalSnap = await getDoc(proposalRef)
    
    if (!proposalSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 }
      )
    }

    const proposalData = proposalSnap.data()
    
    // Update proposal status
    await updateDoc(proposalRef, {
      status,
      processedBy,
      processedAt: new Date(),
      updatedAt: new Date()
    })

    // If proposal is accepted, update project
    if (status === 'accepted') {
      const projectRef = doc(db, 'projects', proposalData.projectId)
      await updateDoc(projectRef, {
        status: 'in_progress',
        acceptedFreelancerId: proposalData.freelancerId,
        acceptedProposalId: proposalId,
        updatedAt: new Date()
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal status updated successfully'
    })
  } catch (error) {
    //console.error('Update proposal status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update proposal status' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { requireDb } from '@/service/firebase'
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { logger } from '@/lib/logger'
import { createProposalSchema, updateProposalStatusSchema, validateRequest, idSchema, validate } from '@/lib/validation'
import { withRateLimit, apiRateLimit } from '@/lib/rateLimit'

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
  // Rate limiting
  const rateLimitResult = await withRateLimit(request, apiRateLimit)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: rateLimitResult.error },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)) } }
    )
  }

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
      logger.apiError('/api/proposals', error instanceof Error ? error : new Error('Invalid token'), { action })
      return NextResponse.json(
        { success: false, error: 'Invalid authorization token' },
        { status: 401 }
      )
    }

    switch (action) {
      case 'create-proposal':
        return await createProposal(decodedToken.uid, data)
      
      case 'get-proposals':
        // Validate projectId
        const projectIdResult = validate(idSchema, data.projectId)
        if (!projectIdResult.success) {
          return NextResponse.json(
            { success: false, error: projectIdResult.error },
            { status: 400 }
          )
        }
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
    logger.apiError('/api/proposals', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createProposal(freelancerId: string, data: unknown) {
  try {
    // Validate input
    const validatedData = validateRequest(createProposalSchema, data)

    const { projectId, coverLetter, proposedRate, proposedBudget, estimatedDuration } = validatedData

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
      proposedRate: proposedRate ?? null,
      proposedBudget,
      estimatedDuration,
      status: 'pending' as const,
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

    logger.info('Proposal created successfully', { proposalId: proposalRef.id, projectId, freelancerId })

    return NextResponse.json({
      success: true,
      data: { ...proposalData, id: proposalRef.id },
      message: 'Proposal submitted successfully'
    })
  } catch (error) {
    logger.firebaseError('createProposal', error instanceof Error ? error : new Error(String(error)), { freelancerId })
    return NextResponse.json(
      { success: false, error: 'Failed to create proposal' },
      { status: 500 }
    )
  }
}

async function getProposals(projectId: string) {
  try {
    const db = requireDb();

    const proposalsQuery = query(
      collection(db, 'proposals'),
      where('projectId', '==', projectId)
    )
    const proposalsSnap = await getDocs(proposalsQuery)
    
    const proposals: Array<Record<string, unknown>> = []
    for (const docSnap of proposalsSnap.docs) {
      const data = docSnap.data()
      proposals.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt
      })
    }

    return NextResponse.json({
      success: true,
      data: proposals
    })
  } catch (error) {
    logger.firebaseError('getProposals', error instanceof Error ? error : new Error(String(error)), { projectId })
    return NextResponse.json(
      { success: false, error: 'Failed to get proposals' },
      { status: 500 }
    )
  }
}

async function updateProposalStatus(userId: string, data: unknown) {
  try {
    // Validate input
    const validatedData = validateRequest(updateProposalStatusSchema, data)
    const { proposalId, status, processedBy } = validatedData

    const db = requireDb();

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
      ...(processedBy && { processedBy }),
      processedAt: new Date(),
      updatedAt: new Date()
    })

    // If proposal is accepted, update project
    if (status === 'accepted' && proposalData.projectId) {
      const projectRef = doc(db, 'projects', proposalData.projectId as string)
      await updateDoc(projectRef, {
        status: 'in_progress',
        acceptedFreelancerId: proposalData.freelancerId,
        acceptedProposalId: proposalId,
        updatedAt: new Date()
      })
    }

    logger.info('Proposal status updated', { proposalId, status, userId })

    return NextResponse.json({
      success: true,
      message: 'Proposal status updated successfully'
    })
  } catch (error) {
    logger.firebaseError('updateProposalStatus', error instanceof Error ? error : new Error(String(error)), { userId })
    return NextResponse.json(
      { success: false, error: 'Failed to update proposal status' },
      { status: 500 }
    )
  }
} 
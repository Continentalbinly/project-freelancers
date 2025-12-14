import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// ✅ Initialize Firebase Admin SDK (server-side only)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
    }),
  });
}

const adminAuth = getAuth();
const adminDB = getFirestore();

/**
 * GET /api/dashboard/freelancer
 * Fetch freelancer dashboard data with optimizations
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid authorization token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Fetch proposals and profile in parallel
    const [proposalsSnap, profileSnap] = await Promise.all([
      adminDB
        .collection('proposals')
        .where('freelancerId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(6)
        .get(),
      adminDB.collection('profiles').doc(userId).get(),
    ]);

    const proposals = proposalsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const profileData = profileSnap.data();

    // Calculate stats efficiently
    const pending = proposals.filter((p: any) => p.status === 'pending').length;
    const completedProjects =
      typeof profileData?.projectsCompleted === 'number'
        ? profileData.projectsCompleted
        : typeof profileData?.completedProjects === 'number'
        ? profileData.completedProjects
        : 0;

    const totalEarned = profileData?.totalEarned || 0;

    // Set cache headers for 3 minutes
    const response = NextResponse.json({
      success: true,
      data: {
        proposals,
        stats: {
          pendingProposals: pending,
          completedProjects,
          totalEarned,
        },
      },
    });

    response.headers.set(
      'Cache-Control',
      'public, max-age=180, stale-while-revalidate=60'
    );

    return response;
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

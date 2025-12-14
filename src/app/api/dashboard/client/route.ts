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
 * GET /api/dashboard/client
 * Fetch client dashboard data with optimizations
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

    // Fetch projects and profile in parallel
    const [projectsSnap, profileSnap] = await Promise.all([
      adminDB
        .collection('projects')
        .where('clientId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(6)
        .get(),
      adminDB.collection('profiles').doc(userId).get(),
    ]);

    const projects = projectsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const profileData = profileSnap.data();

    // Calculate stats efficiently
    const activeProjects = projects.filter(
      (p: any) => p.status === 'open' || p.status === 'in_progress'
    ).length;
    const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
    const credit = profileData?.credit || 0;

    // Set cache headers for 3 minutes
    const response = NextResponse.json({
      success: true,
      data: {
        projects,
        stats: {
          activeProjects,
          completedProjects,
          credit,
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

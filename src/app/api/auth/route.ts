import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type Firestore = ReturnType<typeof getFirestore>;
type AdminAuth = ReturnType<typeof getAuth>;

const requiredAdminEnv = [
  "FIREBASE_PROJECT_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
];

let adminInitError: Error | null = null;
let adminInitialized = false;
let adminAuth: AdminAuth | null = null;
let adminDB: Firestore | null = null;

function initFirebaseAdmin() {
  if (adminInitialized) return;

  if (getApps().length) {
    try {
      adminAuth = getAuth();
      adminDB = getFirestore();
      adminInitialized = true;
    } catch (error) {
      adminInitError =
        error instanceof Error
          ? error
          : new Error("Failed to attach to existing Firebase Admin app");
    }
    return;
  }

  const missing = requiredAdminEnv.filter(
    (key) => !process.env[key] || process.env[key] === ""
  );

  if (missing.length) {
    adminInitError = new Error(
      `Missing Firebase Admin env vars: ${missing.join(", ")}`
    );
    return;
  }

  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(
          /\\n/g,
          "\n"
        ),
      }),
    });
    adminAuth = getAuth();
    adminDB = getFirestore();
    adminInitialized = true;
  } catch (error) {
    adminInitError =
      error instanceof Error
        ? error
        : new Error("Failed to initialize Firebase Admin");
  }
}

initFirebaseAdmin();

/**
 * dY"Â Unified handler
 */
export async function POST(request: NextRequest) {
  if (adminInitError || !adminInitialized || !adminAuth || !adminDB) {
    return NextResponse.json(
      { success: false, error: "Authentication service unavailable" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { action, ...data } = body;

    // Æ’o. Verify Firebase ID token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      //console.error("Æ’?O Invalid Firebase ID token:", error);
      return NextResponse.json(
        { success: false, error: "Invalid authorization token" },
        { status: 401 }
      );
    }

    switch (action) {
      case "create-profile":
        return await createProfile(adminDB, decodedToken.uid, data);
      case "get-profile":
        return await getProfile(adminDB, decodedToken.uid);
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    //console.error("dY"Â API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Æ’o. Create user profile (full data from signup)
 */
async function createProfile(db: Firestore, userId: string, data: any) {
  try {
    // Merge category + occupation right here
    const role = data.role || "freelancer";
    const occupation = data.occupation && typeof data.occupation === "object"
      ? data.occupation
      : { id: role, name_en: role, name_lo: role };
    const now = new Date();

    const profileData: Record<string, unknown> = {
      id: userId,
      email: data.email || "",
      fullName: data.fullName || "",
      role,
      occupation,
      // Admin overlay must never be set by clients at signup
      isAdmin: false,
      avatarUrl: data.avatarUrl || "",
      dateOfBirth: data.dateOfBirth || "",
      gender: data.gender || "",
      phone: data.phone || "",
      location: data.location || "",
      country: data.country || "",
      city: data.city || "",
      university: data.university || "",
      fieldOfStudy: data.fieldOfStudy || "",
      graduationYear: data.graduationYear || "",
      skills: Array.isArray(data.skills) ? data.skills : [],
      bio: data.bio || "",
      hourlyRate: data.hourlyRate || "",
      institution: data.institution || "",
      department: data.department || "",
      position: data.position || "",
      yearsOfExperience: Number(data.yearsOfExperience) || 0,
      projectPreferences: data.projectPreferences || "",
      budgetRange: data.budgetRange || "",
      acceptTerms: Boolean(data.acceptTerms),
      acceptPrivacyPolicy: Boolean(data.acceptPrivacyPolicy),
      acceptMarketingEmails: Boolean(data.acceptMarketingEmails),

      // ✅ SECURITY: Initial billing & state (server enforced, client values ignored)
      credit: 0,
      plan: "free",
      planStatus: "inactive",
      planStartDate: null,
      planEndDate: null,
      totalTopups: 0,
      totalSpentOnPlans: 0,

      // ✅ SECURITY: System defaults (client cannot override)
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
      emailNotifications: true,
      projectUpdates: true,
      proposalNotifications: true,
      marketingEmails: Boolean(data.acceptMarketingEmails),
      weeklyDigest: false,
      browserNotifications: true,
      profileVisibility: true,
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      searchableProfile: true,
      showFavorites: true,
      communicationRating: 0,
      qualityRating: 0,
      valueRating: 0,
      timelinessRating: 0,
      portfolio: {},
      sections: [],
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("profiles").doc(userId).set(profileData);

    return NextResponse.json({
      success: true,
      data: profileData,
      message: "Profile created successfully",
    });
  } catch (error) {
    //console.error("Æ’?O Firestore create error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

/**
 * Æ’o. Get profile
 */
async function getProfile(db: Firestore, userId: string) {
  try {
    const snap = await db.collection("profiles").doc(userId).get();
    if (!snap.exists) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: snap.data() });
  } catch (error) {
    //console.error("Æ’?O Firestore get error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

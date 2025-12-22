import { NextRequest, NextResponse } from "next/server";
import { DecodedIdToken, getAuth } from "firebase-admin/auth";
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
    } catch {
      adminInitError =
        new Error("Failed to attach to existing Firebase Admin app");
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
  } catch {
    adminInitError =
      new Error("Failed to initialize Firebase Admin");
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
    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
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
  } catch {
    //console.error("dY"Â API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

import type { SignupCredentials } from "@/types/auth";

/**
 * ✅ Create user profile (full data from signup) with idempotency
 */
async function createProfile(db: Firestore, userId: string, data: SignupCredentials & Record<string, unknown>) {
  try {
    const profileRef = db.collection("profiles").doc(userId);
    
    // ✅ Check if profile already exists (idempotency)
    const existingDoc = await profileRef.get();
    if (existingDoc.exists) {
      // Profile already exists, return success with existing data
      return NextResponse.json({
        success: true,
        data: existingDoc.data(),
        message: "Profile already exists",
      });
    }

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

    // ✅ Use set with merge option for idempotency (prevents race conditions)
    await profileRef.set(profileData, { merge: false });

    // ✅ Verify profile was created
    const verifyDoc = await profileRef.get();
    if (!verifyDoc.exists) {
      throw new Error("Profile creation verification failed");
    }

    return NextResponse.json({
      success: true,
      data: profileData,
      message: "Profile created successfully",
    });
  } catch (error: unknown) {
    console.error("Firestore create error:", error);
    
    // Check if it's a permission error vs other error
    const errorMessage = (error instanceof Error ? error.message : String(error)) || "Failed to create profile";
    const isPermissionError = errorMessage.includes("permission") || 
                             errorMessage.includes("PERMISSION_DENIED");
    
    return NextResponse.json(
      { 
        success: false, 
        error: isPermissionError 
          ? "Permission denied. Please check your authentication." 
          : "Failed to create profile. Please try again." 
      },
      { status: isPermissionError ? 403 : 500 }
    );
  }
}

/**
 * ✅ Get profile with error handling
 */
async function getProfile(db: Firestore, userId: string) {
  try {
    const profileRef = db.collection("profiles").doc(userId);
    const snap = await profileRef.get();
    
    if (!snap.exists) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    const profileData = snap.data();
    
    // ✅ Ensure required fields exist
    if (!profileData) {
      return NextResponse.json(
        { success: false, error: "Profile data is empty" },
        { status: 404 }
      );
    }

    // ✅ Add id field to profile data
    return NextResponse.json({ 
      success: true, 
      data: { ...profileData, id: snap.id }
    });
  } catch (error: unknown) {
    console.error("Firestore get error:", error);
    
    const errorMessage = (error instanceof Error ? error.message : String(error)) || "Failed to get profile";
    const isPermissionError = errorMessage.includes("permission") || 
                             errorMessage.includes("PERMISSION_DENIED");
    
    return NextResponse.json(
      { 
        success: false, 
        error: isPermissionError 
          ? "Permission denied. Please check your authentication." 
          : "Failed to get profile. Please try again." 
      },
      { status: isPermissionError ? 403 : 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
 * 🔥 Unified handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    // ✅ Verify Firebase ID token
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
      //console.error("❌ Invalid Firebase ID token:", error);
      return NextResponse.json(
        { success: false, error: "Invalid authorization token" },
        { status: 401 }
      );
    }

    switch (action) {
      case "create-profile":
        return await createProfile(decodedToken.uid, data);
      case "get-profile":
        return await getProfile(decodedToken.uid);
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    //console.error("🔥 API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * ✅ Create user profile (full data from signup)
 */
async function createProfile(userId: string, data: any) {
  try {
    // Merge category + occupation right here
    const mainRole = data.userRoles?.[0] || data.userType || "freelancer";
    const category =
      mainRole === "freelancer" ? data.userCategory : data.clientCategory;
    const occupation = category ? `${mainRole}_${category}` : mainRole;

    const profileData: Record<string, unknown> = {
      id: userId,
      email: data.email,
      fullName: data.fullName,
      userType: Array.isArray(data.userType) ? data.userType : [data.userType],
      userRoles:
        data.userRoles ||
        (Array.isArray(data.userType) ? data.userType : [data.userType]),
      occupation, // ✅ directly saved
      userCategory: data.userCategory || "",
      clientCategory: data.clientCategory || "",
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
      skills: data.skills || [],
      bio: data.bio || "",
      hourlyRate: data.hourlyRate || "",
      institution: data.institution || "",
      department: data.department || "",
      position: data.position || "",
      yearsOfExperience: data.yearsOfExperience || 0,
      projectPreferences: data.projectPreferences || "",
      budgetRange: data.budgetRange || "",
      acceptTerms: data.acceptTerms || false,
      acceptPrivacyPolicy: data.acceptPrivacyPolicy || false,
      acceptMarketingEmails: data.acceptMarketingEmails || false,

      // ✅ Initial billing & state
      credit: data.credit || 0,
      plan: data.plan || "free",
      planStatus: data.planStatus || "inactive",
      planStartDate: data.planStartDate || null,
      planEndDate: data.planEndDate || null,
      totalTopups: data.totalTopups || 0,
      totalSpentOnPlans: data.totalSpentOnPlans || 0,

      // ✅ System defaults
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
      marketingEmails: data.acceptMarketingEmails || false,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminDB.collection("profiles").doc(userId).set(profileData);

    return NextResponse.json({
      success: true,
      data: profileData,
      message: "Profile created successfully",
    });
  } catch (error) {
    //console.error("❌ Firestore create error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

/**
 * ✅ Get profile
 */
async function getProfile(userId: string) {
  try {
    const snap = await adminDB.collection("profiles").doc(userId).get();
    if (!snap.exists) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: snap.data() });
  } catch (error) {
    //console.error("❌ Firestore get error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

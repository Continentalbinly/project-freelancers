"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase"; // ✅ include db here
import { AuthResponse, type User } from "../types/auth";

/** ✅ LOGIN — handles Firebase + backend fetch + consistent error codes */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  if (!isFirebaseConfigured || !auth) {
    return {
      success: false,
      error: "Authentication not configured",
      errorCode: "auth/config-error",
    };
  }

  try {
    // 🔐 Attempt Firebase login
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 🔄 Parallel operations for better performance
    const [idToken, _] = await Promise.all([
      user.getIdToken(true), // Force refresh token
      user.reload(), // Reload user to ensure latest emailVerified info
    ]);

    // ✅ Sync Firestore if verified (non-blocking, fire and forget)
    if (user.emailVerified && db) {
      const ref = doc(db, "profiles", user.uid);
      getDoc(ref)
        .then((snap) => {
          if (snap.exists() && snap.data().emailVerified === false) {
            updateDoc(ref, {
              emailVerified: true,
              updatedAt: new Date(),
            }).catch(() => {
              // Silent fail for sync operation
            });
          }
        })
        .catch(() => {
          // Silent fail for sync operation
        });
    }

    // 🧩 Fetch user profile from backend
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        action: "get-profile",
        userId: user.uid,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to get user profile`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to get user profile");
    }

    return {
      success: true,
      user: { id: user.uid, email: user.email!, ...data.data },
    };
  } catch (err: any) {
    const code =
      err?.code || extractFirebaseCode(err?.message) || "auth/unknown";
    const friendly = getFirebaseErrorMessage(code);
    return { success: false, error: friendly, errorCode: code };
  }
}

function extractFirebaseCode(message?: string): string | undefined {
  if (!message) return;
  const match = message.match(/\(auth\/[a-zA-Z0-9-]+\)/);
  if (match) return match[0].replace(/[()]/g, "");
}

function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/invalid-credential": "Incorrect email or password. Please try again.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Invalid email address format.",
    "auth/too-many-requests":
      "Too many login attempts. Please wait and try again later.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/network-request-failed":
      "Network error. Please check your connection.",
    "auth/config-error": "Authentication system not configured properly.",
    "auth/unknown": "Email or password is incorrect. Please try again.",
  };
  return messages[code] || messages["auth/unknown"];
}

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * ✅ Ensure displayName is set on Firebase Auth user (required for %DISPLAY_NAME% in email templates)
 * This fetches fullName from Firestore profile if displayName is missing
 */
export async function ensureDisplayName(user: FirebaseUser): Promise<void> {
  // If displayName already exists, no need to update
  if (user.displayName) {
    return;
  }

  // Try to get fullName from Firestore profile
  if (!db) {
    return; // Can't fetch profile without db
  }

  try {
    const profileRef = doc(db, "profiles", user.uid);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const profileData = profileSnap.data();
      const fullName = profileData.fullName;
      
      if (fullName && typeof fullName === "string") {
        await updateProfile(user, { displayName: fullName });
      }
    }
  } catch (error) {
    // Silent fail - displayName is not critical for functionality
    console.warn("Failed to set displayName:", error);
  }
}

/**
 * ✅ Get proper continueUrl for email verification
 * This is where users are redirected AFTER clicking the verification link
 * 
 * IMPORTANT: Always use the production/test domain, not localhost,
 * because emails are sent and clicked from anywhere.
 */
export function getVerificationContinueUrl(): string {
  // Priority 1: Use environment variable (works in both client and server)
  // This should be set to your actual domain (e.g., https://test.unijobs.app or https://unijobs.app)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (siteUrl) {
    return `${siteUrl}/auth/verify-email`;
  }
  
  // Priority 2: Use window.location.origin only if it's NOT localhost (for development on actual domain)
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // Only use localhost if explicitly in development and no env var is set
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      // In local development, default to test domain
      return "https://test.unijobs.app/auth/verify-email";
    }
    return `${origin}/auth/verify-email`;
  }
  
  // Priority 3: Fallback to production domain
  return "https://unijobs.app/auth/verify-email";
}

/**
 * Create profile in Firestore with retry logic
 */
async function createFirestoreProfile(
  userId: string,
  email: string | null,
  fullName: string,
  role: string,
  avatarUrl?: string,
  additionalData?: Record<string, any>
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not configured");
  }

  const userRef = doc(db, "profiles", userId);
  
  // Check if profile already exists
  const existing = await getDoc(userRef);
  if (existing.exists()) {
    return; // Profile already exists, skip creation
  }

  // Create profile with retry logic
  await retryWithBackoff(async () => {
    await setDoc(userRef, {
      uid: userId,
      email: email || "",
      fullName: fullName || email?.split("@")[0] || "User",
      avatarUrl: avatarUrl || "",
      role: role,
      occupation: additionalData?.occupation || { 
        id: role, 
        name_en: role, 
        name_lo: role 
      },
      isAdmin: false,
      credit: 0,
      plan: "free",
      planStatus: "inactive",
      planStartDate: null,
      planEndDate: null,
      totalTopups: 0,
      totalSpentOnPlans: 0,
      isActive: true,
      emailVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData,
    });
  }, 3, 200);
}

/** ✅ SIGNUP — optimized with guaranteed profile creation */
export async function signupUser(
  email: string,
  password: string,
  fullName: string,
  role: string,
  avatarUrl?: string,
  additionalData?: Record<string, any>
): Promise<AuthResponse> {
  if (!isFirebaseConfigured || !auth || !db) {
    return { 
      success: false, 
      error: "Authentication not configured",
      errorCode: "auth/config-error",
    };
  }

  let user: any = null;

  try {
    // ✅ 1. Create account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    user = userCredential.user;

    // ✅ 2. Get ID token with retry (for immediate use in API call)
    let token: string;
    try {
      token = await retryWithBackoff(
        () => user.getIdToken(true),
        3,
        200
      );
    } catch (tokenError) {
      // If token fetch fails, delete user and throw
      await user.delete();
      throw new Error("Failed to obtain authentication token");
    }

    // ✅ 3. Set displayName FIRST (required for %DISPLAY_NAME% in email template)
    await updateProfile(user, { displayName: fullName });

    // ✅ 4. Parallel: Send verification email + Create profile
    const profilePromise = (async () => {
      // Try API first (server-side, more secure)
      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "create-profile",
            userId: user.uid,
            email: user.email,
            fullName,
            role,
            avatarUrl,
            ...additionalData,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || "API profile creation failed");
        }

        return true; // API creation successful
      } catch (apiErr) {
        // Fallback to client-side Firestore creation
        console.warn("API profile creation failed, using Firestore fallback:", apiErr);
        await createFirestoreProfile(
          user.uid,
          user.email,
          fullName,
          role,
          avatarUrl,
          additionalData
        );
        return true; // Fallback creation successful
      }
    })();

    // ✅ Send verification email with proper continueUrl
    const verificationPromise = sendEmailVerification(user, {
      url: getVerificationContinueUrl(),
      handleCodeInApp: false,
    });

    // Wait for profile creation (critical) and verification email (non-critical)
    const results = await Promise.allSettled([
      profilePromise,
      verificationPromise,
    ]);

    const [profileResult, verificationResult] = results;

    // If profile creation failed, rollback
    if (profileResult.status === "rejected") {
      await user.delete();
      throw new Error(
        "Failed to create user profile. Please try again or contact support."
      );
    }

    // Log verification email errors but don't fail signup
    if (verificationResult.status === "rejected") {
      console.warn("Verification email failed to send:", verificationResult.reason);
    }

    return {
      success: true,
      user: { id: user.uid, email: user.email || "" } as unknown as User,
      requiresVerification: true,
    };
  } catch (error: any) {
    // Ensure cleanup on any error
    if (user) {
      try {
        await user.delete();
      } catch (deleteError) {
        // Log but don't throw - original error is more important
        console.error("Failed to cleanup user account:", deleteError);
      }
    }

    const code =
      error?.code || extractFirebaseCode(error?.message) || "auth/unknown";
    return {
      success: false,
      error: getFirebaseErrorMessage(code),
      errorCode: code,
    };
  }
}

/** ✅ LOGOUT */
export async function logoutUser(): Promise<AuthResponse> {
  if (!isFirebaseConfigured || !auth)
    return { success: false, error: "Authentication not configured" };

  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    const code =
      error?.code || extractFirebaseCode(error?.message) || "auth/unknown";
    return {
      success: false,
      error: getFirebaseErrorMessage(code),
      errorCode: code,
    };
  }
}

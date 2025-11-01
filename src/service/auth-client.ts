"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";
import { AuthResponse } from "../types/auth";

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

    // 🧩 Fetch user profile from backend
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
      body: JSON.stringify({
        action: "get-profile",
        userId: user.uid,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to get user profile");
    }

    return {
      success: true,
      user: { id: user.uid, email: user.email!, ...data.data },
    };
  } catch (err: any) {
    // ✅ Properly catch *and swallow* FirebaseError so React doesn't throw
    const code =
      err?.code || extractFirebaseCode(err?.message) || "auth/unknown";

    // Don’t console.error the full Firebase object — it throws the stack
    console.warn("[Login] Firebase Auth error:", code);

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
    // ✅ 👇 friendlier fallback instead of "unexpected error"
    "auth/unknown": "Email or password is incorrect. Please try again.",
  };
  return messages[code] || messages["auth/unknown"];
}

/** ✅ SIGNUP — with token refresh and delay fix */
export async function signupUser(
  email: string,
  password: string,
  fullName: string,
  userType: string,
  avatarUrl?: string,
  additionalData?: Record<string, any>
): Promise<AuthResponse> {
  if (!isFirebaseConfigured || !auth) {
    return { success: false, error: "Authentication not configured" };
  }

  try {
    // ✅ Create account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 🕒 Wait 0.5–1s to ensure Firebase has issued ID token
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 🔄 Force-refresh a valid token (avoids expired or missing token issue)
    const token = await user.getIdToken(true);

    // ✅ Send verification email (optional)
    await sendEmailVerification(user, {
      url: `${window.location.origin}/verify-email?userId=${user.uid}`,
      handleCodeInApp: false,
    });

    // ✅ Create Firestore profile (using Admin SDK on server)
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
        userType,
        avatarUrl,
        ...additionalData,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      // If Firestore failed, rollback the auth user to prevent orphan accounts
      await user.delete();
      throw new Error(data.error || "Failed to create user profile");
    }

    return {
      success: true,
      user: { id: user.uid, email: user.email!, ...data.data },
      requiresVerification: true,
    };
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

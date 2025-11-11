"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase"; // ✅ include db here
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

    // 🔄 Reload user to ensure latest emailVerified info
    await user.reload();

    // ✅ Sync Firestore if verified
    if (user.emailVerified && db) {
      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().emailVerified === false) {
        await updateDoc(ref, {
          emailVerified: true,
          updatedAt: new Date(),
        });
      }
    }

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
    const code =
      err?.code || extractFirebaseCode(err?.message) || "auth/unknown";
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

    // 🕒 Wait to ensure Firebase has issued ID token
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 🔄 Force-refresh a valid token
    const token = await user.getIdToken(true);

    // ✅ Send verification email
    await sendEmailVerification(user, {
      url: `${window.location.origin}/auth/verify-email?userId=${user.uid}`,
      handleCodeInApp: false,
    });

    // ✅ Create Firestore profile (server-side)
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
      await user.delete(); // rollback orphan auth user
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

"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
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
import { toast } from "react-toastify";

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
    // ✅ 1. Create account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 🕒 Small delay for token sync
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 🔄 Force-refresh ID token
    const token = await user.getIdToken(true);

    // ✅ 2. Send verification email
    await sendEmailVerification(user, {
      url: `${window.location.origin}/auth/verify-email?userId=${user.uid}`,
      handleCodeInApp: false,
    });

    // ✅ 3. Try to create Firestore profile via API (server-side)
    let profileCreated = false;
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
          userType,
          avatarUrl,
          ...additionalData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        profileCreated = true;
      } else {
        toast.warn("profile creation failed:", data.error);
      }
    } catch (apiErr) {
      toast.warn("API call failed, using local Firestore fallback");
    }

    // ✅ 4. Fallback — Direct Firestore creation if API failed
    if (!profileCreated) {
      try {
        const userRef = doc(db, "profiles", user.uid);
        const existing = await getDoc(userRef);

        if (!existing.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            fullName: fullName || email.split("@")[0],
            avatarUrl: avatarUrl || "",
            userType: Array.isArray(userType) ? userType : [userType],
            userRoles: Array.isArray(userType) ? userType : [userType],
            credit: 0,
            plan: "free",
            planStatus: "inactive",
            planStartDate: null,
            planEndDate: null,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...additionalData,
          });
          //console.log("✅ Fallback: Firestore profile created for", email);
        }
      } catch (localErr) {
        //console.error("❌ Failed to create Firestore profile:", localErr);
        await user.delete(); // rollback orphan auth
        throw new Error("Failed to create profile in Firestore");
      }
    }

    return {
      success: true,
      user: { id: user.uid, email: user.email || "" } as unknown as User,
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

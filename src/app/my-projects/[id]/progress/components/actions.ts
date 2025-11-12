"use server";

import { db } from "@/service/firebase";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  increment,
} from "firebase/firestore";

/** Freelancer starts work → 'in_progress' */
export async function markInProgress(projectId: string) {
  if (!projectId) return;
  await updateDoc(doc(db, "projects", projectId), {
    status: "in_progress",
    updatedAt: serverTimestamp(),
  });
}

/** Freelancer submits previews → 'in_review' */
export async function submitForReview(
  projectId: string,
  freelancerId: string,
  previewUrls: string[],
  note: string
) {
  if (!projectId || !freelancerId) return;
  if (previewUrls.length === 0) throw new Error("No preview images uploaded.");

  await addDoc(collection(db, "projects", projectId, "submissions"), {
    freelancerId,
    previewUrls,
    note,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "projects", projectId), {
    status: "in_review",
    updatedAt: serverTimestamp(),
  });
}

/** ✅ Client creates a bilingual change request — deducts 1 quota immediately & freeze review */
export async function createChangeRequest(
  projectId: string,
  clientId: string,
  freelancerId: string,
  reason: { en: string; lo: string },
  remainingQuota: number
) {
  if (!projectId) return;
  if (remainingQuota <= 0) throw new Error("No edit quota remaining.");

  const projectRef = doc(db, "projects", projectId);

  await addDoc(collection(projectRef, "changeRequests"), {
    clientId,
    freelancerId,
    reason,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  await updateDoc(projectRef, {
    editQuota: remainingQuota - 1,
    status: "change_pending",
    updatedAt: serverTimestamp(),
  });
}

/** Freelancer accepts → back to in_progress */
export async function acceptChangeRequest(
  projectId: string,
  requestId: string
) {
  const requestRef = doc(
    db,
    "projects",
    projectId,
    "changeRequests",
    requestId
  );
  await updateDoc(requestRef, {
    status: "accepted",
    acceptedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "projects", projectId), {
    status: "in_progress",
    updatedAt: serverTimestamp(),
  });
}

/** Freelancer rejects → back to in_review (client can approve or retry) */
export async function rejectChangeRequest(
  projectId: string,
  requestId: string,
  reason: string,
  description: string
) {
  const requestRef = doc(
    db,
    "projects",
    projectId,
    "changeRequests",
    requestId
  );
  await updateDoc(requestRef, {
    status: "rejected",
    rejectReason: reason,
    rejectDesc: description,
    rejectedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "projects", projectId), {
    status: "in_review",
    updatedAt: serverTimestamp(),
  });
}

/** ✅ Client approves project → release escrow → create both transactions + update freelancer profile */
export async function markCompleted(projectId: string) {
  if (!projectId) return;

  // Load project
  const projectRef = doc(db, "projects", projectId);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) throw new Error("Project not found.");
  const project = projectSnap.data();

  const clientId = project.clientId;
  const freelancerId = project.acceptedFreelancerId;
  const amount = Number(project.budget) || 0;
  const currency = project.currency || "LAK";

  // 1️⃣ Find escrow
  const escrowQuery = query(
    collection(db, "escrows"),
    where("projectId", "==", projectId),
    where("status", "==", "held")
  );
  const escrowSnap = await getDocs(escrowQuery);

  if (!escrowSnap.empty) {
    const escrowDoc = escrowSnap.docs[0];
    const escrowId = escrowDoc.id;
    await updateDoc(doc(db, "escrows", escrowId), {
      status: "released",
      freelancerId,
      releasedAt: serverTimestamp(),
    });
  } else {
    console.warn("⚠️ No escrow found for project:", projectId);
  }

  // 2️⃣ Locate freelancer profile
  let freelancerProfileRef: any = null;
  let freelancerProfileData: any = null;

  const profileQuery = query(
    collection(db, "profiles"),
    where("userId", "==", freelancerId)
  );
  const profileSnap = await getDocs(profileQuery);

  if (!profileSnap.empty) {
    freelancerProfileRef = doc(db, "profiles", profileSnap.docs[0].id);
    freelancerProfileData = profileSnap.docs[0].data();
  } else {
    // fallback: use document ID as freelancerId
    const directProfileRef = doc(db, "profiles", freelancerId);
    const directProfileSnap = await getDoc(directProfileRef);
    if (directProfileSnap.exists()) {
      freelancerProfileRef = directProfileRef;
      freelancerProfileData = directProfileSnap.data();
    } else {
    }
  }

  // 3️⃣ Calculate balances safely
  let previousBalance = 0;
  let previousProjectsCompleted = 0;

  if (freelancerProfileData) {
    const rawEarned = freelancerProfileData.totalEarned;
    const rawProjects = freelancerProfileData.projectsCompleted;

    previousBalance =
      typeof rawEarned === "string"
        ? parseFloat(rawEarned) || 0
        : typeof rawEarned === "number"
        ? rawEarned
        : 0;

    previousProjectsCompleted =
      typeof rawProjects === "string"
        ? parseFloat(rawProjects) || 0
        : typeof rawProjects === "number"
        ? rawProjects
        : 0;
  }

  const newBalance = previousBalance + amount;
  const newProjects = previousProjectsCompleted + 1;

  // 4️⃣ Create transactions
  await addDoc(collection(db, "transactions"), {
    userId: freelancerId,
    projectId,
    amount,
    currency,
    type: "escrow_release",
    direction: "in",
    previousBalance,
    newBalance,
    description: `Received ${amount} ${currency} from project "${project.title}"`,
    status: "completed",
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, "transactions"), {
    userId: clientId,
    projectId,
    amount,
    currency,
    type: "escrow_payment",
    direction: "out",
    previousBalance: 0,
    newBalance: 0,
    description: `Paid ${amount} ${currency} for project "${project.title}"`,
    status: "completed",
    createdAt: serverTimestamp(),
  });

  // 5️⃣ Update freelancer profile (totalEarned + projectsCompleted)
  if (freelancerProfileRef) {
    const updates: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    // Handle totalEarned
    if (typeof freelancerProfileData.totalEarned === "string") {
      updates.totalEarned = newBalance;
    } else {
      updates.totalEarned = increment(amount);
    }

    // Handle projectsCompleted
    if (typeof freelancerProfileData.projectsCompleted === "string") {
      updates.projectsCompleted = newProjects;
    } else {
      updates.projectsCompleted = increment(1);
    }

    await updateDoc(freelancerProfileRef, updates);
  }

  // 6️⃣ Mark project as completed
  await updateDoc(projectRef, {
    status: "completed",
    updatedAt: serverTimestamp(),
  });
}

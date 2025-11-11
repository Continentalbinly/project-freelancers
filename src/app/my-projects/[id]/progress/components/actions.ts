"use server";

import { db } from "@/service/firebase";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
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

  // 1️⃣ Add the change request
  await addDoc(collection(projectRef, "changeRequests"), {
    clientId,
    freelancerId,
    reason,
    status: "pending", // waiting for freelancer decision
    createdAt: serverTimestamp(),
  });

  // 2️⃣ Deduct quota & mark project as 'change_pending'
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

/** Client approves project → 'completed' */
export async function markCompleted(projectId: string) {
  if (!projectId) return;
  await updateDoc(doc(db, "projects", projectId), {
    status: "completed",
    updatedAt: serverTimestamp(),
  });
}

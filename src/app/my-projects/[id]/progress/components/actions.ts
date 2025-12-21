"use server";

import { requireDb } from "@/service/firebase";
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
  const firestore = requireDb();
  await updateDoc(doc(firestore, "projects", projectId), {
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
  const firestore = requireDb();

  await addDoc(collection(firestore, "projects", projectId, "submissions"), {
    freelancerId,
    previewUrls,
    note,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(firestore, "projects", projectId), {
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
  const firestore = requireDb();

  const projectRef = doc(firestore, "projects", projectId);

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
  const firestore = requireDb();
  const requestRef = doc(
    firestore,
    "projects",
    projectId,
    "changeRequests",
    requestId
  );
  await updateDoc(requestRef, {
    status: "accepted",
    acceptedAt: serverTimestamp(),
  });

  await updateDoc(doc(firestore, "projects", projectId), {
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
  const firestore = requireDb();
  const requestRef = doc(
    firestore,
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

  await updateDoc(doc(firestore, "projects", projectId), {
    status: "in_review",
    updatedAt: serverTimestamp(),
  });
}

/** Client approves → create transaction + move to payout step */
export async function markCompleted(projectId: string) {
  if (!projectId) return;
  const firestore = requireDb();

  const projectRef = doc(firestore, "projects", projectId);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) throw new Error("Project not found.");

  const project = projectSnap.data();

  // 1️⃣ Call your existing payment create API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/create`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: project.payoutAmount ?? project.budget ?? 0,
        description: `Project payout for ${project.title}`,
        tag1: project.clientId,
        tag2: "project_payout",
        tag3: projectId,
      }),
    }
  );

  const data = await res.json();
  if (!data.success) throw new Error(data.error || "QR creation failed");

  const txId = data.transactionId;

  // 2️⃣ Save transactionId inside project
  await updateDoc(projectRef, {
    status: "payout_project",
    transactionId: txId,
    updatedAt: serverTimestamp(),
  });
}

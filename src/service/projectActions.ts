import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/service/firebase";

/**
 * 🔹 Mark project as completed by freelancer
 */
export async function markFreelancerCompleted(
  projectId: string,
  notes: string
) {
  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, {
    freelancerCompleted: {
      completedAt: serverTimestamp(),
      completionNotes: notes || "",
    },
    updatedAt: serverTimestamp(),
  });
}

/**
 * 🔹 Mark project as completed by client
 * If freelancer already marked as done → release funds
 */
export async function markClientCompleted(
  projectId: string,
  clientId: string,
  notes: string
) {
  const projectRef = doc(db, "projects", projectId);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) throw new Error("Project not found");

  const project = projectSnap.data();
  const budget = Number(project.budget);
  const freelancerId = project.acceptedFreelancerId;

  // Update client completion
  await updateDoc(projectRef, {
    clientCompleted: {
      completedAt: serverTimestamp(),
      completionNotes: notes || "",
    },
    updatedAt: serverTimestamp(),
  });

  // ✅ If both confirmed → release funds
  if (project.freelancerCompleted) {
    await releaseFundsToFreelancer(projectId, clientId, freelancerId, budget);
  }
}

/**
 * 🔹 Release funds from escrow to freelancer (when both confirmed)
 */
async function releaseFundsToFreelancer(
  projectId: string,
  clientId: string,
  freelancerId: string,
  budget: number
) {
  if (!freelancerId) return;

  const freelancerRef = doc(db, "profiles", freelancerId);
  const clientRef = doc(db, "profiles", clientId);

  const freelancerSnap = await getDoc(freelancerRef);
  const clientSnap = await getDoc(clientRef);
  if (!freelancerSnap.exists() || !clientSnap.exists()) return;

  const freelancerData = freelancerSnap.data();
  const currentTotalEarn = freelancerData.totalEarn ?? 0;

  // 🧾 Update freelancer totalEarn
  await updateDoc(freelancerRef, {
    totalEarn: currentTotalEarn + budget,
    updatedAt: serverTimestamp(),
  });

  // 💼 Mark project as completed
  await updateDoc(doc(db, "projects", projectId), {
    status: "completed",
    completedAt: serverTimestamp(),
  });

  // 🔏 Update escrow record
  const escrowRef = collection(db, "escrows");
  const escrowSnap = await getDoc(doc(escrowRef, projectId)).catch((): null => null);
  if (escrowSnap?.exists()) {
    await updateDoc(doc(escrowRef, projectId), {
      status: "released",
      releasedAt: serverTimestamp(),
    });
  }

  // 🧾 Create transaction for freelancer
  await addDoc(collection(db, "transactions"), {
    userId: freelancerId,
    projectId,
    type: "project_completed",
    direction: "in",
    status: "completed",
    amount: budget,
    currency: "LAK",
    description: `Project funds released to freelancer.`,
    createdAt: serverTimestamp(),
  });
}

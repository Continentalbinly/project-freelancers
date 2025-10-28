import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/service/firebase";

/**
 * User requests top-up or subscription (pending approval)
 */
export async function requestTransaction(
  userId: string,
  type: "topup" | "subscription",
  amount: number,
  plan?: string
) {
  const transactionsRef = collection(db, "transactions");
  const newDoc = await addDoc(transactionsRef, {
    userId,
    type,
    amount,
    plan: plan || null,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return newDoc.id;
}

/**
 * Admin confirms the transaction (manual approval)
 */
export async function approveTransaction(
  transactionId: string,
  adminId: string
) {
  const transactionRef = doc(db, "transactions", transactionId);
  await updateDoc(transactionRef, {
    status: "approved",
    approvedBy: adminId,
    approvedAt: serverTimestamp(),
  });
}

/**
 * Add user credit manually (when admin approves)
 */
export async function addUserCredit(userId: string, amount: number) {
  const profileRef = doc(db, "profiles", userId);
  await updateDoc(profileRef, {
    credit: increment(amount),
    updatedAt: serverTimestamp(),
  });
}

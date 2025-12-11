// components/PostingFeeHandler.ts
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { CATEGORY_POSTING_FEE } from "../../../create/postingFeeConfig";

interface FeePreviewParams {
  oldPostingFee: number;
  newCategoryId: string;
}

interface FeeApplyParams {
  userId: string;
  projectId: string;
  oldPostingFee: number;
  newCategoryId: string;
}

// --------------------------------------------------
// 1) PREVIEW — no deduction here
// --------------------------------------------------
export function getPostingFeePreview({
  oldPostingFee,
  newCategoryId,
}: FeePreviewParams) {
  const newPostingFee =
    CATEGORY_POSTING_FEE[newCategoryId] ?? oldPostingFee ?? 0;

  const diff = newPostingFee - oldPostingFee;

  return {
    oldPostingFee,
    newPostingFee,
    diff,
  };
}

// --------------------------------------------------
// 2) APPLY DEDUCTION — modal confirm before calling this
// --------------------------------------------------
export async function applyPostingFeeChange({
  userId,
  projectId,
  oldPostingFee,
  newCategoryId,
}: FeeApplyParams) {
  const newPostingFee =
    CATEGORY_POSTING_FEE[newCategoryId] ?? oldPostingFee ?? 0;

  const diff = newPostingFee - oldPostingFee;

  if (diff === 0) {
    return { success: true, newPostingFee };
  }

  const userRef = doc(db, "profiles", userId);
  const snap = await getDoc(userRef);
  const data = snap.data() || {};
  const oldCredit = data.credit ?? 0;
  let newCredit = oldCredit;

  // Deduct
  if (diff > 0) {
    if (oldCredit < diff) {
      return { success: false, reason: "NOT_ENOUGH_CREDITS" };
    }

    newCredit -= diff;

    await addDoc(collection(db, "transactions"), {
      userId,
      projectId,
      type: "posting_fee_adjust",
      direction: "out",
      amount: diff,
      previousBalance: oldCredit,
      newBalance: newCredit,
      description: `Posting fee increased: ${oldPostingFee} → ${newPostingFee}. Deducted -${diff} credits.`,
      createdAt: serverTimestamp(),
      status: "completed",
    });
  }

  // Refund
  if (diff < 0) {
    const refund = Math.abs(diff);
    newCredit += refund;

    await addDoc(collection(db, "transactions"), {
      userId,
      projectId,
      type: "posting_fee_adjust",
      direction: "in",
      amount: refund,
      previousBalance: oldCredit,
      newBalance: newCredit,
      description: `Posting fee decreased: ${oldPostingFee} → ${newPostingFee}. Refunded +${refund} credits.`,
      createdAt: serverTimestamp(),
      status: "completed",
    });
  }

  await updateDoc(userRef, {
    credit: newCredit,
    updatedAt: serverTimestamp(),
  });

  return { success: true, newPostingFee };
}

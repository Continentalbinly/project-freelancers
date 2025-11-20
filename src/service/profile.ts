import { db } from "@/service/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Fetches the Firestore profile for a given userId (uid)
 */
export async function getUserProfile(userId: string) {
  try {
    const ref = doc(db, "profiles", userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    } else {
      return null;
    }
  } catch (err) {
    //console.error("❌ getUserProfile failed:", err);
    return null;
  }
}

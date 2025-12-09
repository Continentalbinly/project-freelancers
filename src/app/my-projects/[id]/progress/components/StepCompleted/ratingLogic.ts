"use client";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { toast } from "react-toastify";

export async function submitRating({
  form,
  project,
  isClient,
}: any): Promise<boolean> {
  try {
    const ratedUser = isClient
      ? project.acceptedFreelancerId
      : project.clientId;

    const avg =
      (form.communication + form.quality + form.timeliness + form.value) / 4;

    /** 1️⃣ Save rating document */
    await addDoc(collection(db, "ratings"), {
      projectId: project.id,
      raterId: isClient ? project.clientId : project.acceptedFreelancerId,
      raterType: isClient ? "client" : "freelancer",
      ratedUserId: ratedUser,
      ...form,
      rating: avg,
      createdAt: serverTimestamp(),
    });

    /** 2️⃣ Mark project as rated */
    await updateDoc(doc(db, "projects", project.id), {
      ...(isClient && { clientRated: true }),
      ...(!isClient && { freelancerRated: true }),
    });

    /** 3️⃣ Update rated user's profile stats */
    const profileRef = doc(db, "profiles", ratedUser);
    const snap = await getDoc(profileRef);

    if (snap.exists()) {
      const d = snap.data();
      const previous = Number(d.totalRatings || 0);
      const total = previous + 1;

      const calc = (old: number, newVal: number) =>
        previous === 0 ? newVal : (old * previous + newVal) / total;

      await updateDoc(profileRef, {
        totalRatings: total,
        communicationRating: calc(
          d.communicationRating || 0,
          form.communication
        ),
        qualityRating: calc(d.qualityRating || 0, form.quality),
        timelinessRating: calc(d.timelinessRating || 0, form.timeliness),
        valueRating: calc(d.valueRating || 0, form.value),
        rating: calc(d.rating || 0, avg),
        updatedAt: serverTimestamp(),
      });
    }

    toast.success("⭐ Rating submitted!");
    return true; // ✔ IMPORTANT
  } catch (err) {
    toast.error("❌ Failed to submit rating.");
    console.error(err);
    return false; // ✔ IMPORTANT
  }
}

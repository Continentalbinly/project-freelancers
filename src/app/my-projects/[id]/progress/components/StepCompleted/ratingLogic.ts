"use client";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { toast } from "react-toastify";
import type { Project } from "@/types/project";

interface RatingForm {
  communication: number;
  quality: number;
  timeliness: number;
  value: number;
  review?: string;
}

interface SubmitRatingParams {
  form: RatingForm;
  project: Project;
  isClient: boolean;
}

export async function submitRating({
  form,
  project,
  isClient,
}: SubmitRatingParams): Promise<boolean> {
  try {
    const ratedUser = isClient
      ? project.acceptedFreelancerId
      : project.clientId;

    if (!ratedUser) {
      toast.error("❌ Cannot rate: user not found.");
      return false;
    }

    const avg =
      (form.communication + form.quality + form.timeliness + form.value) / 4;
    const firestore = requireDb();

    /** 1️⃣ Save rating document */
    await addDoc(collection(firestore, "ratings"), {
      projectId: project.id,
      raterId: isClient ? project.clientId : project.acceptedFreelancerId,
      raterType: isClient ? "client" : "freelancer",
      ratedUserId: ratedUser,
      ...form,
      rating: avg,
      createdAt: serverTimestamp(),
    });

    /** 2️⃣ Mark project as rated */
    await updateDoc(doc(firestore, "projects", project.id), {
      ...(isClient && { clientRated: true }),
      ...(!isClient && { freelancerRated: true }),
    });

    /** 3️⃣ Update rated user's profile stats */
    const profileRef = doc(firestore, "profiles", ratedUser);
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
  } catch  {
    toast.error("❌ Failed to submit rating.");
    
    return false; // ✔ IMPORTANT
  }
}

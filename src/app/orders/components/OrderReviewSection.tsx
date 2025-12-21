"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { doc, getDoc, addDoc, collection, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { toast } from "react-toastify";
import type { Order } from "@/types/order";

interface OrderReviewSectionProps {
  order: Order;
  userRole: "client" | "freelancer";
  userId: string;
  onReviewSubmitted: () => void;
}

export default function OrderReviewSection({
  order,
  userRole,
  userId,
  onReviewSubmitted,
}: OrderReviewSectionProps) {
  const { t } = useTranslationContext();
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    communication: 5,
    quality: 5,
    timeliness: 5,
    value: 5,
    review: "",
  });

  // Check if user has already rated
  useEffect(() => {
    const checkRating = async () => {
      try {
        // Check order flags first (faster)
        const alreadyRated = userRole === "client" 
          ? order.clientRated === true 
          : order.freelancerRated === true;
        
        if (alreadyRated) {
          setHasRated(true);
          setLoading(false);
          return;
        }

        // Also check ratings collection for safety
        const db = requireDb();
        const q = query(
          collection(db, "ratings"),
          where("orderId", "==", order.id),
          where("raterId", "==", userId)
        );
        const snap = await getDocs(q);
        setHasRated(!snap.empty);
      } catch (error) {
        console.error("Error checking rating:", error);
      } finally {
        setLoading(false);
      }
    };

    if (order.status === "completed") {
      checkRating();
    }
  }, [order.id, order.status, order.clientRated, order.freelancerRated, userId, userRole]);

  // Only show if order is completed and user hasn't rated yet
  if (order.status !== "completed" || hasRated || loading) {
    return null;
  }

  const ratedUserId = userRole === "client" ? order.sellerId : order.buyerId;
  const ratedUserName = userRole === "client" 
    ? t("orderReview.rateFreelancer") || "Rate the Freelancer"
    : t("orderReview.rateClient") || "Rate the Client";

  const fields = [
    { key: "communication", label: t("rating.communication") || "Communication" },
    { key: "quality", label: t("rating.quality") || "Quality" },
    { key: "timeliness", label: t("rating.timeliness") || "Timeliness" },
    { key: "value", label: t("rating.value") || "Value for Money" },
  ];

  const renderStars = (field: string) => {
    const fieldValue = form[field as keyof typeof form];
    const numValue = typeof fieldValue === 'number' ? fieldValue : 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            onClick={() => setForm((prev) => ({ ...prev, [field]: n }))}
            className={`w-6 h-6 cursor-pointer transition ${
              n <= numValue
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!form.communication || !form.quality || !form.timeliness || !form.value) {
      toast.warning(t("rating.pleaseSelectStars") || "Please rate all categories!");
      return;
    }

    if (!ratedUserId) {
      toast.error(t("common.error") || "Error: Cannot find user to rate");
      return;
    }

    setSubmitting(true);
    try {
      const db = requireDb();
      const avg = (form.communication + form.quality + form.timeliness + form.value) / 4;

      // 1. Save rating document
      await addDoc(collection(db, "ratings"), {
        orderId: order.id,
        raterId: userId,
        raterType: userRole,
        ratedUserId: ratedUserId,
        rating: avg,
        communication: form.communication,
        quality: form.quality,
        timeliness: form.timeliness,
        value: form.value,
        review: form.review,
        createdAt: serverTimestamp(),
      });

      // 2. Mark order as rated
      await updateDoc(doc(db, "orders", order.id), {
        ...(userRole === "client" && { clientRated: true }),
        ...(userRole === "freelancer" && { freelancerRated: true }),
        updatedAt: serverTimestamp(),
      });

      // 3. Update rated user's profile stats
      const profileRef = doc(db, "profiles", ratedUserId);
      const snap = await getDoc(profileRef);

      if (snap.exists()) {
        const data = snap.data();
        const previous = Number(data.totalRatings || 0);
        const total = previous + 1;

        const calc = (old: number, newVal: number) =>
          previous === 0 ? newVal : (old * previous + newVal) / total;

        await updateDoc(profileRef, {
          totalRatings: total,
          communicationRating: calc(data.communicationRating || 0, form.communication),
          qualityRating: calc(data.qualityRating || 0, form.quality),
          timelinessRating: calc(data.timelinessRating || 0, form.timeliness),
          valueRating: calc(data.valueRating || 0, form.value),
          rating: calc(data.rating || 0, avg),
          updatedAt: serverTimestamp(),
        });
      }

      toast.success(t("orderReview.ratingSubmitted") || "⭐ Rating submitted successfully!");
      setHasRated(true);
      onReviewSubmitted();
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast.error(error.message || t("common.error") || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-background-secondary p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <h2 className="text-lg font-semibold text-text-primary">
          {ratedUserName}
        </h2>
      </div>
      <p className="text-sm text-text-secondary">
        {t("orderReview.rateDescription") || "Please rate your experience with this order"}
      </p>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="flex justify-between items-center">
            <span className="text-sm font-medium text-text-primary">{field.label}</span>
            {renderStars(field.key)}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t("rating.writeReview") || "Write a Review (Optional)"}
        </label>
        <textarea
          className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
          rows={4}
          placeholder={t("orderReview.reviewPlaceholder") || "Share your experience with this order..."}
          value={form.review}
          onChange={(e) => setForm((prev) => ({ ...prev, review: e.target.value }))}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting
          ? t("common.submitting") || "Submitting..."
          : t("orderReview.submitRating") || "Submit Rating"}
      </button>
    </div>
  );
}


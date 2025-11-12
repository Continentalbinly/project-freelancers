"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { Download, CheckCircle, Star } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function StepCompleted({ project }: { project: any }) {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const isClient = user?.uid === project.clientId;
  const isFreelancer = user?.uid === project.acceptedFreelancerId;

  const [files, setFiles] = useState<any[]>([]);
  const [hasRated, setHasRated] = useState(false);
  const [form, setForm] = useState({
    communication: 5,
    quality: 5,
    timeliness: 5,
    value: 5,
    review: "",
  });
  const [submitting, setSubmitting] = useState(false);

  /** ✅ Fetch files */
  useEffect(() => {
    const fetchFiles = async () => {
      const q = query(
        collection(db, "projects", project.id, "finalDeliverables"),
        orderBy("uploadedAt", "desc")
      );
      const snap = await getDocs(q);
      setFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchFiles();
  }, [project.id]);

  /** ✅ Check if already rated */
  useEffect(() => {
    const checkRating = async () => {
      if (!user?.uid) return;
      const q = query(
        collection(db, "ratings"),
        where("projectId", "==", project.id),
        where("raterId", "==", user.uid)
      );
      const snap = await getDocs(q);
      setHasRated(!snap.empty);
    };
    checkRating();
  }, [project.id, user?.uid]);

  /** ⭐ Handle Rating Submit */
  const handleSubmitRating = async () => {
    if (hasRated || !user?.uid) return;
    setSubmitting(true);

    try {
      const raterType = isClient ? "client" : "freelancer";
      const ratedUserId = isClient
        ? project.acceptedFreelancerId
        : project.clientId;

      const rating =
        (form.communication + form.quality + form.timeliness + form.value) / 4;

      // 1️⃣ Add rating doc
      await addDoc(collection(db, "ratings"), {
        projectId: project.id,
        raterId: user.uid,
        raterType,
        ratedUserId,
        ...form,
        rating,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2️⃣ Update profile safely
      const profileRef = doc(db, "profiles", ratedUserId);
      const snap = await getDoc(profileRef);

      if (snap.exists()) {
        const data = snap.data();
        const getNum = (v: unknown): number => {
          const n = typeof v === "string" ? parseFloat(v) : Number(v);
          return isNaN(n) ? 0 : n;
        };

        const prevRatings = getNum(data.totalRatings);
        const totalRatings = prevRatings + 1;

        const newAvg = (prev: unknown, field: keyof typeof form) => {
          const prevNum = getNum(prev);
          const newVal = getNum(form[field]);
          return (prevNum * prevRatings + newVal) / totalRatings;
        };

        await updateDoc(profileRef, {
          totalRatings,
          communicationRating: newAvg(
            data.communicationRating,
            "communication"
          ),
          qualityRating: newAvg(data.qualityRating, "quality"),
          timelinessRating: newAvg(data.timelinessRating, "timeliness"),
          valueRating: newAvg(data.valueRating, "value"),
          rating: newAvg(data.rating, "value"),
          updatedAt: serverTimestamp(),
        });
      }

      setHasRated(true);
      alert("✅ Thank you! Your rating has been submitted.");
    } catch (err) {
      alert("❌ Failed to submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /** ⭐ Render stars */
  const renderStars = (field: keyof typeof form) => (
    <div className="flex justify-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          onClick={() => setForm((p) => ({ ...p, [field]: n }))}
          className={`w-6 h-6 cursor-pointer transition-all ${
            n <= Number(form[field])
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  /** 🎨 Label colors for different rating fields */
  const getLabelColor = (field: string) => {
    switch (field) {
      case "communication":
        return "text-blue-600";
      case "quality":
        return "text-green-600";
      case "timeliness":
        return "text-purple-600";
      case "value":
        return "text-orange-500";
      default:
        return "text-gray-700";
    }
  };

  /** ⭐ Responsive rating row */
  const renderRatingRow = (field: keyof typeof form) => (
    <div
      key={field}
      className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 text-center"
    >
      <p
        className={`capitalize text-sm sm:w-32 sm:text-left ${getLabelColor(
          field
        )}`}
      >
        {t(`rating.${field}`) || field}
      </p>
      <div className="flex justify-center">{renderStars(field)}</div>
    </div>
  );

  /** === FREELANCER VIEW === */
  if (isFreelancer) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-2">
          {t("myProjects.stepper.step4.title") || "Project Completed!"}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mb-6">
          {t("myProjects.stepper.step4.descFreelancer") ||
            "Your project is completed and files have been delivered successfully."}
        </p>

        {!hasRated ? (
          <div className="bg-white border border-border rounded-xl p-6 max-w-md mx-auto text-left shadow-sm">
            <h3 className="font-semibold mb-4 text-gray-800 text-center">
              {t("myProjects.stepper.rateClient") || "Rate your client"}
            </h3>
            {["communication", "quality", "timeliness", "value"].map((field) =>
              renderRatingRow(field as keyof typeof form)
            )}
            <textarea
              className="w-full border border-border shadow-sm rounded-lg p-2 mt-2 text-sm"
              placeholder={t("common.placeholderRatingReview")}
              value={form.review}
              onChange={(e) => setForm({ ...form, review: e.target.value })}
            />
            <button
              onClick={handleSubmitRating}
              disabled={submitting}
              className="w-full cursor-pointer mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
            >
              {submitting ? t("common.submiting") : t("common.submit")}
            </button>
          </div>
        ) : (
          <p className="text-green-600 font-medium">
            {t("rating.alreadySubmitted") ||
              "You have already rated this client."}
          </p>
        )}

        <div className="mt-8 flex justify-center">
          <Image
            src="/images/assets/completion.png"
            alt="Project Completed"
            width={160}
            height={160}
            className="opacity-80"
          />
        </div>
      </div>
    );
  }

  /** === CLIENT VIEW === */
  if (isClient) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-2">
          {t("myProjects.stepper.finalDelivery.title") ||
            "Final Delivery & Review"}
        </h2>
        <p className="text-gray-500 mb-6">
          {t("myProjects.stepper.finalDelivery.descClient") ||
            "Your project is completed. You can download the final deliverables below and rate your freelancer."}
        </p>

        {files.length > 0 ? (
          <div className="flex flex-col items-center gap-3 mb-6">
            {files.map((file) => (
              <a
                key={file.id}
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 text-blue-600 font-medium"
              >
                <Download className="w-4 h-4" />
                {file.fileName}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">
            {t("myProjects.stepper.finalDelivery.noFiles") ||
              "No files available for download."}
          </p>
        )}

        {!hasRated ? (
          <div className="bg-white border border-border rounded-xl p-6 max-w-md mx-auto text-left shadow-sm">
            <h3 className="font-semibold mb-4 text-gray-800 text-center">
              {t("myProjects.stepper.rateFreelancer") || "Rate your freelancer"}
            </h3>
            {["communication", "quality", "timeliness", "value"].map((field) =>
              renderRatingRow(field as keyof typeof form)
            )}
            <textarea
              className="w-full border border-border shadow-sm rounded-lg p-2 mt-2 text-sm"
              placeholder={t("common.placeholderRatingReview")}
              value={form.review}
              onChange={(e) => setForm({ ...form, review: e.target.value })}
            />
            <button
              onClick={handleSubmitRating}
              disabled={submitting}
              className="w-full mt-4 cursor-pointer bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
            >
              {submitting ? t("common.submiting") : t("common.submit")}
            </button>
          </div>
        ) : (
          <p className="text-green-600 font-medium">
            {t("rating.alreadySubmitted") ||
              "You have already rated this freelancer."}
          </p>
        )}

        <div className="mt-6 flex justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
      </div>
    );
  }

  return null;
}

"use client";

import { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { convertTimestampToDate } from "@/service/timeUtils";
import { useAuth } from "@/contexts/AuthContext";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  HandThumbUpIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

export default function CompletionStatus({ project, t, formatDate }: any) {
  const { user } = useAuth();
  if (!user) return null;

  // 🔹 Local states
  const [updating, setUpdating] = useState(false);
  const [showModal, setShowModal] = useState<"freelancer" | "client" | null>(
    null
  );
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  // ⭐ Individual rating categories
  const [communication, setCommunication] = useState(0);
  const [quality, setQuality] = useState(0);
  const [timeliness, setTimeliness] = useState(0);
  const [value, setValue] = useState(0);
  const [review, setReview] = useState("");

  const [localProject, setLocalProject] = useState(project);

  const clientData = localProject.clientCompleted || {};
  const freelancerData = localProject.freelancerCompleted || {};

  const clientDone =
    !!clientData.completedAt && !!clientData.userId && !!clientData.userType;
  const freelancerDone =
    !!freelancerData.completedAt &&
    !!freelancerData.userId &&
    !!freelancerData.userType;

  const isClient = user?.uid === localProject.clientId;
  const isFreelancer = user?.uid === localProject.acceptedFreelancerId;

  // 🟢 Check if user has already rated this project
  useEffect(() => {
    const checkIfRated = async () => {
      if (!user || !localProject?.id) return;
      const q = query(
        collection(db, "ratings"),
        where("projectId", "==", localProject.id),
        where("raterId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      setAlreadyRated(!snapshot.empty);
    };
    checkIfRated();
  }, [user, localProject.id]);

  // 🧾 Status label
  const getStatus = () => {
    if (clientDone && freelancerDone)
      return {
        label: t("projectDetail.projectCompleted"),
        color: "bg-success-light text-success",
        desc: t("projectDetail.projectCompletedDesc"),
      };
    if (freelancerDone)
      return {
        label: t("projectDetail.projectInReview"),
        color: "bg-warning-light text-warning",
        desc: t("projectDetail.projectInReviewDesc"),
      };
    return {
      label: t("projectDetail.noCompletionYet"),
      color: "bg-background-secondary text-text-secondary",
      desc: t("projectDetail.noCompletionYetDesc"),
    };
  };
  const status = getStatus();

  // ✅ Freelancer confirm
  const handleFreelancerConfirm = async () => {
    if (!isFreelancer) return;
    try {
      setUpdating(true);
      const ref = doc(db, "projects", localProject.id);
      const data = {
        freelancerCompleted: {
          userId: user.uid,
          userType: "freelancer",
          completedAt: serverTimestamp(),
        },
        status: "in_review",
        updatedAt: serverTimestamp(),
      };
      await updateDoc(ref, data);
      setLocalProject((prev: any) => ({
        ...prev,
        status: "in_review",
        freelancerCompleted: {
          ...data.freelancerCompleted,
          completedAt: new Date(),
        },
      }));
    } catch (e) {
      //console.error("❌ Freelancer confirm error:", e);
    } finally {
      setUpdating(false);
      setShowModal(null);
    }
  };

  // ✅ Client confirm (and pay freelancer)
  const handleClientConfirm = async () => {
    if (!isClient || !freelancerDone) return;
    try {
      setUpdating(true);
      const projectRef = doc(db, "projects", localProject.id);
      const freelancerId = localProject.acceptedFreelancerId;
      const clientId = localProject.clientId;
      const projectBudget = Number(localProject.budget || 0);

      const data = {
        clientCompleted: {
          userId: user.uid,
          userType: "client",
          completedAt: serverTimestamp(),
        },
        status: "completed",
        updatedAt: serverTimestamp(),
      };
      await updateDoc(projectRef, data);

      // 🔹 Update freelancer totalEarned + projectsCompleted
      if (freelancerId && projectBudget > 0) {
        const freelancerRef = doc(db, "profiles", freelancerId);
        const snap = await getDoc(freelancerRef);
        if (snap.exists()) {
          const freelancerData = snap.data();
          const newTotalEarned =
            (freelancerData.totalEarned || 0) + projectBudget;

          await updateDoc(freelancerRef, {
            totalEarned: newTotalEarned,
            projectsCompleted: (freelancerData.projectsCompleted || 0) + 1,
            updatedAt: serverTimestamp(),
          });
        }
      }

      // 🔹 Update client’s projectsCompleted count as well
      if (clientId) {
        const clientRef = doc(db, "profiles", clientId);
        const snap = await getDoc(clientRef);
        if (snap.exists()) {
          const clientData = snap.data();
          await updateDoc(clientRef, {
            projectsCompleted: (clientData.projectsCompleted || 0) + 1,
            updatedAt: serverTimestamp(),
          });
        }
      }

      setLocalProject((prev: any) => ({
        ...prev,
        status: "completed",
        clientCompleted: { ...data.clientCompleted, completedAt: new Date() },
      }));
    } catch (e) {
      //console.error("❌ Client confirm error:", e);
    } finally {
      setUpdating(false);
      setShowModal(null);
    }
  };

  // ⭐ Submit rating — localized
  const handleSubmitRating = async () => {
    if (!communication || !quality || !timeliness || !value) {
      toast.warn(
        t("rating.pleaseSelectStars") || "Please rate all categories!",
        {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
      return;
    }

    const overallRating = (
      (communication + quality + timeliness + value) /
      4
    ).toFixed(1);

    try {
      setRatingLoading(true);
      const ratedUserId = isClient
        ? localProject.acceptedFreelancerId
        : localProject.clientId;
      const raterType = isClient ? "client" : "freelancer";

      // ✅ Add rating record
      await addDoc(collection(db, "ratings"), {
        projectId: localProject.id,
        raterId: user.uid,
        raterType,
        ratedUserId,
        rating: Number(overallRating),
        communication,
        quality,
        timeliness,
        value,
        review,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // ✅ Update target profile average
      const targetRef = doc(db, "profiles", ratedUserId);
      const targetSnap = await getDoc(targetRef);
      if (targetSnap.exists()) {
        const data = targetSnap.data();
        const totalRatings = (data.totalRatings || 0) + 1;
        const oldAverage = data.rating || 0;
        const newAverage =
          (oldAverage * (totalRatings - 1) + Number(overallRating)) /
          totalRatings;

        await updateDoc(targetRef, {
          totalRatings,
          rating: newAverage,
          updatedAt: serverTimestamp(),
        });
      }

      setAlreadyRated(true);
      setShowRatingModal(false);
      toast.success(t("rating.thankYou"), {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (err) {
      toast.error("Failed to submit rating.", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setRatingLoading(false);
    }
  };

  // ⭐ Star selector reusable component
  const RatingSelector = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
  }) => (
    <div className="mb-3">
      <p className="text-sm font-medium text-text-primary mb-1">{label}</p>
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-6 h-6 cursor-pointer transition ${
              star <= value ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {t("projectDetail.completionStatus")}
      </h3>

      {/* STATUS */}
      <div className={`p-4 rounded-lg ${status.color}`}>
        <span className="text-sm font-medium">{status.label}</span>
        <p className="text-sm mt-1">{status.desc}</p>
      </div>

      {/* ⭐ Show rate button after both done */}
      {clientDone && freelancerDone && !alreadyRated && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowRatingModal(true)}
            className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium shadow-sm transition"
          >
            <StarIcon className="w-4 h-4 inline-block mr-1" />
            {isClient ? t("rating.rateFreelancer") : t("rating.rateClient")}
          </button>
        </div>
      )}

      {/* ⭐ Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-[90%] text-center shadow-xl">
            <h4 className="text-lg font-semibold text-text-primary mb-3">
              {isClient ? t("rating.rateFreelancer") : t("rating.rateClient")}
            </h4>
            <p className="text-sm text-text-secondary mb-4">
              {t("rating.subtitle")}
            </p>

            <RatingSelector
              label={t("rating.communication") || "Communication"}
              value={communication}
              onChange={setCommunication}
            />
            <RatingSelector
              label={t("rating.quality") || "Quality of Work"}
              value={quality}
              onChange={setQuality}
            />
            <RatingSelector
              label={t("rating.timeliness") || "Timeliness"}
              value={timeliness}
              onChange={setTimeliness}
            />
            <RatingSelector
              label={t("rating.value") || "Value for Money"}
              value={value}
              onChange={setValue}
            />

            <textarea
              placeholder={t("rating.placeholder")}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full border border-border rounded-md p-2 text-sm mb-4 focus:ring-2 focus:ring-primary"
            />

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2.5 text-sm border border-border rounded-md"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={ratingLoading}
                className="px-4 py-2.5 text-sm rounded-md bg-yellow-500 text-white font-semibold hover:bg-yellow-600 shadow-sm"
              >
                {ratingLoading ? t("common.processing") : t("rating.submit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FREELANCER SECTION */}
      <div
        className={`mt-4 p-3 rounded-lg border ${
          freelancerDone
            ? "border-primary bg-primary-light"
            : "border-border bg-background"
        }`}
      >
        <div className="flex justify-between mb-2">
          <span
            className={`text-sm font-medium ${
              freelancerDone ? "text-primary" : "text-text-secondary"
            }`}
          >
            {t("projectDetail.freelancerCompleted")}
          </span>
          {freelancerDone && freelancerData.completedAt && (
            <span className="text-xs text-primary">
              {formatDate(convertTimestampToDate(freelancerData.completedAt))}
            </span>
          )}
        </div>
        {!freelancerDone && isFreelancer && (
          <button
            onClick={() => setShowModal("freelancer")}
            disabled={updating}
            className="w-full py-2.5 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-dark transition-all shadow-sm"
          >
            <CheckCircleIcon className="w-4 h-4 inline-block mr-1" />
            {t("projectDetail.markAsCompleted")}
          </button>
        )}
      </div>

      {/* CLIENT SECTION */}
      <div
        className={`mt-4 p-3 rounded-lg border ${
          clientDone
            ? "border-success bg-success-light"
            : "border-border bg-background"
        }`}
      >
        <div className="flex justify-between mb-2">
          <span
            className={`text-sm font-medium ${
              clientDone ? "text-success" : "text-text-secondary"
            }`}
          >
            {t("projectDetail.clientCompleted")}
          </span>
          {clientDone && clientData.completedAt && (
            <span className="text-xs text-success">
              {formatDate(convertTimestampToDate(clientData.completedAt))}
            </span>
          )}
        </div>

        {!clientDone && isClient && freelancerDone && (
          <button
            onClick={() => setShowModal("client")}
            disabled={updating}
            className="w-full py-2.5 text-sm font-semibold rounded-md bg-success text-white hover:bg-success-dark transition-all shadow-sm"
          >
            <HandThumbUpIcon className="w-4 h-4 inline-block mr-1" />
            {t("projectDetail.confirmCompletion")}
          </button>
        )}
      </div>

      {/* ⚠️ Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-[90%] text-center shadow-xl">
            <ExclamationTriangleIcon
              className={`w-10 h-10 mx-auto mb-3 ${
                showModal === "freelancer" ? "text-primary" : "text-success"
              }`}
            />
            <h4 className="text-lg font-semibold text-text-primary mb-2">
              {showModal === "freelancer"
                ? t("projectDetail.confirmFreelancerTitle")
                : t("projectDetail.confirmClientTitle")}
            </h4>
            <p className="text-sm text-text-secondary mb-6">
              {showModal === "freelancer"
                ? t("projectDetail.confirmFreelancerDesc")
                : t("projectDetail.confirmClientDesc")}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowModal(null)}
                className="px-4 py-2.5 text-sm border border-border rounded-md"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={
                  showModal === "freelancer"
                    ? handleFreelancerConfirm
                    : handleClientConfirm
                }
                disabled={updating}
                className={`px-4 py-2.5 text-sm rounded-md text-white font-semibold shadow-sm ${
                  showModal === "freelancer"
                    ? "bg-primary hover:bg-primary-dark"
                    : "bg-success hover:bg-success-dark"
                }`}
              >
                {updating ? t("common.processing") : t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

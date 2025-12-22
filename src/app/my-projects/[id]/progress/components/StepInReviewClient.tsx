"use client";
import { useState, useEffect } from "react";
import { markCompleted, createChangeRequest } from "./actions";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import ConfirmModal from "@/app/components/ConfirmModal";
import { X } from "lucide-react";
import { toast } from "react-toastify";

// 🧩 Bilingual reasons
const REQUEST_REASONS = [
  { key: "fix_error", en: "Fix an error", lo: "ແກ້ໄຂຂໍ້ຜິດພາດ" },
  {
    key: "adjust_layout",
    en: "Adjust layout or spacing",
    lo: "ປັບແຕ່ງແບບ ຫຼື ຊ່ອງຫວ່າງ",
  },
  {
    key: "add_content",
    en: "Add or modify content",
    lo: "ເພີ່ມ ຫຼື ແກ້ໄຂເນື້ອຫາ",
  },
  {
    key: "quality_issue",
    en: "Improve quality/design",
    lo: "ປັບປຸງຄຸນນະພາບ/ດິໄຊນ໌",
  },
  { key: "other", en: "Other", lo: "ອື່ນໆ" },
];

import type { Project } from "@/types/project";

interface StepInReviewClientProps {
  project: Project;
}

export default function StepInReviewClient({ project }: StepInReviewClientProps) {
  const { user } = useAuth();
  const { t, currentLanguage } = useTranslationContext();
  const isClient = user?.uid === project.clientId;

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [localQuota, setLocalQuota] = useState<number>(project.editQuota ?? 0);
  const [pendingRequest, setPendingRequest] = useState<boolean>(false);
  const [checkingPending, setCheckingPending] = useState<boolean>(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🖼️ New: Image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ✅ Load submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      const firestore = requireDb();
      const q = query(
        collection(firestore, "projects", project.id, "submissions"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setSubmissions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchSubmissions();
  }, [project.id]);

  // ✅ Load pending change requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      setCheckingPending(true);
      const firestore = requireDb();
      const q = query(
        collection(firestore, "projects", project.id, "changeRequests"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const pending = snap.docs.some((doc) => doc.data().status === "pending");
      setPendingRequest(pending);
      setCheckingPending(false);
    };
    fetchPendingRequests();
  }, [project.id]);

  // ✅ computed flags
  const canApprove =
    project.status === "in_review" &&
    !pendingRequest &&
    !checkingPending &&
    localQuota >= 0;

  const canRequest = localQuota > 0 && !pendingRequest && !checkingPending;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await markCompleted(project.id);
      toast.success(t("common.modal.success"), {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      window.location.reload();
    } catch  {
      toast.error(t("common.failed"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setLoading(false);
      setShowApproveModal(false);
    }
  };

  const handleRequestChange = async () => {
    if (!selectedReason) {
      toast.warn(t("common.pleaseSelectReason"), {
        position: "top-right",
        autoClose: 2500,
        theme: "colored",
      });
      return;
    }
    if (localQuota <= 0) {
      toast.warn(t("myProjects.stepper.step3.noQuota"), {
        position: "top-right",
        autoClose: 2500,
        theme: "colored",
      });
      return;
    }

    setLoading(true);
    try {
      if (!project.acceptedFreelancerId) {
        toast.error(t("myProjects.stepper.step3.noFreelancer") || "No freelancer assigned");
        return;
      }
      await createChangeRequest(
        project.id,
        project.clientId,
        project.acceptedFreelancerId,
        { en: selectedReason.en, lo: selectedReason.lo },
        localQuota
      );
      setLocalQuota((prev) => Math.max(prev - 1, 0));
      toast.success(t("common.submitSuccess"), {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      setShowRequestModal(false);
      setSelectedReason(null);
      setPendingRequest(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="text-center py-8 px-3 sm:px-8">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800">
        {t("myProjects.stepper.step3.title")}
      </h2>
      <p className="text-gray-500 mb-6">{t("myProjects.stepper.step3.desc")}</p>

      {/* Submissions */}
      {submissions.length === 0 && (
        <p className="text-gray-400 italic mb-6">
          {t("myProjects.stepper.step3.noSubmissions")}
        </p>
      )}
      {submissions.map((sub) => (
        <div
          key={sub.id}
          className="border border-gray-200 rounded-xl p-4 mb-6 "
        >
          <p className="text-gray-700 mb-3">{sub.note}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-3">
            {sub.previewUrls.map((url: string) => {
              // Extract filename and extension
              const fileName = decodeURIComponent(
                url.split("/").pop() || "file"
              );
              const ext = fileName.split(".").pop()?.toLowerCase() || "";

              // Check if it’s an image
              const isImage =
                /(jpg|jpeg|png|webp|gif|avif|heic|bmp|svg)$/i.test(ext);

              return (
                <div
                  key={url}
                  className="relative group w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col items-center justify-center text-center"
                >
                  {isImage ? (
                    <img
                      src={url}
                      alt={fileName}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                      onClick={() => setPreviewImage(url)}
                    />
                  ) : (
                    <>
                      {/* Non-image file icon */}
                      <div className="flex flex-col items-center justify-center h-full p-2">
                        <div className="rounded-full p-3 mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-600 truncate w-28">
                          {fileName}
                        </p>
                      </div>

                      {/* Download button overlay */}
                      <a
                        href={url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center transition"
                      >
                        <span className="text-sm font-semibold">Download</span>
                      </a>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
        <button
          onClick={() => setShowApproveModal(true)}
          disabled={!canApprove}
          className={`px-5 py-2.5 cursor-pointer font-semibold rounded-md ${
            canApprove
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {t("myProjects.stepper.step3.approve")}
        </button>

        <button
          onClick={() => setShowRequestModal(true)}
          disabled={!canRequest}
          className={`px-5 py-2.5 cursor-pointer font-semibold rounded-md transition ${
            canRequest
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {t("myProjects.stepper.step3.requestChanges")}
        </button>
      </div>

      {/* Status hints */}
      {checkingPending && (
        <p className="text-sm text-gray-400 mt-2">{t("common.loading")}...</p>
      )}
      {pendingRequest && !checkingPending && (
        <p className="text-sm text-amber-500 mt-2">
          {t("myProjects.stepper.step3.waitingFreelancer")}
        </p>
      )}
      {localQuota <= 0 && !pendingRequest && (
        <p className="text-sm text-gray-400 mt-2">
          {t("myProjects.stepper.step3.noQuota")}
        </p>
      )}

      {/* Confirm Modals */}
      {showApproveModal && (
        <ConfirmModal
          title={t("myProjects.stepper.step3.confirmApprove")}
          confirmLabel={t("common.confirm")}
          onConfirm={handleApprove}
          onClose={() => setShowApproveModal(false)}
          loading={loading}
        >
          {t("myProjects.stepper.step3.confirmApproveDesc")}
        </ConfirmModal>
      )}

      {showRequestModal && (
        <ConfirmModal
          title={t("myProjects.stepper.step3.requestChanges")}
          confirmLabel={t("common.confirm")}
          onConfirm={handleRequestChange}
          onClose={() => setShowRequestModal(false)}
          loading={loading}
        >
          <div className="text-left">
            <label className="block text-sm text-gray-700 mb-2">
              {t("myProjects.stepper.step3.selectReason")}
            </label>
            <select
              value={selectedReason?.key || ""}
              onChange={(e) =>
                setSelectedReason(
                  REQUEST_REASONS.find((r) => r.key === e.target.value) || null
                )
              }
              className="w-full border border-gray-300 rounded-md p-2 mb-2"
            >
              <option value="">
                {t("myProjects.stepper.step3.reasonPlaceholder")}
              </option>
              {REQUEST_REASONS.map((r) => (
                <option key={r.key} value={r.key}>
                  {currentLanguage === "lo" ? r.lo : r.en}
                </option>
              ))}
            </select>
          </div>
        </ConfirmModal>
      )}

      {/* 🖼️ Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Preview Full"
              className="max-h-[85vh] w-auto rounded-lg shadow-2xl object-contain"
            />
            <button
              className="absolute top-2 right-2 hover:text-gray-700 rounded-full p-1.5"
              onClick={() => setPreviewImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

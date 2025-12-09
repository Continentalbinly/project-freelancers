"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { acceptChangeRequest, rejectChangeRequest } from "./actions";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/service/firebase";
import ConfirmModal from "@/app/components/ConfirmModal";
import { toast } from "react-toastify";

// ✅ Define shape of changeRequest documents
interface ChangeRequest {
  id: string;
  clientId: string;
  freelancerId: string;
  status: string;
  reason: { en: string; lo: string };
  createdAt?: any;
}

export default function StepInReviewFreelancer({ project }: { project: any }) {
  const { t, currentLanguage } = useTranslationContext();

  const [pendingRequests, setPendingRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  // 🔹 Load change requests
  useEffect(() => {
    const fetchRequests = async () => {
      const q = query(
        collection(db, "projects", project.id, "changeRequests"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const allRequests: ChangeRequest[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChangeRequest, "id">),
      }));
      const pending = allRequests.filter((r) => r.status === "pending");
      setPendingRequests(pending);
    };
    fetchRequests();
  }, [project.id]);

  // 🔹 Accept
  const handleAcceptConfirm = async () => {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      await acceptChangeRequest(project.id, selectedRequest.id);
      setPendingRequests((prev) =>
        prev.filter((req) => req.id !== selectedRequest.id)
      );
      setShowAcceptModal(false);
      toast.success("Change request accepted — project moved to in progress.", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reject
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.warn("Please provide a rejection reason.", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }
    if (!selectedRequest) return;
    setLoading(true);
    try {
      await rejectChangeRequest(
        project.id,
        selectedRequest.id,
        "Freelancer rejected request",
        rejectReason
      );
      setPendingRequests((prev) =>
        prev.filter((req) => req.id !== selectedRequest.id)
      );
      setShowRejectModal(false);
      setRejectReason("");
      toast.error("🚫 Change request rejected.", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Empty state
  if (pendingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Clock className="w-10 h-10 mb-2 text-gray-400" />
        <p className="text-base font-medium">
          {t("myProjects.stepper.step3.noChangeRequests")}
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        {t("myProjects.stepper.step3.pendingChangeRequests")}
      </h2>
      <p className="text-gray-500 mb-8 text-center text-sm sm:text-base">
        {t("myProjects.stepper.step3.pendingChangeRequestsDesc")}
      </p>

      <AnimatePresence>
        {pendingRequests.map((req) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 mb-5 hover:shadow-md transition-all duration-200"
          >
            <p className="text-gray-800 text-base font-medium mb-3">
              💬 {currentLanguage === "lo" ? req.reason.lo : req.reason.en}
            </p>
            <div className="flex justify-center gap-4 mt-3">
              <button
                onClick={() => {
                  setSelectedRequest(req);
                  setShowAcceptModal(true);
                }}
                disabled={loading}
                className="flex cursor-pointer items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 active:scale-95 transition"
              >
                <CheckCircle className="w-4 h-4" />
                {t("common.accept")}
              </button>

              <button
                onClick={() => {
                  setSelectedRequest(req);
                  setShowRejectModal(true);
                }}
                disabled={loading}
                className="flex cursor-pointer items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 active:scale-95 transition"
              >
                <XCircle className="w-4 h-4" />
                {t("common.reject")}
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ✅ Accept Modal */}
      {showAcceptModal && (
        <ConfirmModal
          title={t("myProjects.stepper.step3.confirmAcceptTitle")}
          confirmLabel={t("common.confirm")}
          onConfirm={handleAcceptConfirm}
          onClose={() => setShowAcceptModal(false)}
          loading={loading}
        >
          <div className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {t("myProjects.stepper.step3.confirmAcceptDesc")}
          </div>
        </ConfirmModal>
      )}

      {/* 🚫 Reject Modal */}
      {showRejectModal && (
        <ConfirmModal
          title={t("myProjects.stepper.step3.rejectRequestTitle")}
          confirmLabel={t("common.confirm")}
          onConfirm={handleReject}
          onClose={() => setShowRejectModal(false)}
          loading={loading}
        >
          <label className="block text-sm text-gray-700 mb-2 font-medium">
            {t("myProjects.stepper.step3.rejectReason")}
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t("myProjects.stepper.step3.rejectReasonPlaceholder")}
          />
        </ConfirmModal>
      )}
    </div>
  );
}

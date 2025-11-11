"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { timeAgo } from "@/service/timeUtils";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { Project } from "@/types/project";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Briefcase } from "lucide-react";

interface Props {
  project: Project;
  t: any;
  onProjectDeleted?: (id: string) => void;
}

export default function ProjectCard({ project, t, onProjectDeleted }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentLanguage } = useTranslationContext();

  // ✅ Style helpers
  const getStatusColor = (status: string) => {
    const map: any = {
      open: "bg-success/10 text-success",
      in_progress: "bg-warning/10 text-warning",
      completed: "bg-primary/10 text-primary",
      cancelled: "bg-error/10 text-error",
    };
    return map[status] || "bg-gray-100 text-gray-500";
  };

  const formatBudget = (b: number, type: string) =>
    type === "hourly" ? `₭${b.toLocaleString()}/hr` : `₭${b.toLocaleString()}`;

  // ✅ Delete project + refund logic
  const confirmDeleteProject = async () => {
    if (project.status === "in_progress" || project.status === "completed") {
      alert(
        t("manageProjects.cannotDeleteInProgressOrCompleted") ||
          "You cannot delete a project that is in progress or completed."
      );
      setIsModalOpen(false);
      return;
    }

    try {
      setLoading(true);

      // 🔍 Check for escrow_hold transaction
      const txRef = collection(db, "transactions");
      const txQuery = query(
        txRef,
        where("projectId", "==", project.id),
        where("type", "==", "escrow_hold"),
        where("status", "==", "held")
      );
      const txSnap = await getDocs(txQuery);
      let refundDone = false;

      if (!txSnap.empty) {
        const txDoc = txSnap.docs[0];
        const txData = txDoc.data();
        const clientId = txData.userId;
        const refundAmount = txData.amount;

        // 🧾 Refund client credit
        const clientRef = doc(db, "profiles", clientId);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          const clientData = clientSnap.data();
          const currentCredit = clientData.credit ?? 0;
          const newCredit = currentCredit + refundAmount;

          await updateDoc(clientRef, {
            credit: newCredit,
            updatedAt: serverTimestamp(),
          });

          // 💳 Add refund transaction
          await addDoc(collection(db, "transactions"), {
            userId: clientId,
            type: "escrow_refund",
            amount: refundAmount,
            currency: "LAK",
            status: "completed",
            direction: "in",
            projectId: project.id,
            description: `Refunded ${refundAmount} LAK for cancelled project "${project.title}"`,
            createdAt: serverTimestamp(),
            previousBalance: currentCredit,
            newBalance: newCredit,
          });

          // 🧾 Mark escrow_hold as released
          await updateDoc(doc(db, "transactions", txDoc.id), {
            status: "released",
            updatedAt: serverTimestamp(),
          });

          // 💼 Update escrow record
          const escrowsQuery = query(
            collection(db, "escrows"),
            where("projectId", "==", project.id)
          );
          const escrowSnap = await getDocs(escrowsQuery);
          for (const eDoc of escrowSnap.docs) {
            await updateDoc(doc(db, "escrows", eDoc.id), {
              status: "released",
              updatedAt: serverTimestamp(),
            });
          }

          refundDone = true;
        }
      } else {
      }

      // 🗑 Delete related proposals
      const proposalsQuery = query(
        collection(db, "proposals"),
        where("projectId", "==", project.id)
      );
      const proposalsSnap = await getDocs(proposalsQuery);
      for (const p of proposalsSnap.docs) {
        await deleteDoc(doc(db, "proposals", p.id));
      }

      // 🗑 Delete escrows
      const escrowsQuery = query(
        collection(db, "escrows"),
        where("projectId", "==", project.id)
      );
      const escrowsSnap = await getDocs(escrowsQuery);
      for (const e of escrowsSnap.docs) {
        await deleteDoc(doc(db, "escrows", e.id));
      }

      // 🗑 Delete project itself
      await deleteDoc(doc(db, "projects", project.id));

      alert(
        refundDone
          ? t("manageProjects.projectDeletedWithRefund") ||
              "Project cancelled and credit refunded successfully."
          : t("manageProjects.projectDeletedNoRefund") ||
              "Project deleted (no escrow found, refund skipped)."
      );

      setIsModalOpen(false);
      if (onProjectDeleted) onProjectDeleted(project.id);
    } catch (err) {
      console.error("❌ Error cancelling project:", err);
      alert("Failed to cancel project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Card */}
      <div className="border border-border rounded-lg p-6 bg-white hover:shadow-md transition-all">
        <div className="flex justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {project.title}
            </h3>
            <p className="text-text-secondary text-sm mb-3 line-clamp-2">
              {project.description}
            </p>

            <div className="flex items-center gap-4 text-sm">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  project.status
                )}`}
              >
                {t(`manageProjects.${project.status}`)}
              </span>
              <span className="text-text-secondary">
                {project.views || 0} {t("manageProjects.views")}
              </span>
              <span className="text-text-secondary">
                {project.proposalsCount || 0} {t("manageProjects.proposals")}
              </span>
              <span className="text-text-secondary">
                {timeAgo(project.createdAt, currentLanguage)}
              </span>
            </div>
          </div>

          <div className="text-right ml-4">
            <div className="text-lg font-bold text-primary mb-1">
              {formatBudget(project.budget, project.budgetType)}
            </div>
            <div className="text-sm text-text-secondary">
              {t("manageProjects.budget")}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skillsRequired.slice(0, 5).map((skill, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {project.skillsRequired.length > 5 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{project.skillsRequired.length - 5} {t("manageProjects.more")}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center gap-2 text-sm text-primary font-medium"
            >
              <EyeIcon className="w-4 h-4" />
              {t("manageProjects.viewDetails")}
            </Link>

            {project.status === "open" && (
              <>
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="flex items-center gap-2 text-sm text-secondary font-medium"
                >
                  <PencilIcon className="w-4 h-4" />
                  {t("manageProjects.editProject")}
                </Link>

                <Link
                  href={`/projects/${project.id}/proposals`}
                  className="flex items-center gap-2 text-sm text-success font-medium"
                >
                  <Briefcase className="w-4 h-4" />
                  {t("manageProjects.viewProposals")} (
                  {project.proposalsCount || 0})
                </Link>
              </>
            )}
          </div>

          {project.status === "open" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex cursor-pointer items-center gap-2 text-sm text-error font-medium hover:text-error-dark"
            >
              <TrashIcon className="w-4 h-4" />
              {t("manageProjects.cancelProject")}
            </button>
          )}
        </div>
      </div>

      {/* 🧱 Confirmation Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-border">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-error/10 p-2 rounded-full">
                    <ExclamationTriangleIcon className="w-6 h-6 text-error" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-text-primary ml-3"
                  >
                    {t("manageProjects.confirmCancelTitle") ||
                      "Cancel this project?"}
                  </Dialog.Title>
                </div>

                <p className="text-text-secondary text-sm mb-6">
                  {t("manageProjects.confirmCancelDesc") ||
                    `Are you sure you want to cancel the project "${project.title}"? 
                    This action cannot be undone.`}
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 cursor-pointer py-2 text-sm rounded-lg border border-border hover:bg-gray-50"
                    disabled={loading}
                  >
                    {t("common.cancel") || "Cancel"}
                  </button>
                  <button
                    onClick={confirmDeleteProject}
                    disabled={loading}
                    className="px-4 cursor-pointer py-2 text-sm rounded-lg bg-error text-white hover:bg-error-dark"
                  >
                    {loading
                      ? t("common.processing") || "Processing..."
                      : t("manageProjects.confirmDelete") || "Yes, Cancel"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

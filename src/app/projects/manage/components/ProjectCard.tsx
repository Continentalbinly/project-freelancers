"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { toast } from "react-toastify";

interface Props {
  project: Project;
  t: any;
  onProjectDeleted?: (id: string) => void;
}

export default function ProjectCard({ project, t, onProjectDeleted }: Props) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentLanguage } = useTranslationContext();

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

  // DELETE PROJECT
  const confirmDeleteProject = async () => {
    if (project.status !== "open") {
      toast.warn(t("manageProjects.cannotDeleteInProgressOrCompleted"));
      setIsModalOpen(false);
      return;
    }

    try {
      setLoading(true);

      const postingFee = project.postingFee ?? 0;

      if (postingFee > 0) {
        const clientRef = doc(db, "profiles", project.clientId);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          const clientData = clientSnap.data();
          const currentCredit = clientData.credit ?? 0;
          const newCredit = currentCredit + postingFee;

          await updateDoc(clientRef, {
            credit: newCredit,
            updatedAt: serverTimestamp(),
          });

          await addDoc(collection(db, "transactions"), {
            userId: project.clientId,
            type: "posting_fee_refund",
            direction: "in",
            amount: postingFee,
            currency: "LAK",
            previousBalance: currentCredit,
            newBalance: newCredit,
            projectId: project.id,
            description: `Refunded ${postingFee} LAK posting fee`,
            createdAt: serverTimestamp(),
            status: "completed",
          });
        }
      }

      const proposalsSnap = await getDocs(
        query(collection(db, "proposals"), where("projectId", "==", project.id))
      );

      for (const p of proposalsSnap.docs) {
        await deleteDoc(doc(db, "proposals", p.id));
      }

      await deleteDoc(doc(db, "projects", project.id));

      toast.success(
        postingFee > 0
          ? t("manageProjects.projectDeletedWithRefund")
          : t("manageProjects.projectDeletedNoRefund")
      );

      setIsModalOpen(false);

      if (onProjectDeleted) onProjectDeleted(project.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CARD CONTAINER — now clickable */}
      <div
        onClick={() => router.push(`/projects/${project.id}`)}
        className="border border-border rounded-xl bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        {/* TOP SECTION */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1 line-clamp-2">
              {project.title}
            </h3>

            <p className="text-text-secondary text-sm mb-3 line-clamp-3 sm:line-clamp-2">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-3 text-xs sm:text-sm mt-2">
              <span
                className={`px-2 py-1 rounded-full font-medium ${getStatusColor(
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

          <div className="text-left sm:text-right">
            <div className="text-lg font-bold text-primary">
              {formatBudget(project.budget, project.budgetType)}
            </div>
            <div className="text-sm text-text-secondary">
              {t("manageProjects.budget")}
            </div>
          </div>
        </div>

        {/* SKILLS */}
        <div className="flex flex-wrap gap-2 mt-4">
          {project.skillsRequired.slice(0, 6).map((skill, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {project.skillsRequired.length > 6 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{project.skillsRequired.length - 6} {t("manageProjects.more")}
            </span>
          )}
        </div>

        {/* ACTION ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-border">
          {/* LEFT ACTIONS — stop card click */}
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href={`/projects/${project.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-primary font-medium"
            >
              <EyeIcon className="w-4 h-4" />
              {t("manageProjects.viewDetails")}
            </Link>

            {project.status === "open" && (
              <>
                <Link
                  href={`/projects/${project.id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-secondary font-medium"
                >
                  <PencilIcon className="w-4 h-4" />
                  {t("manageProjects.editProject")}
                </Link>

                <Link
                  href={`/projects/${project.id}/proposals`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-success font-medium"
                >
                  <Briefcase className="w-4 h-4" />
                  {t("manageProjects.viewProposals")} ({project.proposalsCount})
                </Link>
              </>
            )}
          </div>

          {/* DELETE BUTTON — stop card click */}
          {project.status === "open" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1 text-sm text-error cursor-pointer font-medium hover:text-error-dark"
            >
              <TrashIcon className="w-4 h-4" />
              {t("manageProjects.cancelProject")}
            </button>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
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
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
              as={Fragment}
            >
              <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-border">
                <div className="flex items-center mb-4">
                  <div className="bg-error/10 p-2 rounded-full">
                    <ExclamationTriangleIcon className="w-6 h-6 text-error" />
                  </div>
                  <Dialog.Title className="ml-3 text-lg font-semibold text-text-primary">
                    {t("manageProjects.confirmCancelTitle")}
                  </Dialog.Title>
                </div>

                <p className="text-text-secondary text-sm mb-6">
                  {t("manageProjects.confirmCancelDesc").replace(
                    "{title}",
                    project.title
                  )}
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm rounded-lg border border-border cursor-pointer hover:bg-gray-50"
                  >
                    {t("common.cancel")}
                  </button>

                  <button
                    onClick={confirmDeleteProject}
                    disabled={loading}
                    className="px-4 py-2 text-sm rounded-lg bg-error text-white cursor-pointer hover:bg-error-dark"
                  >
                    {loading
                      ? t("common.processing")
                      : t("manageProjects.confirmDelete")}
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

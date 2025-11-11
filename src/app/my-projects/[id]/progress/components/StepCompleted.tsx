"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/service/firebase";
import { Download, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function StepCompleted({ project }: { project: any }) {
  const { user } = useAuth();
  const { t, currentLanguage } = useTranslationContext();
  const isClient = user?.uid === project.clientId;
  const isFreelancer = user?.uid === project.acceptedFreelancerId;
  const [files, setFiles] = useState<any[]>([]);

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

  // 🧩 Common translations for both roles
  // Add these to your locale JSON (en + lo)
  // myProjects.stepper.step4.title
  // myProjects.stepper.step4.descFreelancer
  // myProjects.stepper.finalDelivery.title
  // myProjects.stepper.finalDelivery.descClient
  // myProjects.stepper.finalDelivery.noFiles

  if (isFreelancer) {
    return (
      <div className="text-center py-10 text-green-700">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          🎉 {t("myProjects.stepper.step4.title")}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {t("myProjects.stepper.step4.descFreelancer") ||
            "Your project is completed and files have been delivered successfully."}
        </p>
        <div className="mt-6 flex justify-center">
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

  if (isClient) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-2">
          {t("myProjects.stepper.finalDelivery.title")}
        </h2>
        <p className="text-gray-500 mb-6">
          {t("myProjects.stepper.finalDelivery.descClient") ||
            "Your project is completed. You can download the final deliverables below."}
        </p>

        {files.length > 0 ? (
          <div className="flex flex-col items-center gap-3">
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

        <div className="mt-6 flex justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
      </div>
    );
  }

  return null;
}

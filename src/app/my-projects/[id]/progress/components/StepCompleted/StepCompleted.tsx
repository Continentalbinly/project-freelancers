"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";

import FinalMessage from "./FinalMessage";
import FreelancerView from "./FreelancerView";
import ClientView from "./ClientView";

export default function StepCompleted({ project }: { project: any }) {
  const { user } = useAuth();

  const isClient = user?.uid === project.clientId;
  const isFreelancer = user?.uid === project.acceptedFreelancerId;

  const [files, setFiles] = useState<any[]>([]);
  const [hasRated, setHasRated] = useState(false);

  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingRating, setLoadingRating] = useState(true);

  /** Load final deliverables */
  useEffect(() => {
    const loadFiles = async () => {
      setLoadingFiles(true);
      const q = query(
        collection(db, "projects", project.id, "finalDeliverables"),
        orderBy("uploadedAt", "desc")
      );
      const snap = await getDocs(q);
      setFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingFiles(false);
    };
    loadFiles();
  }, [project.id]);

  /** Check if this user has already rated */
  useEffect(() => {
    if (!user?.uid) return;

    const checkRating = async () => {
      setLoadingRating(true);
      const q = query(
        collection(db, "ratings"),
        where("projectId", "==", project.id),
        where("raterId", "==", user.uid)
      );
      const snap = await getDocs(q);
      setHasRated(!snap.empty);
      setLoadingRating(false);
    };

    checkRating();
  }, [project.id, user?.uid]);

  /** Final loading status */
  const isLoading = loadingFiles || loadingRating;

  /** Skeleton / Loading State */
  if (isLoading) {
    return (
      <div className="py-12 px-6 animate-pulse">
        {/* Title skeleton */}
        <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
        <div className="h-4 w-64 bg-gray-200 rounded mx-auto mb-8"></div>

        {/* Card skeleton */}
        <div className="max-w-md mx-auto bg-white border border-border p-6 rounded-xl shadow-sm">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
          </div>

          <div className="mt-6 h-10 w-full bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (isFreelancer)
    return (
      <FreelancerView project={project} hasRated={hasRated} files={files} />
    );

  if (isClient)
    return <ClientView project={project} hasRated={hasRated} files={files} />;

  return null;
}

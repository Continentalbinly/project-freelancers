"use client";

import { useState, useEffect } from "react";
import { db } from "@/service/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  DocumentData,
} from "firebase/firestore";

/** ✅ Define and export reusable types */
export interface ProjectData extends DocumentData {
  id: string;
  clientId?: string;
  acceptedFreelancerId?: string;
  title?: string;
  status?: string;
  updatedAt?: any;
  createdAt?: any;
}

export interface ProposalData extends DocumentData {
  id: string;
  freelancerId?: string;
  projectId?: string;
  createdAt?: any;
  [key: string]: any;
}

export default function useProfileData(user: { uid: string } | null) {
  const [userProjects, setUserProjects] = useState<ProjectData[]>([]);
  const [userProposals, setUserProposals] = useState<ProposalData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchUserData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const projectsRef = collection(db, "projects");
      const projectsSnap = await getDocs(
        query(projectsRef, orderBy("updatedAt", "desc"), limit(10))
      );

      const projects = projectsSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as ProjectData)
      );

      setUserProjects(
        projects.filter(
          (p) => p.clientId === user.uid || p.acceptedFreelancerId === user.uid
        )
      );

      const proposalsRef = collection(db, "proposals");
      const proposalsSnap = await getDocs(
        query(proposalsRef, orderBy("createdAt", "desc"), limit(10))
      );

      const proposals = proposalsSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as ProposalData)
      );

      setUserProposals(proposals.filter((p) => p.freelancerId === user.uid));
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  return {
    userProjects,
    userProposals,
    loadingData,
    refetchData: fetchUserData,
  };
}

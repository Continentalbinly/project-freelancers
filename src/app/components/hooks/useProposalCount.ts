"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDocsFromCache, getDocs } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import type { Proposal } from "@/types/proposal";

interface UseProposalCountOptions {
  userId: string | null;
  userRole: "client" | "freelancer" | null;
}

export function useProposalCount({ userId, userRole }: UseProposalCountOptions) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !userRole) {
      setCount(0);
      setLoading(false);
      return;
    }

    const db = requireDb();

    // For freelancers: count pending proposals they submitted
    // For clients: count pending proposals they received (on their projects)
    let unsubscribe: (() => void) | null = null;

    if (userRole === "freelancer") {
      // Query proposals submitted by freelancer with pending status
      const q = query(
        collection(db, "proposals"),
        where("freelancerId", "==", userId),
        where("status", "==", "pending")
      );

      // ✅ Cache-first: Try cache first for instant load
      const loadFromCache = async () => {
        try {
          const cacheSnap = await getDocsFromCache(q);
          if (!cacheSnap.empty) {
            setCount(cacheSnap.docs.length);
            setLoading(false);
          }
        } catch (cacheError) {
          // Cache miss, will load from server via onSnapshot
        }
      };

      loadFromCache();

      // Then set up real-time listener for updates
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setCount(snapshot.docs.length);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching proposal count:", error);
          setCount(0);
          setLoading(false);
        }
      );
    } else {
      // For clients: count pending proposals on their projects
      // First, get all projects owned by the client
      const projectsQuery = query(
        collection(db, "projects"),
        where("clientId", "==", userId)
      );

      const loadClientProposals = async () => {
        try {
          // Get client's projects
          let projectsSnap;
          try {
            projectsSnap = await getDocsFromCache(projectsQuery);
          } catch {
            projectsSnap = await getDocs(projectsQuery);
          }

          const projectIds = projectsSnap.docs.map(doc => doc.id);

          if (projectIds.length === 0) {
            setCount(0);
            setLoading(false);
            return;
          }

          // Query all pending proposals
          const proposalsQuery = query(
            collection(db, "proposals"),
            where("status", "==", "pending")
          );

          // Try cache first
          try {
            const cacheSnap = await getDocsFromCache(proposalsQuery);
            if (!cacheSnap.empty) {
              const pendingCount = cacheSnap.docs.filter((doc) => {
                const proposal = doc.data() as Proposal;
                return projectIds.includes(proposal.projectId);
              }).length;
              setCount(pendingCount);
              setLoading(false);
            }
          } catch {
            // Cache miss, will load from server
          }

          // Set up real-time listener
          unsubscribe = onSnapshot(
            proposalsQuery,
            (snapshot) => {
              const pendingCount = snapshot.docs.filter((doc) => {
                const proposal = doc.data() as Proposal;
                return projectIds.includes(proposal.projectId);
              }).length;
              setCount(pendingCount);
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching client proposals count:", error);
              setCount(0);
              setLoading(false);
            }
          );
        } catch {
          setCount(0);
          setLoading(false);
        }
      };

      loadClientProposals();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, userRole]);

  return { count, loading };
}


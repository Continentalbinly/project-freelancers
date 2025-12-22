"use client";
import { useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { requireDb } from "@/service/firebase";
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { Profile } from "@/types/profile";

interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: Date;
}

export function useDashboardData(
  user: FirebaseUser | null,
  profile: Profile | null,
  t: (key: string) => string
) {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalEarned: 0,
    totalSpent: 0,
    projectsCompleted: 0,
    proposalsSubmitted: 0,
    proposalsReceived: 0,
    rating: 0,
  });
  const [recentActivity, setRecentActivity] = useState<DashboardActivity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoadingActivity(true);
      try {
        const projectsRef = collection(requireDb(), "projects");
        const proposalsRef = collection(requireDb(), "proposals");

        const [projectsSnap, proposalsSnap] = await Promise.all([
          getDocs(query(projectsRef, orderBy("updatedAt", "desc"), limit(20))),
          getDocs(query(proposalsRef, orderBy("createdAt", "desc"), limit(20))),
        ]);

        const projects = projectsSnap.docs.filter((d) => {
          const data = d.data();
          return (
            data.clientId === user.uid || data.acceptedFreelancerId === user.uid
          );
        });

        const proposals = proposalsSnap.docs.filter(
          (d) => d.data().freelancerId === user.uid
        );

        // compute stats
        const completed = projects.filter(
          (d) => d.data().status === "completed"
        ).length;
        const active = projects.filter((d) =>
          ["open", "in_progress"].includes(d.data().status)
        ).length;
        const earned = projects
          .filter(
            (d) =>
              d.data().status === "completed" &&
              d.data().acceptedFreelancerId === user.uid
          )
          .reduce((sum, d) => sum + (d.data().budget || 0), 0);
        const spent = projects
          .filter(
            (d) =>
              d.data().status === "completed" && d.data().clientId === user.uid
          )
          .reduce((sum, d) => sum + (d.data().budget || 0), 0);

        setStats({
          activeProjects: active,
          totalEarned: earned,
          totalSpent: spent,
          projectsCompleted: completed,
          proposalsSubmitted: proposals.length,
          proposalsReceived: 0,
          rating: profile?.rating || 0,
        });

        // recent activity
        const activities: DashboardActivity[] = [];
        projects.forEach((doc) => {
          const data = doc.data();
          if (data.status === "completed") {
            const updatedAt = data.updatedAt;
            const date = updatedAt instanceof Timestamp
              ? updatedAt.toDate()
              : updatedAt?.toDate?.() || new Date();
            
            activities.push({
              id: doc.id,
              type: "project_completed",
              title: data.title || "Untitled Project",
              description: `${data.title || "Project"} completed.`,
              date,
            });
          }
        });
        setRecentActivity(
          activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6)
        );
      } catch  {
        //console.error("Dashboard data error:", err);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchData();
  }, [user]);

  return { stats, recentActivity, loadingActivity };
}

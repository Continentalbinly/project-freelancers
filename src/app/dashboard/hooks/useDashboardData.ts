"use client";
import { useEffect, useState } from "react";
import { db } from "@/service/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export function useDashboardData(user: any, profile: any, t: any) {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalEarned: 0,
    totalSpent: 0,
    projectsCompleted: 0,
    proposalsSubmitted: 0,
    proposalsReceived: 0,
    rating: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoadingActivity(true);
      try {
        const projectsRef = collection(db, "projects");
        const proposalsRef = collection(db, "proposals");

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
        const activities: any[] = [];
        projects.forEach((doc) => {
          const data = doc.data();
          if (data.status === "completed") {
            activities.push({
              id: doc.id,
              type: "project_completed",
              title: data.title,
              description: `${data.title} completed.`,
              date: data.updatedAt?.toDate() || new Date(),
            });
          }
        });
        setRecentActivity(
          activities.sort((a, b) => b.date - a.date).slice(0, 6)
        );
      } catch (err) {
        //console.error("Dashboard data error:", err);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchData();
  }, [user]);

  return { stats, recentActivity, loadingActivity };
}

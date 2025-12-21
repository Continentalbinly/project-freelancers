"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { Project } from "@/types/project";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all",
    budgetType: "all",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const firestore = requireDb();
      const q = query(collection(firestore, "projects"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data: Project[] = [];

      for (const docSnap of snapshot.docs) {
        const projectData = docSnap.data();
        data.push({
          id: docSnap.id,
          ...projectData,
          createdAt: projectData.createdAt?.toDate?.() || new Date(),
          updatedAt: projectData.updatedAt?.toDate?.() || new Date(),
        } as Project);
      }

      setProjects(data);
    } catch {
      //console.error("❌ Error fetching projects");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Increment views
  const incrementProjectViews = async (projectId: string) => {
    try {
      const firestore = requireDb();
      const projectRef = doc(firestore, "projects", projectId);
      const snap = await getDoc(projectRef);
      if (!snap.exists()) return;
      const currentViews = snap.data().views || 0;
      await updateDoc(projectRef, { views: currentViews + 1 });
    } catch {
      //console.error("Error updating views");
    }
  };

  // 🧠 Filtering Logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.description?.toLowerCase().includes(filters.search.toLowerCase());

    // ✅ FIXED: Support category as object
    const projectCategoryId =
      typeof project.category === "object"
        ? project.category.id
        : project.category;

    const matchesCategory =
      filters.category === "all" || projectCategoryId === filters.category;

    const matchesStatus =
      filters.status === "all" || project.status === filters.status;

    const matchesBudget =
      filters.budgetType === "all" || project.budgetType === filters.budgetType;

    return matchesSearch && matchesCategory && matchesStatus && matchesBudget;
  });

  return {
    projects,
    filteredProjects,
    loading,
    filters,
    setFilters,
    incrementProjectViews,
  };
}

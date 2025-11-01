"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { formatEarnings } from "@/service/currencyUtils";
import { timeAgo } from "@/service/timeUtils";
import Avatar from "@/app/utils/avatarHandler";

export default function PortfolioSection() {
  const { t, currentLanguage } = useTranslationContext();
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  async function fetchCompletedProjects() {
    try {
      setLoading(true);
      const q = query(
        collection(db, "projects"),
        where("status", "==", "completed"),
        where("acceptedFreelancerId", "!=", null),
        orderBy("completedAt", "desc"),
        limit(9)
      );
      const snap = await getDocs(q);

      const projects = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let freelancer = null;
          if (data.acceptedFreelancerId) {
            const freelancerRef = doc(
              db,
              "profiles",
              data.acceptedFreelancerId
            );
            const freelancerSnap = await getDoc(freelancerRef);
            if (freelancerSnap.exists()) freelancer = freelancerSnap.data();
          }
          return {
            id: docSnap.id,
            ...data,
            freelancer,
            completedAt: data.completedAt?.toDate() || new Date(),
          };
        })
      );
      setCompletedProjects(projects);
    } catch (err) {
      console.error("❌ Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            {t("freelancersPage.portfolio.title")}
          </h2>
          <p className="text-lg text-text-secondary">
            {t("freelancersPage.portfolio.subtitle")}
          </p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow border border-border animate-pulse"
              >
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : completedProjects.length ? (
            completedProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow hover:shadow-lg border border-border overflow-hidden transition-all duration-300"
              >
                <div className="relative aspect-video">
                  <img
                    src={project.imageUrl || "/images/default-project.jpg"}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary line-clamp-2 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-3 mb-3">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                      {project.category?.name_en ||
                        project.category?.name_lo ||
                        "-"}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {timeAgo(project.completedAt, currentLanguage)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={project.freelancer?.avatarUrl}
                        name={project.freelancer?.fullName}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-text-primary">
                        {project.freelancer?.fullName || "Freelancer"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-success">
                      {formatEarnings(project.budget)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-text-secondary">
              {t("freelancersPage.portfolio.noProjects")}
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Link href="/projects" className="btn btn-primary px-8 py-3 text-lg">
            {t("freelancersPage.portfolio.viewMore")}
          </Link>
        </div>
      </div>
    </section>
  );
}

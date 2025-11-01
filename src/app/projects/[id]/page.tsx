"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/service/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

import ProjectHeader from "./components/ProjectHeader";
import ProjectDescription from "./components/ProjectDescription";
import ProjectSkills from "./components/ProjectSkills";
import ProjectAttachments from "./components/ProjectAttachments";
import ProjectParticipants from "./components/ProjectParticipants";
import ProjectSidebar from "./components/ProjectSidebar";
import ProjectActions from "./components/ProjectActions";
import CompletionStatus from "./components/CompletionStatus";
import ProjectImage from "@/app/utils/projectImageHandler";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslationContext();

  const [project, setProject] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProjectAndProfiles(id as string);
  }, [id]);

  // 🔹 Fetch project + participants
  async function fetchProjectAndProfiles(projectId: string) {
    try {
      // 🧠 1. Fetch project
      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) {
        setLoading(false);
        return;
      }

      const projectData = projectSnap.data();
      const proposalsQuery = query(
        collection(db, "proposals"),
        where("projectId", "==", projectId)
      );
      const proposalsSnap = await getDocs(proposalsQuery);

      const projectWithMeta = {
        id: projectSnap.id,
        ...projectData,
        proposalsCount: proposalsSnap.size,
      };

      setProject(projectWithMeta);

      // 🧠 2. Fetch client profile from "profiles" collection
      if (projectData.clientId) {
        const clientRef = doc(db, "profiles", projectData.clientId);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) {
          setClientProfile({ id: clientSnap.id, ...clientSnap.data() });
        }
      }

      // 🧠 3. Fetch freelancer profile (if accepted)
      if (projectData.acceptedFreelancerId) {
        const freelancerRef = doc(
          db,
          "profiles",
          projectData.acceptedFreelancerId
        );
        const freelancerSnap = await getDoc(freelancerRef);
        if (freelancerSnap.exists()) {
          setFreelancerProfile({
            id: freelancerSnap.id,
            ...freelancerSnap.data(),
          });
        }
      }
    } catch (error) {
      console.error("❌ Error fetching project or profiles:", error);
    } finally {
      setLoading(false);
    }
  }

  // 🕒 Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">{t("projectDetail.loading")}</p>
      </div>
    );
  }

  // 🚫 Project not found
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {t("projectDetail.projectNotFound")}
          </h2>
          <Link href="/projects" className="btn btn-primary">
            {t("projectDetail.backToProjects")}
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Page layout
  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          <ProjectImage
            src={project.imageUrl}
            alt={project.title}
            size="full"
          />

          <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <ProjectHeader project={project} user={user} t={t} />
            <ProjectDescription description={project.description} t={t} />
            <ProjectSkills skills={project.skillsRequired} t={t} />
            <ProjectAttachments attachments={project.attachments} t={t} />
          </div>

          <ProjectParticipants
            clientProfile={clientProfile}
            freelancerProfile={freelancerProfile}
            project={project}
            t={t}
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-1">
          <div className="flex flex-col space-y-6 lg:sticky lg:top-[100px] self-start">
            <ProjectSidebar project={project} t={t} />
            <ProjectActions project={project} user={user} t={t} />
            <CompletionStatus
              project={project}
              t={t}
              formatDate={(d: Date) =>
                new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(d)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

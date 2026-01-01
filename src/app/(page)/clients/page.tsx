"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import ProjectImage, {
  getProjectImageProps,
} from "@/app/utils/projectImageHandler";
import Avatar from "@/app/utils/avatarHandler";
import type { Project } from "@/types/project";
import type { Profile } from "@/types/profile";
import MarketingLayout from "../components/MarketingLayout";
import MarketingHero from "../components/MarketingHero";
import MarketingSection from "../components/MarketingSection";
import FeatureGrid from "../components/FeatureGrid";
import CTA from "../components/CTA";
import StatusBadge from "@/app/components/ui/StatusBadge";
import {
  Edit,
  Users,
  CheckCircle2,
  DollarSign,
  Zap,
  MessageSquare,
  Shield,
  Monitor,
  Layout,
  BarChart3,
  Image as ImageIcon,
} from "lucide-react";

export default function ClientsPage() {
  const { t } = useTranslationContext();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<{ [id: string]: Profile }>({});

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) return;
    const fetchProjects = async () => {
      setLoading(true);
      const q = query(collection(requireDb(), "projects"));
      const snap = await getDocs(q);
      const projectList = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as Project;
      });
      setProjects(projectList);
      setLoading(false);
    };
    fetchProjects();
  }, [user]);

  // Fetch creator profiles in batches of 10 (Firestore 'in' limitation)
  useEffect(() => {
    if (user) return;
    if (projects.length === 0) return;
    const creatorIds = Array.from(
      new Set(projects.map((p) => p.clientId).filter(Boolean) as string[])
    );
    if (creatorIds.length === 0) return;

    const fetchProfiles = async () => {
      const allProfiles: { [id: string]: Profile } = {};
      for (let i = 0; i < creatorIds.length; i += 10) {
        const batch = creatorIds.slice(i, i + 10);
        const q = query(
          collection(requireDb(), "profiles"),
          where("__name__", "in", batch)
        );
        const snap = await getDocs(q);
        snap.forEach((doc) => {
          allProfiles[doc.id] = doc.data() as Profile;
        });
      }
      setProfiles(allProfiles);
    };
    fetchProfiles();
  }, [projects, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) return null;

  const howItWorksSteps = [
    {
      icon: Edit,
      title: t("clientsPage.howItWorks.steps.0.title"),
      description: t("clientsPage.howItWorks.steps.0.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: Users,
      title: t("clientsPage.howItWorks.steps.1.title"),
      description: t("clientsPage.howItWorks.steps.1.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: CheckCircle2,
      title: t("clientsPage.howItWorks.steps.2.title"),
      description: t("clientsPage.howItWorks.steps.2.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
  ];

  const benefits = [
    {
      icon: CheckCircle2,
      title: t("clientsPage.benefits.features.0.title"),
      description: t("clientsPage.benefits.features.0.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
    {
      icon: DollarSign,
      title: t("clientsPage.benefits.features.1.title"),
      description: t("clientsPage.benefits.features.1.description"),
      iconColor: "text-info",
      iconBg: "bg-info/10",
    },
    {
      icon: Zap,
      title: t("clientsPage.benefits.features.2.title"),
      description: t("clientsPage.benefits.features.2.description"),
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
    },
    {
      icon: MessageSquare,
      title: t("clientsPage.benefits.features.3.title"),
      description: t("clientsPage.benefits.features.3.description"),
      iconColor: "text-info",
      iconBg: "bg-info/10",
    },
    {
      icon: Shield,
      title: t("clientsPage.benefits.features.4.title"),
      description: t("clientsPage.benefits.features.4.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: Users,
      title: t("clientsPage.benefits.features.5.title"),
      description: t("clientsPage.benefits.features.5.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
  ];

  const popularCategories = [
    {
      icon: Monitor,
      title: t("clientsPage.popularCategories.categories.0.title"),
      description: t("clientsPage.popularCategories.categories.0.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: Layout,
      title: t("clientsPage.popularCategories.categories.1.title"),
      description: t("clientsPage.popularCategories.categories.1.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: BarChart3,
      title: t("clientsPage.popularCategories.categories.2.title"),
      description: t("clientsPage.popularCategories.categories.2.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
    {
      icon: ImageIcon,
      title: t("clientsPage.popularCategories.categories.3.title"),
      description: t("clientsPage.popularCategories.categories.3.description"),
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
    },
  ];

  return (
    <MarketingLayout>
      <MarketingHero
        title={t("clientsPage.hero.title")}
        subtitle={t("clientsPage.hero.subtitle")}
        primaryCTA={{
          label: t("clientsPage.hero.postProject"),
          href: "/auth/signup?type=client",
        }}
        secondaryCTA={{
          label: t("clientsPage.hero.browseFreelancers"),
          href: "/projects",
        }}
        className="bg-linear-to-br from-secondary via-secondary-hover to-info dark:from-secondary/90 dark:via-secondary dark:to-secondary-hover relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-40 -mr-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </MarketingHero>

      {/* Projects Section */}
      <MarketingSection>
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            {t("clientsPage.projects.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("clientsPage.projects.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-background rounded-2xl border border-border overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-background-tertiary" />
                <div className="p-6">
                  <div className="h-6 rounded mb-2 bg-background-tertiary" />
                  <div className="h-4 rounded mb-4 bg-background-tertiary" />
                  <div className="flex items-center justify-between">
                    <div className="h-4 rounded w-20 bg-background-tertiary" />
                    <div className="h-4 rounded w-16 bg-background-tertiary" />
                  </div>
                </div>
              </div>
            ))
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {t("clientsPage.projects.noProjects")}
              </h3>
              <p className="text-text-secondary mb-6">
                {t("clientsPage.projects.noProjectsDesc")}
              </p>
              <Link
                href="/projects/create"
                className="inline-flex items-center justify-center bg-primary text-white hover:bg-primary-hover px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t("clientsPage.projects.postFirstProject")}
              </Link>
            </div>
          ) : (
            projects.map((project) => {
              const creatorId = project.clientId;
              const creator = profiles[creatorId];
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="bg-background rounded-2xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <ProjectImage
                      {...getProjectImageProps(project)}
                      size="full"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 z-10">
                      <StatusBadge status={project.status} type="project" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    {/* Creator info */}
                    <div className="flex items-center gap-2 mt-4">
                      <Avatar
                        src={creator?.avatarUrl}
                        alt={creator?.fullName}
                        name={creator?.fullName || "Unknown"}
                        size="sm"
                      />
                      <div>
                        <span className="text-sm text-text-secondary font-medium">
                          {creator?.fullName || "Unknown"}
                        </span>
                        {creator?.role && (
                          <div className="text-xs text-primary font-semibold">
                            {creator.role}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </MarketingSection>

      {/* How It Works */}
      <MarketingSection background="secondary">
        <FeatureGrid
          title={t("clientsPage.howItWorks.title")}
          subtitle={t("clientsPage.howItWorks.subtitle")}
          features={howItWorksSteps}
          columns={3}
        />
      </MarketingSection>

      {/* Benefits Section */}
      <MarketingSection>
        <FeatureGrid
          title={t("clientsPage.benefits.title")}
          subtitle={t("clientsPage.benefits.subtitle")}
          features={benefits}
          columns={3}
        />
      </MarketingSection>

      {/* Popular Categories */}
      <MarketingSection background="secondary">
        <FeatureGrid
          title={t("clientsPage.popularCategories.title")}
          subtitle={t("clientsPage.popularCategories.subtitle")}
          features={popularCategories}
          columns={4}
        />
      </MarketingSection>

      {/* CTA Section */}
      <CTA
        title={t("clientsPage.cta.title")}
        subtitle={t("clientsPage.cta.subtitle")}
        primaryCTA={{
          label: t("clientsPage.cta.postFirstProject"),
          href: "/auth/signup?type=client",
        }}
        secondaryCTA={{
          label: t("clientsPage.cta.browseFreelancers"),
          href: "/projects",
        }}
        variant="gradient"
        className="bg-linear-to-r from-secondary via-secondary to-secondary-hover relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -ml-40" />
      </CTA>
    </MarketingLayout>
  );
}

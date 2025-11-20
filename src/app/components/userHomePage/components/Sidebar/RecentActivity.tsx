"use client";

import { useEffect, useState } from "react";
import { db } from "@/service/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { timeAgo } from "@/service/timeUtils";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function RecentActivity({ user }: any) {
  const { t, currentLanguage } = useTranslationContext();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const list: any[] = [];
      const projectsSnap = await getDocs(
        query(
          collection(db, "projects"),
          orderBy("updatedAt", "desc"),
          limit(15)
        )
      );

      projectsSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data.clientId === user.uid)
          list.push({
            id: doc.id,
            type: "project_created",
            title: data.title,
            ts: data.createdAt?.toDate() || new Date(),
          });
        if (data.acceptedFreelancerId === user.uid)
          list.push({
            id: doc.id,
            type: "project_assigned",
            title: data.title,
            ts: data.updatedAt?.toDate() || new Date(),
          });
      });

      setActivities(list.slice(0, 6));
    } catch (err) {
      //console.error("Error fetching activity:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-6">
      <h3 className="font-semibold text-text-primary mb-4">
        {t("userHomePage.recentActivity.title")}
      </h3>
      {loading ? (
        <p className="text-sm text-text-secondary italic">
          {t("common.loading")}
        </p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-text-secondary text-center">
          {t("userHomePage.recentActivity.noActivity")}
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-2">
              <span className="text-lg">{getIcon(a.type)}</span>
              <div>
                <p className="text-sm text-text-primary">{getText(a, t)}</p>
                <p className="text-xs text-text-secondary">{timeAgo(a.ts, currentLanguage)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const getIcon = (type: string) => {
  const icons: any = {
    project_created: "📝",
    project_assigned: "✅",
    project_completed: "🎉",
  };
  return icons[type] || "📋";
};

const getText = (a: any, t: any) => {
  switch (a.type) {
    case "project_created":
      return t("userHomePage.recentActivity.projectCreated").replace(
        "{title}",
        a.title
      );
    case "project_assigned":
      return t("userHomePage.recentActivity.projectAssigned").replace(
        "{title}",
        a.title
      );
    case "project_completed":
      return t("userHomePage.recentActivity.projectCompleted").replace(
        "{title}",
        a.title
      );
    default:
      return a.title;
  }
};

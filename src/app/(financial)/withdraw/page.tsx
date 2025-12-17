"use client";

import { useState, useEffect } from "react";
import WithdrawSummary from "./components/WithdrawSummary";
import ClientWithdrawForm from "./components/ClientWithdrawForm";
import FreelancerWithdrawForm from "./components/FreelancerWithdrawForm";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/service/profile";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function WithdrawPage() {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"client" | "freelancer" | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    getUserProfile(user.uid).then((data) => {
      if (!data) {
        setLoading(false);
        return;
      }
      
      setProfile(data);
      setLoading(false);

      // Detect user role
      if ((data as any).role === "freelancer") {
        setUserRole("freelancer");
      } else if ((data as any).role === "client") {
        setUserRole("client");
      }
    });
  }, [user]);

  return (
    <div className="min-h-screen px-4 py-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Skeleton loading */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-28 rounded-2xl bg-background-secondary"></div>
            <div className="h-80 rounded-2xl bg-background-secondary"></div>
            <div className="h-40 rounded-2xl bg-background-secondary"></div>
          </div>
        )}

        {!loading && profile && (
          <>
            <WithdrawSummary profile={profile} userRole={userRole} />
            {userRole === "client" && (
              <ClientWithdrawForm user={user} profile={profile} />
            )}
            {userRole === "freelancer" && (
              <FreelancerWithdrawForm user={user} profile={profile} />
            )}
            {!userRole && (
              <div className="backdrop-blur-xl border border-border bg-background rounded-2xl p-6 text-center text-text-secondary">
                {t("common.accessRestrictedTitle")}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

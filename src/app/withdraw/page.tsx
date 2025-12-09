"use client";

import { useState, useEffect } from "react";
import WithdrawForm from "./components/WithdrawForm";
import WithdrawSummary from "./components/WithdrawSummary";
import WithdrawHistory from "./components/WithdrawHistory";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/service/profile";

export default function WithdrawPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    getUserProfile(user.uid).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-[#F6F8FF] to-[#EEF1F9]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Skeleton loading */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-28 rounded-2xl bg-white/40 backdrop-blur-lg"></div>
            <div className="h-80 rounded-2xl bg-white/40 backdrop-blur-lg"></div>
            <div className="h-40 rounded-2xl bg-white/40 backdrop-blur-lg"></div>
          </div>
        )}

        {!loading && profile && (
          <>
            <WithdrawSummary profile={profile} />
            <WithdrawForm user={user} profile={profile} />
            <WithdrawHistory userId={user?.uid || ""} />
          </>
        )}
      </div>
    </div>
  );
}

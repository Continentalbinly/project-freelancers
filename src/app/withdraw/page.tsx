"use client";

import { useState, useEffect } from "react";
import WithdrawForm from "./components/WithdrawForm";
import WithdrawSummary from "./components/WithdrawSummary";
import WithdrawHistory from "./components/WithdrawHistory";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/service/profile"; // your function to fetch profile
import GlobalStatus from "../components/GlobalStatus";

export default function WithdrawPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.uid) {
      getUserProfile(user.uid).then(setProfile);
    }
  }, [user]);

  if (!profile)
    return <GlobalStatus type="loading" message="Checking access..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <WithdrawSummary profile={profile} />
      <WithdrawForm user={user} profile={profile} />
      <WithdrawHistory userId={user?.uid || ""} />
    </div>
  );
}

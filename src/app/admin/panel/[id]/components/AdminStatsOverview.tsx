"use client";

import { useEffect, useState } from "react";
import { db } from "@/service/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Users, Folder, CreditCard, Settings } from "lucide-react";
import DashboardCard from "./DashboardCard";
import { formatLAK } from "@/service/currencyUtils";

export default function AdminStatsOverview() {
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    transactions: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 👥 Total users
    const unsubUsers = onSnapshot(collection(db, "profiles"), (snap) => {
      setStats((prev) => ({ ...prev, users: snap.size }));
    });

    // 📂 Total projects
    const unsubProjects = onSnapshot(collection(db, "projects"), (snap) => {
      setStats((prev) => ({ ...prev, projects: snap.size }));
    });

    // 💳 Transactions total & pending
    const unsubTransactions = onSnapshot(
      collection(db, "transactions"),
      (snap) => {
        let totalAmount = 0;
        let pendingCount = 0;

        snap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.amount) totalAmount += Number(data.amount);
          if (data.status === "pending") pendingCount++;
        });

        setStats((prev) => ({
          ...prev,
          transactions: totalAmount,
          pending: pendingCount,
        }));
      }
    );

    setLoading(false);
    return () => {
      unsubUsers();
      unsubProjects();
      unsubTransactions();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardCard
        title="Total Users"
        value={stats.users.toLocaleString()}
        icon={<Users className="w-5 h-5 text-blue-500" />}
        loading={loading}
      />
      <DashboardCard
        title="Total Projects"
        value={stats.projects.toLocaleString()}
        icon={<Folder className="w-5 h-5 text-emerald-500" />}
        loading={loading}
      />
      <DashboardCard
        title="Transactions Total"
        value={formatLAK(stats.transactions)}
        icon={<CreditCard className="w-5 h-5 text-yellow-500" />}
        loading={loading}
      />
      <DashboardCard
        title="Pending Approvals"
        value={stats.pending.toLocaleString()}
        icon={<Settings className="w-5 h-5 text-pink-500" />}
        loading={loading}
      />
    </div>
  );
}

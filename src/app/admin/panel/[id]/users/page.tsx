"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  startAt,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import GlobalStatus from "../../../../components/GlobalStatus";
import UserCard from "./components/UserCard";
import AdminSubHeader from "../components/AdminSubHeader";

export interface UserProfile {
  id: string;
  fullName?: string;
  email?: string;
  userType?: string[] | string;
  isActive?: boolean;
  plan?: string;
  createdAt?: any;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6); // small page for demo
  const [pageCursors, setPageCursors] = useState<any[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // load page 1 on mount
  useEffect(() => {
    loadPage(1);
  }, []);

  async function loadPage(pageNum: number) {
    setLoading(true);
    const profilesRef = collection(db, "profiles");
    let q;

    if (pageNum === 1) {
      q = query(profilesRef, orderBy("createdAt", "desc"), limit(pageSize));
    } else {
      // go forward using last cursor of previous page
      const cursor = pageCursors[pageNum - 2];
      q = query(
        profilesRef,
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(pageSize)
      );
    }

    const snap = await getDocs(q);
    const docs = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as UserProfile)
    );
    setUsers(docs);
    setLoading(false);

    // store cursor for next usage
    if (snap.docs.length > 0) {
      const newCursors = [...pageCursors];
      newCursors[pageNum - 1] = snap.docs[snap.docs.length - 1];
      setPageCursors(newCursors);
    }

    // update nav flags
    setHasPrev(pageNum > 1);
    setHasNext(snap.docs.length === pageSize);
    setPage(pageNum);
  }

  async function handlePrev() {
    if (page <= 1) return;
    setLoading(true);
    const profilesRef = collection(db, "profiles");
    const cursor = pageCursors[page - 2]; // cursor before current
    let q;
    if (page === 2) {
      // back to first page
      q = query(profilesRef, orderBy("createdAt", "desc"), limit(pageSize));
    } else {
      const prevCursor = pageCursors[page - 3];
      q = query(
        profilesRef,
        orderBy("createdAt", "desc"),
        startAfter(prevCursor),
        limit(pageSize)
      );
    }

    const snap = await getDocs(q);
    const docs = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as UserProfile)
    );
    setUsers(docs);
    setLoading(false);
    setHasPrev(page > 2);
    setHasNext(true);
    setPage(page - 1);
  }

  if (loading) {
    return <GlobalStatus type="loading" message="Loading users..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <AdminSubHeader
        title="Manage Users"
        desc="View and manage all registered accounts"
      />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-20">No users found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => (
              <UserCard key={u.id} user={u} />
            ))}
          </div>
        )}

        {/* 🧭 Pagination Controls */}
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
          >
            ‹ Prev
          </button>

          {/* Page numbers */}
          {Array.from({ length: pageCursors.length }, (_, i) => (
            <button
              key={i}
              onClick={() => loadPage(i + 1)}
              className={`px-3 py-1.5 text-sm rounded-md ${
                page === i + 1
                  ? "bg-primary text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          {hasNext && (
            <button
              onClick={() => loadPage(page + 1)}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Next ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

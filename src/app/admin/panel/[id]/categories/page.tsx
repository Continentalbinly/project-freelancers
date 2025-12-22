"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import GlobalStatus from "../../../../components/GlobalStatus";
import CategoriesHeader from "./components/CategoriesHeader";
import CategoriesForm from "./components/CategoriesForm";
import CategoriesTable from "./components/CategoriesTable";
import type { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name_en: string;
  name_lo: string;
  createdAt?: Timestamp | Date | Record<string, unknown>;
}

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name_en: "", name_lo: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // ✅ Admin guard
  useEffect(() => {
    async function checkRole() {
      if (!user?.uid) return setIsAdmin(false);
      const ref = doc(requireDb(), "profiles", user.uid);
      const snap = await getDoc(ref);
      const data = snap.data();
      const type = data?.userType;
      if (Array.isArray(type)) setIsAdmin(type.includes("admin"));
      else setIsAdmin(type === "admin");
    }
    checkRole();
  }, [user]);

  // 🔄 Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    const q = query(collection(requireDb(), "categories"), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Category[];
    setCategories(list);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchCategories();
  }, [isAdmin]);

  // ➕ Add
  const handleAdd = async () => {
    if (!form.name_en.trim() || !form.name_lo.trim()) return;
    setSaving(true);
    await addDoc(collection(requireDb(), "categories"), {
      ...form,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setForm({ name_en: "", name_lo: "" });
    fetchCategories();
    setSaving(false);
  };

  // ✏️ Update
  const handleUpdate = async () => {
    if (!editingId) return;
    setSaving(true);
    await updateDoc(doc(requireDb(), "categories", editingId), {
      ...form,
      updatedAt: serverTimestamp(),
    });
    setEditingId(null);
    setForm({ name_en: "", name_lo: "" });
    fetchCategories();
    setSaving(false);
  };

  // 🗑️ Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    await deleteDoc(doc(requireDb(), "categories", id));
    fetchCategories();
  };

  // 🧭 Edit actions
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name_en: cat.name_en, name_lo: cat.name_lo });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name_en: "", name_lo: "" });
  };

  // ✅ Loading states
  if (isAdmin === null)
    return <GlobalStatus type="loading" message="Checking admin access..." />;
  if (!isAdmin)
    return (
      <GlobalStatus
        type="denied"
        message="🚫 You don’t have permission to access this page."
      />
    );

  return (
    <div className="min-h-screen bg-background">
      <CategoriesHeader />
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <CategoriesForm
            form={form}
            setForm={setForm}
            editingId={editingId}
            saving={saving}
            handleAdd={handleAdd}
            handleUpdate={handleUpdate}
            cancelEdit={cancelEdit}
          />
          <CategoriesTable
            loading={loading}
            categories={categories}
            onEdit={startEdit}
            onDelete={handleDelete}
          />
        </div>
      </section>
    </div>
  );
}

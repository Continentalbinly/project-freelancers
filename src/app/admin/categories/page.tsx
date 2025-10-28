"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { db } from "@/service/firebase";
import {
  FolderPlus,
  Pencil,
  Trash2,
  Loader2,
  Tag,
  ShieldCheck,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name_en: "", name_lo: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // ✅ Check admin role
  useEffect(() => {
    async function checkRole() {
      if (!user?.uid) return setIsAdmin(false);
      const ref = doc(db, "profiles", user.uid);
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
    const q = query(collection(db, "categories"), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setCategories(list);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchCategories();
  }, [isAdmin]);

  // ➕ Add new category
  const handleAdd = async () => {
    if (!form.name_en.trim() || !form.name_lo.trim()) return;
    setSaving(true);
    await addDoc(collection(db, "categories"), {
      name_en: form.name_en.trim(),
      name_lo: form.name_lo.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setForm({ name_en: "", name_lo: "" });
    fetchCategories();
    setSaving(false);
  };

  // ✏️ Update existing category
  const handleUpdate = async () => {
    if (!editingId) return;
    setSaving(true);
    await updateDoc(doc(db, "categories", editingId), {
      name_en: form.name_en.trim(),
      name_lo: form.name_lo.trim(),
      updatedAt: serverTimestamp(),
    });
    setEditingId(null);
    setForm({ name_en: "", name_lo: "" });
    fetchCategories();
    setSaving(false);
  };

  // 🗑️ Delete category
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  // ✏️ Start editing
  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({ name_en: cat.name_en, name_lo: cat.name_lo });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name_en: "", name_lo: "" });
  };

  // 🧭 Role handling UI
  if (isAdmin === null)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-6 h-6 text-primary" />
        <p className="ml-2 text-gray-600">Checking admin access...</p>
      </div>
    );

  if (!isAdmin)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-text-secondary">
        <ShieldCheck className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-lg">
          🚫 You don’t have permission to access this page.
        </p>
      </div>
    );

  // 🧱 Main content
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary flex items-center justify-center gap-2">
            <Tag className="w-7 h-7 text-primary" /> Admin Dashboard —
            Categories
          </h1>
          <p className="text-text-secondary mt-1">
            Manage and translate all category names here.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-primary" />{" "}
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category Name (English)"
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <input
                type="text"
                placeholder="Category Name (Lao)"
                value={form.name_lo}
                onChange={(e) => setForm({ ...form, name_lo: e.target.value })}
                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="flex gap-2">
              {editingId ? (
                <>
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1"
                  >
                    {saving && (
                      <Loader2 className="animate-spin w-4 h-4 text-white" />
                    )}
                    Update
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="border border-border px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1"
                >
                  {saving && (
                    <Loader2 className="animate-spin w-4 h-4 text-white" />
                  )}
                  Add Category
                </button>
              )}
            </div>
          </div>

          {/* Categories Table */}
          <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <Loader2 className="animate-spin w-5 h-5 inline-block mr-2" />
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <p className="p-6 text-center text-gray-500">
                No categories found. Add one above 👆
              </p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 border-b border-border">
                  <tr className="text-left text-gray-700">
                    <th className="py-3 px-4 font-semibold">#</th>
                    <th className="py-3 px-4 font-semibold">Name (EN)</th>
                    <th className="py-3 px-4 font-semibold">Name (LO)</th>
                    <th className="py-3 px-4 font-semibold text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((cat, idx) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                      <td className="py-3 px-4 text-text-primary font-medium">
                        {cat.name_en}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {cat.name_lo || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => startEdit(cat)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

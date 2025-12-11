"use client";

import { FolderPlus, Loader2 } from "lucide-react";

export default function CategoriesForm({
  form,
  setForm,
  editingId,
  saving,
  handleAdd,
  handleUpdate,
  cancelEdit,
}: {
  form: { name_en: string; name_lo: string };
  setForm: (form: { name_en: string; name_lo: string }) => void;
  editingId: string | null;
  saving: boolean;
  handleAdd: () => Promise<void>;
  handleUpdate: () => Promise<void>;
  cancelEdit: () => void;
}) {
  return (
    <div className="rounded-xl shadow-sm border border-border bg-background p-6">
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
          className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <input
          type="text"
          placeholder="Category Name (Lao)"
          value={form.name_lo}
          onChange={(e) => setForm({ ...form, name_lo: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
              className="border border-border px-5 py-2 rounded-lg text-sm font-medium text-text-primary"
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
            {saving && <Loader2 className="animate-spin w-4 h-4 text-white" />}
            Add Category
          </button>
        )}
      </div>
    </div>
  );
}

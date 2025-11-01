"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Category } from "../page";
import CategoryRow from "./CategoryRow";

export default function CategoriesTable({
  loading,
  categories,
  onEdit,
  onDelete,
}: {
  loading: boolean;
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}) {
  if (loading)
    return (
      <div className="p-6 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
        <Loader2 className="animate-spin w-5 h-5 inline-block mr-2" />
        Loading categories...
      </div>
    );

  if (categories.length === 0)
    return (
      <p className="p-6 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
        No categories found. Add one above 👆
      </p>
    );

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-left text-gray-700">
            <th className="py-3 px-4 font-semibold">#</th>
            <th className="py-3 px-4 font-semibold">Name (EN)</th>
            <th className="py-3 px-4 font-semibold">Name (LO)</th>
            <th className="py-3 px-4 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {categories.map((cat, idx) => (
            <CategoryRow
              key={cat.id}
              cat={cat}
              index={idx}
              onEdit={() => onEdit(cat)}
              onDelete={() => onDelete(cat.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

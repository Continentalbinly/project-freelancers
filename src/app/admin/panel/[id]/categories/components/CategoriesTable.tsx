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
      <div className="p-6 text-center text-text-secondary rounded-xl border border-border shadow-sm bg-background">
        <Loader2 className="animate-spin w-5 h-5 inline-block mr-2" />
        Loading categories...
      </div>
    );

  if (categories.length === 0)
    return (
      <p className="p-6 text-center text-text-secondary rounded-xl border border-border shadow-sm bg-background">
        No categories found. Add one above 👆
      </p>
    );

  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm bg-background">
      <table className="w-full border-collapse text-sm">
        <thead className="border-b border-border">
          <tr className="text-left text-text-secondary">
            <th className="py-3 px-4 font-semibold">#</th>
            <th className="py-3 px-4 font-semibold">Name (EN)</th>
            <th className="py-3 px-4 font-semibold">Name (LO)</th>
            <th className="py-3 px-4 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
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
